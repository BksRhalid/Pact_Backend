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

      // // ::::::::::::: UNIT TEST FOR CREATION USER JURY, CLIENT & WORKER ::::::::::::: //
      // // addClient // addJury // addWorker // isClient // isWorker // isJury
      // describe("🔎 Test freelance Contract set-up", function () {
      //   beforeEach(async () => {
      //     await deployments.fixture(["freelancecontract"]);
      //     freelancecontract = await ethers.getContract("freelanceContract");
      //   });
      //   // Test addWorker
      //   it("should ADD a new worker", async function () {
      //     expect(await freelancecontract.workers(accounts[1].address)).to.be
      //       .false;
      //     await freelancecontract.connect(accounts[1]).addWorker();
      //     expect(await freelancecontract.workers(accounts[1].address)).to.be
      //       .true;
      //   });
      //   // Test addClient
      //   it("should ADD a new client", async function () {
      //     expect(await freelancecontract.clients(accounts[1].address)).to.be
      //       .false;
      //     await freelancecontract.connect(accounts[1]).addClient();
      //     expect(await freelancecontract.clients(accounts[1].address)).to.be
      //       .true;
      //   });
      //   // Test addJury
      //   it("should ADD a new jury member", async function () {
      //     // should be equal to address 0x0000000
      //     expect(await freelancecontract.juryPool(1)).equal(addressZero);
      //     await freelancecontract.connect(accounts[1]).addJury();
      //     expect(await freelancecontract.juryPool(1)).equal(
      //       accounts[1].address
      //     );
      //   });
      // });

      // // ::::::::::::: UNIT TEST FOR CREATION CONTRACT ::::::::::::: //

      // // createContract // contractCounter // cancelContractByClient // cancelContractByWorker // contractStates // signContract

      // describe("🔎  Test freelance contract function creation unit test", async function () {
      //   beforeEach(async function () {
      //     await deployments.fixture(["freelancecontract"]);
      //     freelancecontract = await ethers.getContract("freelanceContract");
      //     client = accounts[1];
      //     worker = accounts[2];
      //     await freelancecontract.connect(client).addClient();
      //     await freelancecontract.connect(worker).addWorker();
      //     _price = 1;
      //     _deadline = 100;
      //     _today = 0;
      //     title = "title";
      //     description = "description";
      //     _hash = ethers.utils.keccak256(
      //       ethers.utils.toUtf8Bytes(title + description)
      //     );
      //   });
      //   // Test createContract from client
      //   it("should CREATE a new contract called by Client", async function () {
      //     expect(await freelancecontract.contractCounter()).equal(0);
      //     await freelancecontract
      //       .connect(client)
      //       .createContract(_deadline, _today, _hash, { value: _price });
      //     expect(await freelancecontract.contractCounter()).equal(1);
      //   });
      //   it("should NOT CREATE a new contract called by Worker", async function () {
      //     expect(await freelancecontract.contractCounter()).equal(0);
      //     await expect(
      //       freelancecontract
      //         .connect(worker)
      //         .createContract(_deadline, _today, _hash, { value: _price })
      //     ).to.be.revertedWith("Only client can create a contract.");
      //   });
      //   it("should EMIT createContract event with 8 Args", async function () {
      //     await expect(
      //       freelancecontract
      //         .connect(client)
      //         .createContract(_deadline, _today, _hash, { value: _price })
      //     )
      //       .to.emit(freelancecontract, "ContractCreated")
      //       .withArgs(
      //         1,
      //         client.address,
      //         addressZero,
      //         _hash,
      //         _today,
      //         _deadline,
      //         _price,
      //         0
      //       );
      //   });
      // });

      // describe("🔎 Test freelance contract function cancel contract", async function () {
      //   beforeEach(async function () {
      //     await deployments.fixture(["freelancecontract"]);
      //     freelancecontract = await ethers.getContract("freelanceContract");
      //     client = accounts[1];
      //     worker = accounts[2];
      //     await freelancecontract.connect(client).addClient();
      //     await freelancecontract.connect(worker).addWorker();
      //     _deadline = 100;
      //     _today = 0;
      //     title = "title";
      //     description = "description";
      //     _hash = ethers.utils.keccak256(
      //       ethers.utils.toUtf8Bytes(title + description)
      //     );
      //     await freelancecontract
      //       .connect(client)
      //       .createContract(_deadline, _today, _hash, { value: 1 });
      //   });
      //   // Test cancel contract from client
      //   it("should EMIT ContractStateChange", async function () {
      //     contract = await freelancecontract.contracts(1);
      //     expect(contract.state).equal(0);
      //     await expect(
      //       freelancecontract.connect(client).cancelContractByClient(1)
      //     )
      //       .to.emit(freelancecontract, "ContractStateChange")
      //       .withArgs(0, 10);
      //     contract = await freelancecontract.contracts(1);
      //     expect(contract.state).equal(10);
      //   });
      //   it("should NOT CANCEL a new contract", async function () {
      //     contract = await freelancecontract.contracts(1);
      //     expect(contract.state).equal(0);
      //     await expect(
      //       freelancecontract.connect(worker).cancelContractByClient(1)
      //     ).to.be.revertedWith("Only the client can call this function.");
      //   });
      // });

      // describe("🔎 Test freelance contract function sign contract", async function () {
      //   beforeEach(async function () {
      //     await deployments.fixture(["freelancecontract"]);
      //     freelancecontract = await ethers.getContract("freelanceContract");
      //     client = accounts[1];
      //     worker = accounts[2];
      //     await freelancecontract.connect(client).addClient();
      //     await freelancecontract.connect(worker).addWorker();
      //     _deadline = 100;
      //     _today = 0;
      //     title = "title";
      //     description = "description";
      //     _hash = ethers.utils.keccak256(
      //       ethers.utils.toUtf8Bytes(title + description)
      //     );
      //     await freelancecontract
      //       .connect(client)
      //       .createContract(_deadline, _today, _hash, { value: 1 });
      //   });
      //   // change function to update the worker
      //   it("should update the worker address", async function () {
      //     contract = await freelancecontract.contracts(1);
      //     expect(contract.worker).equal(addressZero);
      //     await freelancecontract.connect(worker).signContract(1);
      //     contract = await freelancecontract.contracts(1);
      //     expect(contract.worker).equal(worker.address);
      //   });
      //   // Test sign contract from worker
      //   // it("should NOT sign contract", async function () {
      //   //   contract = await freelancecontract.contracts(1);
      //   //   expect(contract.state).equal(0);
      //   //   await expect(
      //   //     freelancecontract.connect(client).signContract(1)
      //   //   ).to.be.revertedWith("Only the worker can call this function.");
      //   // });

      //   it("should EMIT ContractStateChange", async function () {
      //     contract = await freelancecontract.contracts(1);
      //     expect(contract.state).equal(0);
      //     await expect(freelancecontract.connect(worker).signContract(1))
      //       .to.emit(freelancecontract, "ContractStateChange")
      //       .withArgs(0, 1);
      //     contract = await freelancecontract.contracts(1);
      //     expect(contract.state).equal(1);
      //   });
      // });

      // // ::::::::::::: UNIT TEST FOR DISPUTE ::::::::::::: //
      // // openDispute // disputeCounter // disputes // disputeStates // getDisputeJury

      // describe("🔎 Test dispute contract function", async function () {
      //   beforeEach(async function () {
      //     await deployments.fixture(["freelancecontract"]);
      //     freelancecontract = await ethers.getContract("freelanceContract");
      //     client = accounts[1];
      //     await freelancecontract.connect(client).addClient();
      //     worker = accounts[2];
      //     await freelancecontract.connect(worker).addWorker();
      //     // Jurypool
      //     for (let i = 3; i < 20; i++) {
      //       await freelancecontract.connect(accounts[i]).addJury();
      //     }
      //     _price = 1;
      //     _deadline = 100;
      //     _today = 0;
      //     title = "title";
      //     description = "description";
      //     _hash = ethers.utils.keccak256(
      //       ethers.utils.toUtf8Bytes(title + description)
      //     );
      //     await freelancecontract
      //       .connect(client)
      //       .createContract(_deadline, _today, _hash, { value: _price });
      //     await freelancecontract.connect(worker).signContract(1);
      //   });

      //   it("should create a new dispute", async function () {
      //     count = await freelancecontract.disputeCounter();
      //     expect(count).equal(0);
      //     await freelancecontract.connect(worker).openDispute(1);
      //     newCount = await freelancecontract.disputeCounter();
      //     expect(newCount).equal(1);
      //   });

      //   it("should EMIT DisputeCreated", async function () {
      //     await expect(freelancecontract.connect(worker).openDispute(1))
      //       .to.emit(freelancecontract, "DisputeCreated")
      //       .withArgs(1, 1, worker.address);
      //   });

      //   it("should NOT create a second dispute", async function () {
      //     await freelancecontract.connect(client).openDispute(1);
      //     await expect(
      //       freelancecontract.connect(worker).openDispute(1)
      //     ).to.be.revertedWith("Contract is not in the correct state.");
      //   });

      //   // should generate select a Jury

      //   it("should EMIT DisputeStateChange", async function () {
      //     await expect(freelancecontract.connect(worker).selectJuryMember(1))
      //       .to.emit(freelancecontract, "DisputeStateChange")
      //       .withArgs(1, 1);
      //   });

      //   //check if a random number is generated

      //   it("should generate a number", async function () {
      //     jurycounter = await freelancecontract.juryCounter();
      //     number = jurycounter.toString();
      //     jurySelected = client.address;
      //     _seed = String(jurySelected, worker.address).length;
      //     console.log("_seed >>> : ", _seed);
      //     transaction = await freelancecontract.random(_seed);
      //     randomGenerated = transaction % number;
      //     console.log("randomGenerated >>> : ", randomGenerated);
      //     expect(randomGenerated).not.equal(undefined);
      //   });

      //   it("should NOT revert select a jury", async function () {
      //     await freelancecontract.connect(worker).openDispute(1);
      //     contract = await freelancecontract.contracts(1);
      //     await expect(freelancecontract.connect(client).selectJuryMember(1)).to
      //       .not.be.reverted;
      //   });

      //   // get juryMembers
      //   it("should get juryMembers", async function () {
      //     await freelancecontract.connect(client).openDispute(1);
      //     transaction = await freelancecontract
      //       .connect(client)
      //       .selectJuryMember(1);
      //     transaction.wait();
      //     jury = await freelancecontract.getJuryMembers(1);
      //     console.log("jury >>> : ", jury);
      //     // should return 3 jury members
      //     expect(jury.length).equal(3);
      //   });
      // });

      // // ::::::::::::: UNIT TEST FOR VOTING PHASE::::::::::::: //

      // // vote // juryCounter // random // randomResult

      // describe("🔎 Test function of Voting process ", async function () {
      //   beforeEach(async () => {
      //     await deployments.fixture(["freelancecontract"]);
      //     freelancecontract = await ethers.getContract("freelanceContract");
      //     client = accounts[1];
      //     await freelancecontract.connect(client).addClient();
      //     worker = accounts[2];
      //     await freelancecontract.connect(worker).addWorker();
      //     // Jurypool
      //     for (let i = 3; i < 20; i++) {
      //       await freelancecontract.connect(accounts[i]).addJury();
      //     }
      //     _price = 1;
      //     _deadline = 100;
      //     _today = 0;
      //     title = "title";
      //     description = "description";
      //     _hash = ethers.utils.keccak256(
      //       ethers.utils.toUtf8Bytes(title + description)
      //     );
      //     await freelancecontract
      //       .connect(client)
      //       .createContract(_deadline, _today, _hash, { value: _price });
      //     await freelancecontract.connect(worker).signContract(1);
      //     await freelancecontract.connect(client).openDispute(1);
      //     await freelancecontract.connect(client).selectJuryMember(1);
      //     juryMembers = await freelancecontract.getJuryMembers(1);
      //     //get signer from address
      //     jury = [];
      //     for (let i = 0; i < 20; i++) {
      //       for (let j = 0; j < juryMembers.length; j++) {
      //         if (accounts[i].address == juryMembers[j]) {
      //           jury[j] = accounts[i];
      //         }
      //       }
      //     }
      //   });
      //   // check if the juryCounter is correct
      //   it("should return the correct juryCounter", async function () {
      //     jurycounter = await freelancecontract.juryCounter();
      //     number = jurycounter.toString();
      //     expect(number).equal("17");
      //   });

      //   // // check if juros dispute has no vote yet - check hasVoted
      //   it("should return false if juryMembers has no voted", async function () {
      //     jury = juryMembers[0];
      //     hasVoted = await freelancecontract.hasVoted(1, jury);
      //     expect(hasVoted).equal(false);
      //   });

      //   it("should return true if juryMembers has voted", async function () {
      //     Vote = await freelancecontract
      //       .connect(jury[0])
      //       .hasVoted(1, jury[0].address);
      //     expect(Vote).equal(false);
      //     transaction = await freelancecontract.connect(jury[0]).vote(1, true);
      //     NewVote = await freelancecontract
      //       .connect(jury[0])
      //       .hasVoted(1, jury[0].address);
      //     expect(NewVote).equal(true);
      //   });

      //   // SHOULD EMIT VOTE
      //   it("should EMIT vote dispute id", async function () {
      //     await expect(freelancecontract.connect(jury[0]).vote(1, true))
      //       .to.emit(freelancecontract, "Voted")
      //       .withArgs(1, jury[0].address);
      //   });

      //   it("should change vote count for client", async function () {
      //     dispute = await freelancecontract.disputes(1);
      //     totalVoteCount = dispute.totalVoteCount;
      //     clientVoteCount = dispute.clientVoteCount;
      //     workerVoteCount = dispute.workerVoteCount;
      //     expect(totalVoteCount).equal(0);
      //     expect(clientVoteCount).equal(0);
      //     expect(workerVoteCount).equal(0);
      //     await freelancecontract.connect(jury[0]).vote(1, true);
      //     dispute = await freelancecontract.disputes(1);
      //     totalVoteCount = dispute.totalVoteCount;
      //     clientVoteCount = dispute.clientVoteCount;
      //     workerVoteCount = dispute.workerVoteCount;
      //     expect(totalVoteCount).equal(1);
      //     expect(clientVoteCount).equal(1);
      //     expect(workerVoteCount).equal(0);
      //   });

      //   it("should change vote count for worker", async function () {
      //     dispute = await freelancecontract.disputes(1);
      //     totalVoteCount = dispute.totalVoteCount;
      //     clientVoteCount = dispute.clientVoteCount;
      //     workerVoteCount = dispute.workerVoteCount;
      //     expect(totalVoteCount).equal(0);
      //     expect(clientVoteCount).equal(0);
      //     expect(workerVoteCount).equal(0);
      //     await freelancecontract.connect(jury[0]).vote(1, false);
      //     dispute = await freelancecontract.disputes(1);
      //     totalVoteCount = dispute.totalVoteCount;
      //     clientVoteCount = dispute.clientVoteCount;
      //     workerVoteCount = dispute.workerVoteCount;
      //     expect(totalVoteCount).equal(1);
      //     expect(clientVoteCount).equal(0);
      //     expect(workerVoteCount).equal(1);
      //   });

      //   it("should change the state of the dispute", async function () {
      //     dispute = await freelancecontract.disputes(1);
      //     state = dispute.state;
      //     expect(state).equal(1);
      //     // console.log("jury[0] >>> : ", jury[0].address);
      //     // console.log("jury[1] >>> : ", jury[1].address);
      //     // console.log("jury[2] >>> : ", jury[2].address);
      //     await freelancecontract.connect(jury[0]).vote(1, true);
      //     await freelancecontract.connect(jury[1]).vote(1, true);
      //     await freelancecontract.connect(jury[2]).vote(1, true);
      //     dispute = await freelancecontract.disputes(1);
      //     NewState = dispute.state;
      //     expect(NewState).equal(2);
      //   });

      //   it("should EMIT DisputeStateChange", async function () {
      //     await freelancecontract.connect(jury[0]).vote(1, true);
      //     await freelancecontract.connect(jury[1]).vote(1, true);
      //     expect(await freelancecontract.connect(jury[2]).vote(1, true))
      //       .to.emit(dispute, "DisputeStateChange")
      //       .withArgs(1, 2);
      //   });
      // });

      // // ::::::::::::: UNIT TEST FOR REVEAL RESULT ::::::::::::: //

      // describe("🔎 Test function count Vote and change the State ", async function () {
      //   beforeEach(async () => {
      //     await deployments.fixture(["freelancecontract"]);
      //     freelancecontract = await ethers.getContract("freelanceContract");
      //     client = accounts[1];
      //     await freelancecontract.connect(client).addClient();
      //     worker = accounts[2];
      //     await freelancecontract.connect(worker).addWorker();
      //     // Jurypool
      //     for (let i = 3; i < 20; i++) {
      //       await freelancecontract.connect(accounts[i]).addJury();
      //     }
      //     _price = 1;
      //     _deadline = 100;
      //     _today = 0;
      //     title = "title";
      //     description = "description";
      //     _hash = ethers.utils.keccak256(
      //       ethers.utils.toUtf8Bytes(title + description)
      //     );
      //     await freelancecontract
      //       .connect(client)
      //       .createContract(_deadline, _today, _hash, { value: _price });
      //     await freelancecontract.connect(worker).signContract(1);
      //     await freelancecontract.connect(client).openDispute(1);
      //     await freelancecontract.connect(client).selectJuryMember(1);
      //     juryMembers = await freelancecontract.getJuryMembers(1);
      //   });

      //   it("should change state ClientLostInDispute ", async function () {
      //     //get signer from address
      //     jury = [];
      //     for (let j = 0; j < juryMembers.length; j++) {
      //       for (let i = 3; i < 20; i++) {
      //         if (accounts[i].address == juryMembers[j]) {
      //           await freelancecontract.connect(accounts[i]).vote(1, false);
      //         }
      //       }
      //     }
      //     contract = await freelancecontract.contracts(1);
      //     expect(contract.state).equal(6);
      //     await freelancecontract.revealState(1);
      //     contract = await freelancecontract.contracts(1);
      //     expect(contract.state).equal(7);
      //   });

      //   it("should change state WorkerLostInDispute ", async function () {
      //     //get signer from address
      //     jury = [];
      //     for (let j = 0; j < juryMembers.length; j++) {
      //       for (let i = 3; i < 20; i++) {
      //         if (accounts[i].address == juryMembers[j]) {
      //           await freelancecontract.connect(accounts[i]).vote(1, true);
      //         }
      //       }
      //     }
      //     contract = await freelancecontract.contracts(1);
      //     expect(contract.state).equal(6);
      //     await freelancecontract.revealState(1);
      //     contract = await freelancecontract.contracts(1);
      //     expect(contract.state).equal(8);
      //   });
      // });

      // ::::::::::::: UNIT TEST FOR PAYMENT ::::::::::::: //
      // setIsFinishedAndAllowPayment

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
          _price = 1400;
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
          balance = await client.getBalance();
          //change balance wei to Ethers
          balance = ethers.utils.parseUnits(balance.toString(), "ether");
          console.log("client balance : ", balance.toString());
          await freelancecontract.connect(worker).cancelContractByWorker(1);
          await expect(freelancecontract.connect(client).pullPayment(1)).to.not
            .be.reverted;
          NewBalance = await client.getBalance();
          NewBalance = ethers.utils.parseEther(NewBalance.toString());
          console.log("client new balance : ", NewBalance.toString());
        });

        // it("should EMIT DisputeStateChange", async function () {});

        // it("should REVEAL the result of the dispute", async function () {});
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
          _price = 10;
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

        it("should Allow client to pull payment when Won dispute", async function () {
          //get signer from address
          jury = [];
          for (let j = 0; j < juryMembers.length; j++) {
            for (let i = 3; i < 20; i++) {
              if (accounts[i].address == juryMembers[j]) {
                await freelancecontract.connect(accounts[i]).vote(1, true);
              }
            }
          }
          await freelancecontract.revealState(1);
          balance = await ethers.provider.getBalance(client.address);
          console.log(balance.toString() / 1000000000000);
          // client pull payment
          await expect(freelancecontract.connect(client).pullPayment(1)).to.not
            .be.reverted;
          balance_2 = await ethers.provider.getBalance(client.address);
          console.log(balance_2.toString() / 1000000000000);
        });

        it("should Allow worker to pull payment", async function () {
          //get signer from address
          jury = [];
          for (let j = 0; j < juryMembers.length; j++) {
            for (let i = 3; i < 20; i++) {
              if (accounts[i].address == juryMembers[j]) {
                await freelancecontract.connect(accounts[i]).vote(1, false);
              }
            }
          }
          await freelancecontract.revealState(1);
          // client pull payment
          await freelancecontract.connect(worker).pullPayment(1).to.not.be
            .reverted;
        });

        // it("should REVEAL the result of the dispute", async function () {});
      });
    });

// it("should allow worker to pull payment and increase the balance 100 Ethers", async function () {
//   //get contract prime
//   balance_inital = await ethers.provider.getBalance(worker.address);
//   console.log(balance_inital.toString() / 1000000000000000000);
//   await freelancecontract.connect(worker).requestClientValidation(1);
//   await freelancecontract
//     .connect(client)
//     .setIsFinishedAndAllowPayment(1);
//   const transactionResponse = await freelancecontract
//     .connect(worker)
//     .pullPayment(1);
//   const transactionReceipt = await transactionResponse.wait();
//   console.log(transactionReceipt);
//   // const { gasUsed, effectiveGasPrice } = transactionReceipt;
//   // const gasCost = gasUsed.mul(effectiveGasPrice);
//   // const _amount = _price * 0.95; // 5% fee
//   Newbalance = await ethers.provider.getBalance(worker.address);
//   console.log(Newbalance.toString() / 1000000000000000000);
//   // expect(Newbalance).equal(balance_inital.add(_amount).sub(gasCost));
//   // balance = await ethers.provider.getBalance(worker.address);
//   // console.log(balance.toString() / 1000000000000000000);
//   // delta = balance_inital.sub(Newbalance, gasCost);
//   //expect(balance).equal(balance_init.add(_price));
// });
