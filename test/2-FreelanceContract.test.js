const { setBalance } = require("@nomicfoundation/hardhat-network-helpers");
const { assert, expect, expectRevert, withNamedArgs } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const {
  Contract,
} = require("hardhat/internal/hardhat-network/stack-traces/model");
const { developmentChains } = require("../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Units tests on freelance access functions", function () {
      let accounts;

      before(async () => {
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        addressZero = "0x0000000000000000000000000000000000000000";
      });

      describe("🔎 Deployment hardhat deploy testing", async function () {
        it("should deploy the smart contract", async function () {
          await deployments.fixture(["freelancecontract"]);
          freelancecontract = await ethers.getContract("freelanceContract");
        });
      });

      //// ::::::::::::: UNIT TEST FOR CREATION USER JURY, CLIENT & WORKER ::::::::::::: //
      //// addClient // addJury // addWorker // isClient // isWorker // isJury
      describe("🔎 Test freelance contract set-up", function () {
        beforeEach(async () => {
          await deployments.fixture(["freelancecontract"]);
          freelancecontract = await ethers.getContract("freelanceContract");
        });
        // Test addWorker
        it("should ADD a new worker", async function () {
          expect(await freelancecontract.workers(accounts[1].address)).to.be
            .false;
          expect(await freelancecontract.connect(accounts[1]).isWorker()).to.be
            .false;
          await freelancecontract.connect(accounts[1]).addWorker();
          expect(await freelancecontract.workers(accounts[1].address)).to.be
            .true;
          expect(await freelancecontract.connect(accounts[1]).isWorker()).to.be
            .true;
        });
        it("should REMOVE the worker", async function () {
          expect(await freelancecontract.workers(accounts[1].address)).to.be
            .false;
          await freelancecontract.connect(accounts[1]).addWorker();
          expect(await freelancecontract.workers(accounts[1].address)).to.be
            .true;
          await freelancecontract.connect(accounts[1]).removeWorker();
          expect(await freelancecontract.workers(accounts[1].address)).to.be
            .false;
          await freelancecontract.connect(accounts[1]).addWorker();
          await expect(
            freelancecontract.connect(accounts[1]).addWorker()
          ).to.be.revertedWith("Worker already exists.");
        });
        // Test addClient
        it("should ADD a new client", async function () {
          expect(await freelancecontract.clients(accounts[1].address)).to.be
            .false;
          await freelancecontract.connect(accounts[1]).addClient();
          expect(await freelancecontract.clients(accounts[1].address)).to.be
            .true;
          expect(await freelancecontract.connect(accounts[1]).isClient()).to.be
            .true;
        });
        it("should REMOVE the client", async function () {
          expect(await freelancecontract.clients(accounts[1].address)).to.be
            .false;
          await freelancecontract.connect(accounts[1]).addClient();
          expect(await freelancecontract.clients(accounts[1].address)).to.be
            .true;
          await freelancecontract.connect(accounts[1]).removeClient();
          expect(await freelancecontract.clients(accounts[1].address)).to.be
            .false;
          // isClient should return false
          expect(await freelancecontract.connect(accounts[1]).isClient()).to.be
            .false;

          await freelancecontract.connect(accounts[1]).addClient();
          await expect(
            freelancecontract.connect(accounts[1]).addClient()
          ).to.be.revertedWith("Client already exists.");
        });
        // Test addJury
        it("should ADD a new jury member", async function () {
          expect(await freelancecontract.juryPool(1)).equal(addressZero);
          expect(await freelancecontract.isJury(accounts[1].address)).to.be
            .false;
          await freelancecontract.connect(accounts[1]).addJury();
          expect(await freelancecontract.juryPool(1)).equal(
            accounts[1].address
          );
        });
      });

      // ::::::::::::: UNIT TEST FOR CREATION CONTRACT ::::::::::::: //

      describe("🔎  Test freelance contract function creation unit test", async function () {
        beforeEach(async function () {
          await deployments.fixture(["freelancecontract"]);
          freelancecontract = await ethers.getContract("freelanceContract");
          client = accounts[1];
          worker = accounts[2];
          await freelancecontract.connect(client).addClient();
          await freelancecontract.connect(worker).addWorker();
        });
        // Test createContract from client
        it("should CREATE a new contract called by Client", async function () {
          _price = 1;
          _deadline = 100;
          _today = 0;
          title = "title";
          description = "description";
          _hash = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes(title + description)
          );
          expect(await freelancecontract.contractCounter()).equal(0);
          await freelancecontract
            .connect(client)
            .createContract(_deadline, _today, _hash, { value: _price });
          expect(await freelancecontract.contractCounter()).equal(1);
        });
        it("should REVERT if price = 0 ", async function () {
          _price = 0;
          _deadline = 100;
          _today = 0;
          title = "title";
          description = "description";
          _hash = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes(title + description)
          );
          await expect(
            freelancecontract
              .connect(client)
              .createContract(_deadline, _today, _hash, { value: _price })
          ).to.be.revertedWith("The price must be greater than 0.");
        });
      });

      // createContract // contractCounter // cancelContractByClient // cancelContractByWorker // contractStates // signContract

      describe("🔎  Test freelance contract function creation unit test", async function () {
        beforeEach(async function () {
          await deployments.fixture(["freelancecontract"]);
          freelancecontract = await ethers.getContract("freelanceContract");
          client = accounts[1];
          worker = accounts[2];
          await freelancecontract.connect(client).addClient();
          await freelancecontract.connect(worker).addWorker();
          _price = 1;
          _deadline = 100;
          _today = 0;
          title = "title";
          description = "description";
          _hash = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes(title + description)
          );
        });
        // Test createContract from client
        it("should CREATE a new contract called by Client", async function () {
          expect(await freelancecontract.contractCounter()).equal(0);
          await freelancecontract
            .connect(client)
            .createContract(_deadline, _today, _hash, { value: _price });
          expect(await freelancecontract.contractCounter()).equal(1);
        });
        it("should NOT CREATE a new contract called by Worker", async function () {
          expect(await freelancecontract.contractCounter()).equal(0);
          await expect(
            freelancecontract
              .connect(worker)
              .createContract(_deadline, _today, _hash, { value: _price })
          ).to.be.revertedWith("Only client can create a contract.");
        });
      });

      describe("🔎 Test freelance contract function cancel contract", async function () {
        beforeEach(async function () {
          await deployments.fixture(["freelancecontract"]);
          freelancecontract = await ethers.getContract("freelanceContract");
          client = accounts[1];
          worker = accounts[2];
          await freelancecontract.connect(client).addClient();
          await freelancecontract.connect(worker).addWorker();
          _deadline = 100;
          _today = 0;
          title = "title";
          description = "description";
          _hash = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes(title + description)
          );
          await freelancecontract
            .connect(client)
            .createContract(_deadline, _today, _hash, { value: 1 });
        });
        // Test cancel contract from client
        it("should EMIT ContractStateChange", async function () {
          contract = await freelancecontract.contracts(1);
          expect(contract.state).equal(0);
          await expect(
            freelancecontract.connect(client).cancelContractByClient(1)
          )
            .to.emit(freelancecontract, "ContractStateChange")
            .withArgs(0, 10);
          contract = await freelancecontract.contracts(1);
          expect(contract.state).equal(10);
        });
        it("should NOT CANCEL a new contract", async function () {
          contract = await freelancecontract.contracts(1);
          expect(contract.state).equal(0);
          await expect(
            freelancecontract.connect(worker).cancelContractByClient(1)
          ).to.be.revertedWith("Only the client can call this function.");
        });
      });

      describe("🔎 Test freelance contract function sign contract", async function () {
        beforeEach(async function () {
          await deployments.fixture(["freelancecontract"]);
          freelancecontract = await ethers.getContract("freelanceContract");
          client = accounts[1];
          worker = accounts[2];
          await freelancecontract.connect(client).addClient();
          await freelancecontract.connect(worker).addWorker();
          _deadline = 100;
          _today = 0;
          title = "title";
          description = "description";
          _hash = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes(title + description)
          );
          await freelancecontract
            .connect(client)
            .createContract(_deadline, _today, _hash, { value: 1 });
        });
        // change function to update the worker
        it("should update the worker address", async function () {
          contract = await freelancecontract.contracts(1);
          expect(contract.worker).equal(addressZero);
          await freelancecontract.connect(worker).signContract(1);
          contract = await freelancecontract.contracts(1);
          expect(contract.worker).equal(worker.address);
        });
        // Test sign contract from worker
        // it("should NOT sign contract", async function () {
        //   contract = await freelancecontract.contracts(1);
        //   expect(contract.state).equal(0);
        //   await expect(
        //     freelancecontract.connect(client).signContract(1)
        //   ).to.be.revertedWith("Only the worker can call this function.");
        // });

        it("should EMIT ContractStateChange", async function () {
          contract = await freelancecontract.contracts(1);
          expect(contract.state).equal(0);
          await expect(freelancecontract.connect(worker).signContract(1))
            .to.emit(freelancecontract, "ContractStateChange")
            .withArgs(0, 1);
          contract = await freelancecontract.contracts(1);
          expect(contract.state).equal(1);
        });
      });

      // // ::::::::::::: UNIT TEST FOR DISPUTE ::::::::::::: //
      // // openDispute // disputeCounter // disputes // disputeStates // getDisputeJury

      describe("🔎 Test dispute contract function", async function () {
        beforeEach(async function () {
          await deployments.fixture(["freelancecontract"]);
          freelancecontract = await ethers.getContract("freelanceContract");
          client = accounts[1];
          await freelancecontract.connect(client).addClient();
          worker = accounts[2];
          await freelancecontract.connect(worker).addWorker();
          // Jurypool
          for (let i = 3; i < 20; i++) {
            await freelancecontract.connect(accounts[i]).addJury();
          }
          _price = 1;
          _deadline = 100;
          _today = 0;
          title = "title";
          description = "description";
          _hash = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes(title + description)
          );
          await freelancecontract
            .connect(client)
            .createContract(_deadline, _today, _hash, { value: _price });
          await freelancecontract.connect(worker).signContract(1);
        });

        it("should create a new dispute", async function () {
          count = await freelancecontract.disputeCounter();
          expect(count).equal(0);
          await freelancecontract.connect(worker).openDispute(1);
          newCount = await freelancecontract.disputeCounter();
          expect(newCount).equal(1);
        });

        it("should NOT create a second dispute", async function () {
          await freelancecontract.connect(client).openDispute(1);
          await expect(
            freelancecontract.connect(worker).openDispute(1)
          ).to.be.revertedWith(
            "The contract must be in work started or waiting client review state."
          );
        });

        it("should NOT revert select a jury", async function () {
          await freelancecontract.connect(worker).openDispute(1);
          contract = await freelancecontract.contracts(1);
          await expect(freelancecontract.connect(client).selectJuryMember(1)).to
            .not.be.reverted;
        });

        // get juryMembers
        it("should get 3 juryMembers", async function () {
          await freelancecontract.connect(client).openDispute(1);
          transaction = await freelancecontract
            .connect(client)
            .selectJuryMember(1);
          transaction.wait();
          jury = await freelancecontract.getJuryMembers(1);
          expect(jury.length).equal(3);
        });

        it("should worker requestClientValidation and able to open dispute ", async function () {
          count = await freelancecontract.disputeCounter();
          expect(count).equal(0);
          contract = await freelancecontract.contracts(1);
          await freelancecontract.connect(worker).requestClientValidation(1);
          await freelancecontract.connect(worker).openDispute(1);
          newCount = await freelancecontract.disputeCounter();
          expect(newCount).equal(1);
        });
      });

      // // ::::::::::::: UNIT TEST FOR VOTING PHASE::::::::::::: //

      // // vote // juryCounter // random // randomResult

      describe("🔎 Test function of Voting process ", async function () {
        before(async () => {
          await deployments.fixture(["freelancecontract"]);
          freelancecontract = await ethers.getContract("freelanceContract");
          client = accounts[1];
          await freelancecontract.connect(client).addClient();
          worker = accounts[2];
          await freelancecontract.connect(worker).addWorker();
          // Jurypool
          for (let i = 3; i < 20; i++) {
            await freelancecontract.connect(accounts[i]).addJury();
          }
          _price = 1;
          _deadline = 100;
          _today = 0;
          title = "title";
          description = "description";
          _hash = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes(title + description)
          );
          await freelancecontract
            .connect(client)
            .createContract(_deadline, _today, _hash, { value: _price });
          await freelancecontract.connect(worker).signContract(1);
          await freelancecontract.connect(client).openDispute(1);
          await freelancecontract.connect(client).selectJuryMember(1);
          juryMembers = await freelancecontract.getJuryMembers(1);
          //get signer from address
          jury = [];
          for (let i = 0; i < 20; i++) {
            for (let j = 0; j < juryMembers.length; j++) {
              if (accounts[i].address == juryMembers[j]) {
                jury[j] = accounts[i];
              }
            }
          }
        });
        // check if the juryCounter is correct
        it("should return the correct juryCounter", async function () {
          jurycounter = await freelancecontract.juryCounter();
          number = jurycounter.toString();
          expect(number).equal("17");
        });

        // // check if juros dispute has no vote yet - check hasVoted
        it("should return false if juryMembers has no voted", async function () {
          hasVoted = await freelancecontract.hasVoted(1, juryMembers[0]);
          expect(hasVoted).equal(false);
        });

        it("should return true if juryMembers has voted", async function () {
          Vote = await freelancecontract
            .connect(jury[0])
            .hasVoted(1, jury[0].address);
          expect(Vote).equal(false);
          transaction = await freelancecontract.connect(jury[0]).vote(1, true);
          NewVote = await freelancecontract
            .connect(jury[0])
            .hasVoted(1, jury[0].address);
          expect(NewVote).equal(true);
        });

        it("should change vote count for client", async function () {
          dispute = await freelancecontract.disputes(1);
          totalVoteCount = dispute.totalVoteCount;
          clientVoteCount = dispute.clientVoteCount;
          workerVoteCount = dispute.workerVoteCount;
          expect(totalVoteCount).equal(1);
          expect(clientVoteCount).equal(1);
          expect(workerVoteCount).equal(0);
          await freelancecontract.connect(jury[1]).vote(1, true);
          dispute = await freelancecontract.disputes(1);
          totalVoteCount = dispute.totalVoteCount;
          clientVoteCount = dispute.clientVoteCount;
          workerVoteCount = dispute.workerVoteCount;
          expect(totalVoteCount).equal(2);
          expect(clientVoteCount).equal(2);
          expect(workerVoteCount).equal(0);
        });

        it("should change vote count for worker", async function () {
          dispute = await freelancecontract.disputes(1);
          totalVoteCount = dispute.totalVoteCount;
          clientVoteCount = dispute.clientVoteCount;
          workerVoteCount = dispute.workerVoteCount;
          expect(totalVoteCount).equal(2);
          expect(clientVoteCount).equal(2);
          expect(workerVoteCount).equal(0);
          await freelancecontract.connect(jury[2]).vote(1, false);
          dispute = await freelancecontract.disputes(1);
          totalVoteCount = dispute.totalVoteCount;
          clientVoteCount = dispute.clientVoteCount;
          workerVoteCount = dispute.workerVoteCount;
          expect(totalVoteCount).equal(3);
          expect(clientVoteCount).equal(2);
          expect(workerVoteCount).equal(1);
        });
      });

      // // ::::::::::::: UNIT TEST FOR REVEAL RESULT ::::::::::::: //

      describe("🔎 Test function count Vote and change the State ", async function () {
        beforeEach(async () => {
          await deployments.fixture(["freelancecontract"]);
          freelancecontract = await ethers.getContract("freelanceContract");
          client = accounts[1];
          await freelancecontract.connect(client).addClient();
          worker = accounts[2];
          await freelancecontract.connect(worker).addWorker();
          // Jurypool
          for (let i = 3; i < 20; i++) {
            await freelancecontract.connect(accounts[i]).addJury();
          }
          _price = 1;
          _deadline = 100;
          _today = 0;
          title = "title";
          description = "description";
          _hash = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes(title + description)
          );
          await freelancecontract
            .connect(client)
            .createContract(_deadline, _today, _hash, { value: _price });
          await freelancecontract.connect(worker).signContract(1);
          await freelancecontract.connect(client).openDispute(1);
          await freelancecontract.connect(client).selectJuryMember(1);
          juryMembers = await freelancecontract.getJuryMembers(1);
        });

        it("should change state ClientLostInDispute ", async function () {
          //get signer from address
          jury = [];
          for (let j = 0; j < juryMembers.length; j++) {
            for (let i = 3; i < 20; i++) {
              if (accounts[i].address == juryMembers[j]) {
                await freelancecontract.connect(accounts[i]).vote(1, false);
              }
            }
          }
          contract = await freelancecontract.contracts(1);
          expect(contract.state).equal(6);
          await freelancecontract.revealState(1);
          contract = await freelancecontract.contracts(1);
          expect(contract.state).equal(7);
        });

        it("should change state WorkerLostInDispute ", async function () {
          //get signer from address
          jury = [];
          for (let j = 0; j < juryMembers.length; j++) {
            for (let i = 3; i < 20; i++) {
              if (accounts[i].address == juryMembers[j]) {
                await freelancecontract.connect(accounts[i]).vote(1, true);
              }
            }
          }
          contract = await freelancecontract.contracts(1);
          expect(contract.state).equal(6);
          await freelancecontract.revealState(1);
          contract = await freelancecontract.contracts(1);
          expect(contract.state).equal(8);
        });
      });

      // // ::::::::::::: UNIT TEST FOR PAYMENT ::::::::::::: //
      // // setIsFinishedAndAllowPayment

      describe("🔎 Unit Test of payments related functions and events when works is confirm by Clients", async function () {
        beforeEach(async function () {
          await deployments.fixture(["freelancecontract"]);
          freelancecontract = await ethers.getContract("freelanceContract");
          client = accounts[1];
          await freelancecontract.connect(client).addClient();
          worker = accounts[2];
          await freelancecontract.connect(worker).addWorker();
          // CREATE ARRAY FOR ADD JURORS
          for (let i = 3; i < 20; i++) {
            await freelancecontract.connect(accounts[i]).addJury();
          }
          _price = 4987;
          _deadline = 30;
          _today = 0;
          title = "title";
          description = "description";
          _hash = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes(title + description)
          );
          await freelancecontract
            .connect(client)
            .createContract(_deadline, _today, _hash, { value: _price });
          await freelancecontract.connect(worker).signContract(1);
        });

        it("should Revert as it not in correct state", async function () {
          await expect(
            freelancecontract.connect(client).setIsFinishedAndAllowPayment(1)
          ).to.be.revertedWith("Contract is not in the correct state.");
        });

        it("should worker requestClientValidation and change contract state to WaitingClientReview ", async function () {
          contract = await freelancecontract.contracts(1);
          state = contract.state;
          expect(state).equal(1);
          await freelancecontract.connect(worker).requestClientValidation(1);
          contract = await freelancecontract.contracts(1);
          NewState = contract.state;
          expect(NewState).equal(2);
        });

        it("should NOT allow client to  request client validation", async function () {
          await expect(
            freelancecontract.connect(client).requestClientValidation(1)
          ).to.be.revertedWith("Only the worker can call this function.");
        });

        it("should client able to confirm worker job and change state to WorkFinishedSuccessufully", async function () {
          await freelancecontract.connect(worker).requestClientValidation(1);
          contract = await freelancecontract.contracts(1);
          await freelancecontract
            .connect(client)
            .setIsFinishedAndAllowPayment(1);
          contract = await freelancecontract.contracts(1);
          NewState = contract.state;
          expect(NewState).equal(3);
        });

        it("should Not allow worker to confirm the job", async function () {
          await freelancecontract.connect(worker).requestClientValidation(1);
          contract = await freelancecontract.contracts(1);
          state = contract.state;
          expect(state).equal(2);
          await expect(
            freelancecontract.connect(worker).setIsFinishedAndAllowPayment(1)
          ).to.be.revertedWith("Only the client can call this function.");
        });

        it("should NOT allow client to pull payment", async function () {});

        it("should allow worker to pull payments and not fail", async function () {
          await freelancecontract.connect(worker).requestClientValidation(1);
          await freelancecontract
            .connect(client)
            .setIsFinishedAndAllowPayment(1);
          await expect(freelancecontract.connect(worker).pullPayment(1)).to.not
            .be.reverted;
        });

        it("should allow client to pull payments after worker cancel", async function () {
          await freelancecontract.connect(worker).cancelContractByWorker(1);
          await expect(freelancecontract.connect(client).pullPayment(1)).to.not
            .be.reverted;
        });
      });

      describe("🔎 Unit Test of payments related functions and events after dispute opened ", async function () {
        beforeEach(async function () {
          await deployments.fixture(["freelancecontract"]);
          freelancecontract = await ethers.getContract("freelanceContract");
          client = accounts[1];
          await freelancecontract.connect(client).addClient();
          worker = accounts[2];
          await freelancecontract.connect(worker).addWorker();
          // CREATE ARRAY FOR ADD JURORS
          for (let i = 3; i < 20; i++) {
            await freelancecontract.connect(accounts[i]).addJury();
          }
          _price = 3830;
          _deadline = 100;
          _today = 0;
          title = "title";
          description = "description";
          _hash = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes(title + description)
          );
          await freelancecontract
            .connect(client)
            .createContract(_deadline, _today, _hash, { value: _price });
          await freelancecontract.connect(worker).signContract(1);
          await freelancecontract.connect(client).openDispute(1);
          await freelancecontract.connect(client).selectJuryMember(1);
          juryMembers = await freelancecontract.getJuryMembers(1);
        });

        it("should Revert as Dispute isn't closed", async function () {
          await expect(
            freelancecontract.connect(client).setIsFinishedAndAllowPayment(1)
          ).to.be.revertedWith("Contract is not in the correct state.");
        });

        it("should NOT allow client to pull payment", async function () {
          // client pull payment
          await expect(
            freelancecontract.connect(client).pullPayment(1)
          ).to.be.revertedWith("No allowed to pull payment");
        });

        // TODO: fix this test WITH PAYMENT SPLITTER AND PULL
        // it("should Allow client to pull payment when Won dispute", async function () {
        //   //get signer from address
        //   jury = [];
        //   for (let j = 0; j < juryMembers.length; j++) {
        //     for (let i = 3; i < 20; i++) {
        //       if (accounts[i].address == juryMembers[j]) {
        //         await freelancecontract.connect(accounts[i]).vote(1, true);
        //       }
        //     }
        //   }
        //   await freelancecontract.revealState(1);
        //   balance = await ethers.provider.getBalance(client.address);
        //   balance = Math.round(ethers.utils.formatEther(balance));
        //   console.log(balance);

        //   // client pull payment
        //   await expect(freelancecontract.connect(client).pullPayment(1)).to.not
        //     .be.reverted;
        //   balance_2 = await ethers.provider.getBalance(client.address);
        //   balance_2 = Math.round(ethers.utils.formatEther(balance_2));
        //   console.log(balance_2);
        // });

        // it("should Allow worker to pull payment", async function () {
        //   //get signer from address
        //   jury = [];
        //   for (let j = 0; j < juryMembers.length; j++) {
        //     for (let i = 3; i < 20; i++) {
        //       if (accounts[i].address == juryMembers[j]) {
        //         await freelancecontract.connect(accounts[i]).vote(1, false);
        //       }
        //     }
        //   }
        //   await freelancecontract.revealState(1);
        //   // client pull payment
        //   await freelancecontract.connect(worker).pullPayment(1).to.not.be
        //     .reverted;
        // });
      });
    });
