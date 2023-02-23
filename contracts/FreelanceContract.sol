// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "./utils/randomNumber.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// import "./utils/payments.sol"; // to be added later with openzeppelin payment splitter

// Contract to create a freelance contract

/**
 * @title freelanceContract
 * @dev This contract manage PACT dAPP with main functionallités to create a contract between client to hire a worker to perform a task,
 *      and allows the worker to sign the contract, start working, request client validation,
 *      and for the client to validate the work and allow payment. The client can also cancel the
 *      contract before the worker signs, and the worker can cancel the contract at any time.
 *      If a dispute arises, the client or worker can open a dispute and a jury will be selected randomly
 *      to resolve the dispute. They resolve the dispute by voting on whether the worker or client is
 *      in the right. The jury can also vote to split the payment between the client and worker.
 * @notice This contract is not audited and should not be used in production.
 * @dev This contract is working in progress and is not yet complete.
 * todo: add a function to limit time for the jury to vote and if not call a new jury to vote
 * todo: add a function to limit time for the client to reveal the vote and if not call a new jury to vote
 * todo: add payment splitter to split the payment between the client and worker
 * todo: improve randomness of jury selection to pay less gas
 */
contract freelanceContract is randomNumber, Ownable {
    // State variables
    uint24 public juryLength; // jury length
    // protocol fee
    uint8 public protocolFee; // 5% of the contract price
    uint8 public juryFee; // 5% of the contract price
    address payable protocolAddress; // protocol address

    /**
     * @dev Constructor to set the protocol and jury fees, as well as the jury length
     * @param _protocolFee The protocol fee percentage
     * @param _juryFee The jury fee percentage
     * @param _juryLength The length of time for the jury vote
     */
    constructor(
        uint8 _protocolFee,
        uint8 _juryFee,
        uint24 _juryLength
    ) {
        protocolFee = _protocolFee;
        juryFee = _juryFee;
        juryLength = _juryLength;
        protocolAddress = payable(msg.sender);
    }

    struct ContractPact {
        address payable client; // client address
        address payable worker; // worker address
        bytes32 hashJob; // title + description of the work - should be a hash
        uint256 deadline; // timestamp
        uint256 createAt; // timestamp
        uint256 price; // price of the work in wei
        uint256 disputeId; // dispute id
        ContractState state; // state of the contract
    }

    struct Dispute {
        uint256 disputeId; // dispute id
        uint256 contractId; // contract id
        uint24 totalVoteCount; // jury vote
        uint24 clientVoteCount; // client vote count private until reveal
        uint24 workerVoteCount; // worker vote count private until reveal
        address disputeInitiator; // dispute initiator
        juryMember[] juryMembers; // jury address => jury hasVoted
    }

    struct juryMember {
        uint24 juryId; // jury id
        bool hasVoted; // jury vote
        address payable juryAddress; // jury address
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
        WaitingforJuryVote,
        DisputeClosed,
        ClientLostInDispute,
        WorkerLostInDispute,
        CancelByFreelancer,
        CancelByClient,
        Archived
    }
    // reveal won or lost in dispute after jury vote completed (if jury vote is 50% or more)

    ContractState[] public contractStates; // array of contract states - could be used to display contract states in the frontend

    // Events

    // Event to display contract state change
    event ContractStateChange(
        ContractState previousStatus,
        ContractState newStatus
    );

    event Voted(uint256 disputeId, address juryAddress);

    // Modifiers

    // Modifier to check if the contract is in the correct state
    modifier inState(uint256 _contractId, ContractState _state) {
        require(
            contracts[_contractId].state == _state,
            "Contract is not in the correct state."
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

    // Functions admin

    /**
     * @dev Function to set the protocol fee percentage.
     * @notice Only the owner of the contract can call this function.
     * @param _protocolFee The new protocol fee percentage to be set.
     */
    function setProtocolFee(uint8 _protocolFee) public onlyOwner {
        protocolFee = _protocolFee;
    }

    /**
     * @dev Function to set the jury fee percentage.
     * @notice Only the owner of the contract can call this function.
     * @param _juryFee The new jury fee percentage to be set.
     */
    function setJuryFee(uint8 _juryFee) public onlyOwner {
        juryFee = _juryFee;
    }

    /**
     * @dev Function to set the length of time in days that a jury member can vote in a dispute.
     * @notice Only the owner of the contract can call this function.
     * @param _juryLength The new length of time in days to be set.
     */
    function setJuryLength(uint8 _juryLength) public onlyOwner {
        juryLength = _juryLength;
    }

    /**
     * @dev Add a new worker to the workers mapping.
     * @notice Caller should be a non-zero addresses and the worker doesn't already exist.
     */
    function addWorker() external {
        require(msg.sender != address(0), "Invalid address.");
        require(workers[msg.sender] == false, "Worker already exists.");
        workers[msg.sender] = true;
    }

    /**
     * @dev Add a new client to the clients mapping.
     * @notice Caller should be a non-zero addresses and the client doesn't already exist.
     */
    function addClient() external {
        require(msg.sender != address(0), "Invalid address.");
        require(clients[msg.sender] == false, "Client already exists.");
        clients[msg.sender] = true;
    }

    /**
     * @dev Add a new jury to the juryPool mapping.
     * @notice Caller should be a non-zero addresses
     * Increments the juryCounter, and adds the sender to the juryPool with the new jury ID.
     */
    function addJury() external {
        require(msg.sender != address(0), "Invalid address.");
        // add a new jury of juryPool
        juryCounter++;
        juryPool[juryCounter] = msg.sender;
    }

    /**
     * @dev  Function to remove a client from the clients mapping
     *@notice Caller should be a non-zero addresses and the client already exists.
     * @notice If the client does not exist, the function will revert.
     */
    function removeClient() external {
        require(msg.sender != address(0), "Invalid address.");
        require(clients[msg.sender] == true, "Client does not exist.");
        clients[msg.sender] = false;
    }

    /**
     * @dev  Function to remove a worker from the workers mapping
     * @notice If the worker to be removed does not exist in the workers mapping, the function will revert.
     */
    function removeWorker() external {
        require(msg.sender != address(0), "Invalid address.");
        require(workers[msg.sender] == true, "Worker does not exist.");
        workers[msg.sender] = false;
    }

    /**
     * @dev Function to remove a jury from the juryPool mapping
     */
    function removeJury() external {
        require(msg.sender != address(0), "Invalid address.");
        require(isJury(msg.sender) == true, "Jury does not exist.");
        // remove a jury of juryPool
        bool found = false;
        for (uint256 i = 0; i < juryCounter && !found; i++) {
            if (juryPool[i] == msg.sender) {
                found = true;
                delete juryPool[i];
            }
        }
        juryCounter--;
    }

    /**
     * @dev Function to check if the caller is registered as a client
     * @return a boolean value indicating if the sender is a client (true) or not (false)
     */
    function isClient() external view returns (bool) {
        if (clients[msg.sender] == true) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * @dev Function to check if the caller is registered as a worker
     * @return a boolean value indicating if the sender is a worker (true) or not (false)
     */
    function isWorker() external view returns (bool) {
        if (workers[msg.sender] == true) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * @dev Function to check if the caller is registered as a jury
     * @param _address the address to be checked
     * @return a boolean value indicating if the sender is a jury (true) or not (false)
     */
    function isJury(address _address) public view returns (bool) {
        bool stop = false;
        for (uint256 i = 0; i < juryCounter && !stop; i++) {
            if (juryPool[i] == _address) {
                stop = true;
                return true;
            }
        }
        return false;
    }

    /**
     * @dev Function to create a new contract sent by a client
     * @param _deadline the deadline for the contract
     * @param _today the current date
     * @param _hash the hash of the job bytes32 of title and description
     */
    function createContract(
        uint256 _deadline,
        uint256 _today,
        bytes32 _hash
    ) public payable {
        require(
            clients[msg.sender] == true,
            "Only client can create a contract."
        );
        require(msg.value > 0, "The price must be greater than 0.");
        contractCounter++;
        contracts[contractCounter] = ContractPact({
            client: payable(msg.sender),
            worker: payable(address(0)),
            hashJob: _hash,
            createAt: _today,
            deadline: _deadline,
            price: msg.value,
            state: ContractState.WaitingWorkerSign,
            disputeId: 0
        });
    }

    /**
     * @dev Allows the client to cancel the contract only if the worker didn't sign the contract yet.
     * @param _contractId The ID of the contract to be canceled
     */
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

    /**
     * @dev Allows the worker to cancel the contract
     * @param _contractId The ID of the contract to be canceled
     */
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

    /**
     * @dev Allows the worker to take the job
     * @param _contractId The ID of the contract to be signed
     */
    function signContract(uint256 _contractId)
        external
        inState(_contractId, ContractState.WaitingWorkerSign)
    {
        ContractPact storage thisContract = contracts[_contractId];
        require(
            thisContract.state == ContractState.WaitingWorkerSign,
            "The contract has already been signed."
        );

        thisContract.worker = payable(msg.sender);
        thisContract.state = ContractState.WorkStarted;

        emit ContractStateChange(
            ContractState.WaitingWorkerSign,
            ContractState.WorkStarted
        );
    }

    /**
     * @dev Allows the worker to request client validation to the client when the work is done
     * @param _contractId The ID of the contract to be reviewed by the client.
     */
    function requestClientValidation(uint256 _contractId)
        external
        inState(_contractId, ContractState.WorkStarted)
        onlyWorker(_contractId)
    {
        ContractPact storage thisContract = contracts[_contractId];
        thisContract.state = ContractState.WaitingClientReview;
        emit ContractStateChange(
            ContractState.WorkStarted,
            ContractState.WaitingClientReview
        );
    }

    /**
     * @dev Allows the client to validate the work done by the worker
     * @param _contractId The ID of the contract to be validated
     */
    function setIsFinishedAndAllowPayment(uint256 _contractId)
        external
        inState(_contractId, ContractState.WaitingClientReview)
        onlyClient(_contractId)
    {
        ContractPact storage thisContract = contracts[_contractId];
        thisContract.state = ContractState.WorkFinishedSuccessufully;
    }

    /**
     * @dev Allows the client or worker to open a dispute
     * @param _contractId The ID of the contract to open a dispute
     */
    function openDispute(uint256 _contractId)
        external
        onlyClientOrWorker(_contractId)
    {
        require(
            juryCounter > juryLength,
            "Not enough jury in juryPool to open a dispute."
        );
        require(
            contracts[_contractId].state == ContractState.WorkStarted ||
                contracts[_contractId].state ==
                ContractState.WaitingClientReview,
            "The contract must be in work started or waiting client review state."
        );

        ContractPact storage thisContract = contracts[_contractId];
        thisContract.state = ContractState.DisputeOpened;
        emit ContractStateChange(
            ContractState.WorkStarted,
            ContractState.DisputeOpened
        );

        disputeCounter++;
        Dispute storage thisDispute = disputes[disputeCounter];
        thisDispute.contractId = _contractId;
        thisDispute.disputeInitiator = msg.sender;
        thisContract.disputeId = disputeCounter;
    }

    /**
     * @notice Selects a jury member for a given contract's dispute
     * @dev Allows the client or worker to open a dispute
     * @param _contractId The ID of the contract in dispute
     */
    function selectJuryMember(uint256 _contractId) external {
        // address[] memory selectedJurors = new address[](juryLength);
        address[] memory selectedJurors = new address[](juryLength);

        ContractPact storage thisContract = contracts[_contractId];
        Dispute storage _thisDispute = disputes[thisContract.disputeId];

        // select a jury member
        juryMember memory jury;

        address jurySelected = msg.sender;
        for (uint24 i = 0; i < juryLength; i++) {
            uint24 _seed = i;
            // uint256 randomIndex = random(_seed);
            // randomIndex = randomIndex % juryCounter;
            jurySelected = generateRandomJury(_contractId, _seed);
            bool selected = false;
            for (uint24 count = 0; count < selectedJurors.length; count++) {
                if (jurySelected == selectedJurors[count]) {
                    selected = true;
                    break;
                }
                selected = false;
            }
            // check if juryselected is already selected in mapping
            // bool selected = selectedJurors[jurySelected];

            if (
                _thisDispute.juryMembers.length < juryLength &&
                selected == false
            ) {
                // selectedJurors[i] = jurySelected;
                // selectedJurors[jurySelected] = true;
                jury = juryMember({
                    juryId: i,
                    juryAddress: payable(jurySelected),
                    hasVoted: false
                });
                _thisDispute.juryMembers.push(jury);
            } else {
                i--;
                continue;
            }
        }
        thisContract.state = ContractState.WaitingforJuryVote;
        emit ContractStateChange(
            ContractState.DisputeOpened,
            ContractState.WaitingforJuryVote
        );
    }

    /**
     * @notice Generates a random jury member from the jury pool, excluding the client and worker of the contract
     * @dev Uses a given seed value to generate a random index in the jury pool and returns the corresponding address if it is not the client or worker of the contract
     * @param _contractId The ID of the contract in dispute
     * @param _seed The seed value to use for random number generation
     * @return The address of the randomly selected jury member
     */

    function generateRandomJury(uint256 _contractId, uint24 _seed)
        internal
        view
        returns (address)
    {
        ContractPact storage thisContract = contracts[_contractId];
        address jurySelected = msg.sender;
        uint256 randomIndex;
        for (uint8 i = 0; i <= 3; i++) {
            randomIndex = random(_seed) % juryCounter;
            jurySelected = juryPool[randomIndex];
            if (
                jurySelected != address(0) &&
                jurySelected != thisContract.client &&
                jurySelected != thisContract.worker
            ) {
                break;
            }
        }
        return jurySelected;
    }

    /**
     * @notice Checks if a given address is a member of the jury for a particular dispute
     * @param _disputeId The ID of the dispute to check
     * @param _juryAddress The address to check for membership in the dispute's jury
     * @return true if the address is a member of the dispute's jury, false otherwise
     */
    function isJuryInDispute(uint256 _disputeId, address _juryAddress)
        external
        view
        returns (bool)
    {
        Dispute storage thisDispute = disputes[_disputeId];
        for (uint256 i = 0; i < thisDispute.juryMembers.length; i++) {
            if (thisDispute.juryMembers[i].juryAddress == _juryAddress) {
                return true;
            }
        }
        return false;
    }

    /**
     * @notice Returns the addresses of all the jury members for a given dispute
     * @param _disputeId The ID of the dispute to get jury members for
     * @return An array of addresses representing the jury members for the dispute
     */
    function getJuryMembers(uint256 _disputeId)
        external
        view
        returns (address[] memory)
    {
        Dispute storage thisDispute = disputes[_disputeId];
        address[] memory juryMembers = new address[](
            thisDispute.juryMembers.length
        );
        for (uint256 i = 0; i < thisDispute.juryMembers.length; i++) {
            juryMembers[i] = thisDispute.juryMembers[i].juryAddress;
        }
        return juryMembers;
    }

    /**
     * @notice Checks if a given jury member has voted on a specific dispute
     * @param _disputeId The ID of the dispute to check
     * @param _juryAddress The address of the jury member to check for a vote
     * @return true if the jury member has voted on the dispute, false otherwise
     */
    function hasVoted(uint256 _disputeId, address _juryAddress)
        external
        view
        returns (bool)
    {
        Dispute storage thisDispute = disputes[_disputeId];
        bool result = false;
        for (uint256 i = 0; i < thisDispute.juryMembers.length; i++) {
            if (
                thisDispute.juryMembers[i].juryAddress == _juryAddress &&
                thisDispute.juryMembers[i].hasVoted == true
            ) {
                result = true;
            }
        }
        return result;
    }
    
    /**
     * @dev This function for the jury to vote for the dispute between the client and the worker
     * @param _contractId The ID of the contract.
     * @param _vote The vote of the jury member.
     */
    function vote(uint256 _contractId, bool _vote)
        external
        inState(_contractId, ContractState.WaitingforJuryVote)
    {
        ContractPact storage thisContract = contracts[_contractId];
        Dispute storage thisDispute = disputes[thisContract.disputeId];

        // get the jury member id in the disput
        uint24 juryId = 0;
        uint256 juryMemberLength = thisDispute.juryMembers.length;
        for (uint24 i = 0; i < juryMemberLength; i++) {
            if (thisDispute.juryMembers[i].juryAddress == msg.sender) {
                juryId = i;
            }
        }
        //"The jury member has already voted."
        require(
            thisDispute.juryMembers[juryId].hasVoted == false,
            "The jury member has already voted."
        );

        thisDispute.juryMembers[juryId].hasVoted = true;
        thisDispute.totalVoteCount++;
        if (_vote) {
            thisDispute.clientVoteCount++;
        } else {
            thisDispute.workerVoteCount++;
        }
        if (thisDispute.totalVoteCount == juryMemberLength) {
            thisContract.state = ContractState.DisputeClosed;
            emit ContractStateChange(
                ContractState.WaitingforJuryVote,
                ContractState.DisputeClosed
            );
        }
    }

    /**
     * @dev This function reveals the state of a dispute and determines whether the client or the worker won the dispute.
     * @param _contractId The ID of the contract.
     */
    function revealState(uint256 _contractId)
        external
        inState(_contractId, ContractState.DisputeClosed)
    {
        ContractPact storage thisContract = contracts[_contractId];
        Dispute storage thisDispute = disputes[thisContract.disputeId];

        if (thisDispute.clientVoteCount > thisDispute.workerVoteCount) {
            thisContract.state = ContractState.WorkerLostInDispute;
            emit ContractStateChange(
                ContractState.DisputeClosed,
                ContractState.WorkerLostInDispute
            );
        } else {
            thisContract.state = ContractState.ClientLostInDispute;
            emit ContractStateChange(
                ContractState.DisputeClosed,
                ContractState.ClientLostInDispute
            );
        }
    }

    /**
     * @dev This function allows the client or worker to pull payment and split if jury dispute with jury Members and protocol share and the worker if he won the dispute.
     * @param _contractId The ID of the contract.
     */
    //TODO: ADAPT AND USE PAYMENT SPLITTER
    function pullPayment(uint256 _contractId)
        external
        onlyClientOrWorker(_contractId)
    {
        ContractPact storage thisContract = contracts[_contractId];
        require(
            thisContract.price > 0,
            "This job contract balance is equal to zero"
        );

        // amount in wei
        uint256 amount = thisContract.price;
        uint256 _disputeId = thisContract.disputeId;

        // if there is no dispute
        // if the job have been canceled by the client or freelance
        if (
            thisContract.state == ContractState.CancelByFreelancer ||
            thisContract.state == ContractState.CancelByClient
        ) {
            address payable clientAddress = thisContract.client;
            thisContract.state = ContractState.Archived;
            thisContract.price = 0;
            (bool success, ) = clientAddress.call{value: amount}("");
            require(success, "Transfer failed.");
        }
        // if the job is finished successfully
        else if (
            thisContract.state == ContractState.WorkFinishedSuccessufully
        ) {
            address WinnerAddress = thisContract.worker;
            uint256 WinnerShare = amount * (1 - (protocolFee / 100));
            // protocol address and share
            address[] memory payees = new address[](2);
            payees[0] = WinnerAddress;
            payees[1] = protocolAddress;
            uint256[] memory shares = new uint256[](2);
            shares[0] = WinnerShare;
            shares[1] = amount * (protocolFee / 100);

            // Update state and price
            thisContract.state = ContractState.Archived;
            thisContract.price = 0;
            // create a payment
            for (uint256 i = 0; i < payees.length; i++) {
                (bool success, ) = payees[i].call{value: shares[i]}("");
                require(success, "Transfer failed.");
            }
        }
        //if dispute existe and the client or worker lost the dispute
        // As dispute finished split payment between jurors, protocol and who wants
        else if (thisContract.state == ContractState.ClientLostInDispute) {
            Dispute storage thisDispute = disputes[_disputeId];
            uint256 juryMemberLength = thisDispute.juryMembers.length;
            address[] memory payees = new address[](juryMemberLength + 2);
            uint256[] memory shares = new uint256[](juryMemberLength + 2);

            // Update state and price
            thisContract.state = ContractState.Archived;
            thisContract.price = 0;

            // get jury members address and share

            address WinnerAddress = thisContract.worker;
            uint256 JuryShare = ((juryFee / juryMemberLength) * amount) / 100;
            uint256 ProtocolShare = amount * (protocolFee / 100);
            uint256 WinnerShare = amount - JuryShare - ProtocolShare;

            payees[0] = WinnerAddress;
            shares[0] = WinnerShare;
            payees[1] = protocolAddress;
            shares[1] = ProtocolShare;
            for (uint256 i = 0; i < juryMemberLength; i++) {
                payees[i + 2] = thisDispute.juryMembers[i].juryAddress;
                shares[i + 2] = amount * (juryFee / juryMemberLength / 100);
            }
            // create a payment
            for (uint256 i = 0; i < payees.length; i++) {
                (bool success, ) = payees[i].call{value: shares[i]}("");
                require(success, "Transfer failed.");
            }
        } else if (thisContract.state == ContractState.WorkerLostInDispute) {
            // jury members address and share
            Dispute storage thisDispute = disputes[_disputeId];
            uint256 juryMemberLength = thisDispute.juryMembers.length;
            address[] memory payees = new address[](juryMemberLength + 2);
            uint256[] memory shares = new uint256[](juryMemberLength + 2);

            // Update state and price
            thisContract.state = ContractState.Archived;
            thisContract.price = 0;

            // get jury members address and share
            address WinnerAddress = thisContract.client;
            uint256 JuryShare = ((juryFee / juryMemberLength) * amount) / 100;
            uint256 ProtocolShare = amount * (protocolFee / 100);
            uint256 WinnerShare = amount - JuryShare - ProtocolShare;

            payees[0] = WinnerAddress;
            shares[0] = WinnerShare;
            payees[1] = protocolAddress;
            shares[1] = amount * (protocolFee / 100);
            for (uint256 i = 0; i < juryMemberLength; i++) {
                payees[i + 2] = thisDispute.juryMembers[i].juryAddress;
                shares[i + 2] = (amount * (juryFee / juryMemberLength)) / 100;
            }
            // create a payment
            for (uint256 i = 0; i < payees.length; i++) {
                (bool success, ) = payees[i].call{value: shares[i]}("");
                require(success, "Transfer failed.");
            }
        } else {
            revert("No allowed to pull payment");
        }
    }
}
