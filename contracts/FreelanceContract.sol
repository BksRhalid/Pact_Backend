// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./utils/randomNumber.sol";

contract FreelanceContract is randomNumber {
    // State variables

    struct ContractPact {
        address client; // client address
        address worker; // worker address
        bytes32 hashJob; // title + description of the work - should be a hash
        uint256 deadline; // timestamp
        uint256 createAt; // timestamp
        uint256 price; // price of the work in wei
        ContractState state; // state of the contract
    }

    struct Dispute {
        uint256 disputeId; // dispute id
        uint256 contractId; // contract id
        address disputeInitiator; // dispute initiator
        uint256 totalVoteCount; // jury vote
        uint256 clientVoteCount; // client vote count
        uint256 workerVoteCount; // worker vote count
        mapping(address => bool) disputeJury; // jury address => jury vote
        DisputeState state;
    }

    // Mappings

    mapping(address => bool) public workers; // mapping of workers - not related to contracts creation - could be used to display workers in the frontend
    mapping(address => bool) public clients; // mapping of clients - not related to contracts creation - could be used to display clients in the frontend
    mapping(uint256 => Dispute) public disputes; // mapping of disputes
    mapping(uint256 => ContractPact) public contracts; // mapping of contracts
    mapping(uint256 => address) public juryPool; // mapping of jury (jury address => jury struct)

    uint256 public contractCounter = 0; // counter of contracts
    uint256 public disputeCounter = 0; // counter of disputes
    uint256 public juryCounter = 0; // counter of jury

    enum ContractState {
        WaitingWorkerSign,
        WorkStarted,
        WaitingClientReview,
        WorkFinishedSuccessufully,
        DisputeOpened,
        ClientLostInCourt,
        WorkerLostInCourt,
        DisputeClosed,
        CancelByFreelancer,
        CancelByClient,
        Archived
    }
    enum DisputeState {
        WaitingJuryVote,
        ClientWon,
        WorkerWon,
        DisputeClosed
    }

    ContractState[] public contractStates; // array of contract states - could be used to display contract states in the frontend
    DisputeState[] public disputeStates; // array of contract states - could be used to display contract states in the frontend

    // Events

    // Event to display contract state change
    event ContractStateChange(
        ContractState previousStatus,
        ContractState newStatus
    );
    event DisputeStateChange(
        DisputeState previousStatus,
        DisputeState newStatus
    );
    // Event to display contract creation by client
    event ContractCreated(
        uint256 contractId,
        address client,
        address worker,
        bytes32 hashJob,
        uint256 createAt,
        uint256 deadline,
        uint256 price,
        ContractState state
    );

    event DisputeCreated(
        uint256 disputeId,
        uint256 contractId,
        address disputeInitiator
    );

    // Event to display contract signing by worker
    event ContractSigned(uint256 contractId, address worker);

    // Event to display work is finish by worker
    event ContractReviewRequested(uint256 contractId, address worker);

    // Event to display work is validated by client
    event ContractIsFinished(uint256 contractId);

    event JuryVote(uint256 disputeId);

    // Modifiers

    // Modifier to check if the contract is in the correct state
    modifier inState(uint256 _contractId, ContractState _state) {
        require(
            contracts[_contractId].state == _state,
            "Contract is not in the correct state."
        );
        _;
    }

    // Modifier to check if the dispute is in the correct state
    modifier inStateDispute(uint256 _disputeId, DisputeState _state) {
        require(
            disputes[_disputeId].state == _state,
            "Dispute is not in the correct state."
        );
        _;
    }

    modifier onlyWorker(uint256 _contractId) {
        require(
            contracts[_contractId].worker == msg.sender,
            "Only the worker can call this function."
        );
        _;
    }

    modifier onlyClient(uint256 _contractId) {
        require(
            contracts[_contractId].client == msg.sender,
            "Only the client can call this function."
        );
        _;
    }

    modifier onlyClientOrWorker(uint256 _contractId) {
        require(
            contracts[_contractId].client == msg.sender ||
                contracts[_contractId].worker == msg.sender,
            "Only the client or the worker can call this function."
        );
        _;
    }

    modifier onlyJury(uint256 _disputeId) {
        require(
            disputes[_disputeId].disputeJury[msg.sender] == true,
            "Only the jury can call this function."
        );
        _;
    }

    // TODO : add modifier to check only jury of the dispute can call the function

    // Functions

    // Function to add a worker to the workers mapping

    function addWorker() external {
        require(msg.sender != address(0), "Invalid address.");
        require(workers[msg.sender] == false, "Worker already exists.");
        workers[msg.sender] = true;
    }

    // Function to add a client to the clients mapping

    function addClient() external {
        require(msg.sender != address(0), "Invalid address.");
        require(clients[msg.sender] == false, "Client already exists.");
        clients[msg.sender] = true;
    }

    // Function to add a jury to the clients mapping

    function addJury() external {
        require(msg.sender != address(0), "Invalid address.");
        // have to be a worker or client before to apply to be a jury

        // add a new jury of juryPool

        juryCounter++;
        juryPool[juryCounter] = msg.sender;
    }

    function isClient() external view returns (bool) {
        if (clients[msg.sender] == true) {
            return true;
        } else {
            return false;
        }
    }

    function isWorker() external view returns (bool) {
        if (workers[msg.sender] == true) {
            return true;
        } else {
            return false;
        }
    }

    // Function to create a new contract send by client
    function createContract(
        uint256 _deadline,
        uint256 _today,
        bytes32 _hash
    ) public payable {
        require(
            clients[msg.sender] == true,
            "Only client can create a contract."
        );
        contractCounter++;
        contracts[contractCounter] = ContractPact({
            client: msg.sender,
            worker: address(0),
            hashJob: _hash,
            createAt: _today,
            deadline: _deadline,
            price: msg.value,
            state: ContractState.WaitingWorkerSign
        });

        emit ContractCreated(
            contractCounter,
            msg.sender,
            address(0),
            _hash,
            _today,
            _deadline,
            msg.value,
            ContractState.WaitingWorkerSign
        );
    }

    // Function for the client to cancel the contract only if the worker didn't sign the contract

    function cancelContractByClient(uint256 _contractId)
        external
        inState(_contractId, ContractState.WaitingWorkerSign)
        onlyClient(_contractId)
    {
        ContractPact storage thisContract = contracts[_contractId];
        require(
            thisContract.state == ContractState.WaitingWorkerSign,
            "The contract has already been signed."
        );
        thisContract.state = ContractState.CancelByClient;
        emit ContractStateChange(
            ContractState.WaitingWorkerSign,
            ContractState.CancelByClient
        );
    }

    // Function for the worker to cancel the contract

    function cancelContractByWorker(uint256 _contractId)
        external
        inState(_contractId, ContractState.WorkStarted)
        onlyWorker(_contractId)
    {
        ContractPact storage thisContract = contracts[_contractId];
        thisContract.state = ContractState.CancelByFreelancer;
        emit ContractStateChange(
            ContractState.WorkStarted,
            ContractState.CancelByFreelancer
        );
    }

    // Function for the worker to sign the contract
    function signContract(uint256 _contractId)
        external
        inState(_contractId, ContractState.WaitingWorkerSign)
        onlyWorker(_contractId)
    {
        ContractPact storage thisContract = contracts[_contractId];
        require(
            thisContract.worker == msg.sender,
            "Only the worker can sign this contract."
        );
        require(
            thisContract.state == ContractState.WaitingWorkerSign,
            "The contract has already been signed."
        );

        thisContract.state = ContractState.WorkStarted;

        emit ContractSigned(_contractId, msg.sender);
        emit ContractStateChange(
            ContractState.WaitingWorkerSign,
            ContractState.WorkStarted
        );
    }

    // Function to get the contract details

    function getContractDetails(uint256 _contractId)
        external
        view
        returns (
            uint256 contractId,
            address client,
            address worker,
            bytes32 hashJob,
            uint256 deadline,
            uint256 price
        )
    {
        ContractPact storage thisContract = contracts[_contractId];
        contractId = _contractId;
        client = thisContract.client;
        worker = thisContract.worker;
        hashJob = thisContract.hashJob;
        deadline = thisContract.deadline;
        price = thisContract.price;
    }

    // Function for the client to validate the contract

    function setIsFinishedAndAllowPayment(uint256 _contractId)
        external
        inState(_contractId, ContractState.WaitingClientReview)
        onlyClient(_contractId)
    {
        ContractPact storage thisContract = contracts[_contractId];
        thisContract.state = ContractState.WorkFinishedSuccessufully;
        emit ContractIsFinished(_contractId);
    }

    // Function for the client or worker to open a dispute
    function openDispute(uint256 _contractId)
        external
        inState(_contractId, ContractState.WorkStarted)
        onlyClientOrWorker(_contractId)
    {
        ContractPact storage thisContract = contracts[_contractId];
        thisContract.state = ContractState.DisputeOpened;
        emit ContractStateChange(
            ContractState.WorkStarted,
            ContractState.DisputeOpened
        );

        // create a new dispute
        disputeCounter++;
        Dispute storage thisDispute = disputes[disputeCounter];
        thisDispute.contractId = _contractId;
        thisDispute.disputeInitiator = msg.sender;
        thisDispute.state = DisputeState.WaitingJuryVote;

        // select a jury member
        uint256 juryIndex = 0;

        for (uint256 i = 0; i < 12; i++) {
            uint256 randomIndex = random(juryCounter);
            address jurySelected = juryPool[randomIndex];
            // address jurySelected = juryPool[juryIndex].juryAddress;
            if (
                jurySelected != thisContract.client &&
                jurySelected != thisContract.worker
            ) {
                thisDispute.disputeJury[jurySelected] = false;
                juryIndex++;
            } else {
                i--;
            }
        }
        // create a new dispute
    }

    // Function to get the disputeJury list of a dispute

    function getDisputeJury(uint256 _disputeId)
        external
        view
        returns (address[] memory juryList)
    {
        Dispute storage thisDispute = disputes[_disputeId];
        juryList = new address[](12);
        uint256 index = 0;
        //get adress mapping
        for (uint256 i = 0; i < juryCounter; i++) {
            if (thisDispute.disputeJury[juryPool[i]] == false) {
                juryList[index] = juryPool[i];
                index++;
            }
        }
        return juryList;
    }

    // Function for the jury to vote for the dispute between the client and the worker

    function vote(uint256 _disputeId, bool _vote)
        external
        inStateDispute(_disputeId, DisputeState.WaitingJuryVote)
    {
        Dispute storage thisDispute = disputes[_disputeId];

        // get the jury member

        require(
            thisDispute.state == DisputeState.WaitingJuryVote,
            "The dispute is already closed."
        );
        require(
            thisDispute.disputeJury[msg.sender] == false,
            "The jury member has already voted."
        );
        thisDispute.disputeJury[msg.sender] == true;
        thisDispute.totalVoteCount++;
        if (_vote) {
            thisDispute.clientVoteCount++;
        } else {
            thisDispute.workerVoteCount++;
        }
        emit JuryVote(_disputeId);
        if (thisDispute.totalVoteCount == 12) {
            thisDispute.state = DisputeState.DisputeClosed;
            emit DisputeStateChange(
                DisputeState.WaitingJuryVote,
                DisputeState.DisputeClosed
            );
            if (thisDispute.clientVoteCount > thisDispute.workerVoteCount) {
                ContractPact storage thisContract = contracts[
                    thisDispute.contractId
                ];
                thisContract.state = ContractState.WorkerLostInCourt;
                emit ContractIsFinished(thisDispute.contractId);
            } else {
                ContractPact storage thisContract = contracts[
                    thisDispute.contractId
                ];
                thisContract.state = ContractState.ClientLostInCourt;
                emit ContractIsFinished(thisDispute.contractId);
            }
        }
    }
}
