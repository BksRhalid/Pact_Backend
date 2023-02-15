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
          freelancecontract = await ethers.getContract("FreelanceContract");
        });
      });

      // ::::::::::::: UNIT TEST FOR CREATION USER JURY, CLIENT & WORKER ::::::::::::: //
      // addClient // addJury // addWorker // isClient // isWorker // isJury
      describe("🔎 Test freelance Contract set-up", function () {
        beforeEach(async () => {
          await deployments.fixture(["freelancecontract"]);
          freelancecontract = await ethers.getContract("FreelanceContract");
        });
        // Test addWorker
        it("should ADD a new worker", async function () {
          expect(await freelancecontract.workers(accounts[1].address)).to.be
            .false;
          await freelancecontract.connect(accounts[1]).addWorker();
          expect(await freelancecontract.workers(accounts[1].address)).to.be
            .true;
        });
        // Test addClient
        it("should ADD a new client", async function () {
          expect(await freelancecontract.clients(accounts[1].address)).to.be
            .false;
          await freelancecontract.connect(accounts[1]).addClient();
          expect(await freelancecontract.clients(accounts[1].address)).to.be
            .true;
        });
        // Test addJury
        it("should ADD a new jury member", async function () {
          // should be equal to address 0x0000000
          expect(await freelancecontract.juryPool(1)).equal(addressZero);
          await freelancecontract.connect(accounts[1]).addJury();
          expect(await freelancecontract.juryPool(1)).equal(
            accounts[1].address
          );
        });
      });

      // ::::::::::::: UNIT TEST FOR CREATION CONTRACT ::::::::::::: //

      // createContract // contractCounter // cancelContractByClient // cancelContractByWorker // contractStates // signContract

      describe("🔎  Test freelance contract function creation unit test", async function () {
        beforeEach(async function () {
          await deployments.fixture(["freelancecontract"]);
          freelancecontract = await ethers.getContract("FreelanceContract");
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
        it("should EMIT createContract event with 8 Args", async function () {
          await expect(
            freelancecontract
              .connect(client)
              .createContract(_deadline, _today, _hash, { value: _price })
          )
            .to.emit(freelancecontract, "ContractCreated")
            .withArgs(
              1,
              client.address,
              addressZero,
              _hash,
              _today,
              _deadline,
              _price,
              0
            );
        });
      });

      describe("🔎 Test freelance contract function cancel contract", async function () {
        beforeEach(async function () {
          await deployments.fixture(["freelancecontract"]);
          freelancecontract = await ethers.getContract("FreelanceContract");
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
            .createContract(_deadline, _today, _hash);
        });
        // Test cancel contract from client
        it("should EMIT ContractStateChange", async function () {
          contract = await freelancecontract.contracts(1);
          expect(contract.state).equal(0);
          await expect(
            freelancecontract.connect(client).cancelContractByClient(1)
          )
            .to.emit(freelancecontract, "ContractStateChange")
            .withArgs(0, 9);
          contract = await freelancecontract.contracts(1);
          expect(contract.state).equal(9);
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
          freelancecontract = await ethers.getContract("FreelanceContract");
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
            .createContract(_deadline, _today, _hash);
        });
        // Test sign contract from worker
        // change function to update the worker
        // it("should update the worker address", async function () {
        //   contract = await freelancecontract.contracts(1);
        //   expect(contract.worker).equal(addressZero);
        //   await freelancecontract.connect(worker).signContract(1);
        //   contract = await freelancecontract.contracts(1);
        //   expect(contract.worker).equal(worker.address);
        // });

        // it("should sign contract", async function () {
        //   contract = await freelancecontract.contracts(1);
        //   expect(contract.state).equal(0);
        //   await freelancecontract.connect(0).signContract(1);
        //   contract = await freelancecontract.contracts(1);
        //   expect(contract.state).equal(1);
        // });
        it("should NOT sign contract", async function () {
          contract = await freelancecontract.contracts(1);
          expect(contract.state).equal(0);
          await expect(
            freelancecontract.connect(client).signContract(1)
          ).to.be.revertedWith("Only the worker can call this function.");
        });
      });

      // ::::::::::::: UNIT TEST FOR DISPUTE ::::::::::::: //
      // openDispute // disputeCounter // disputes // disputeStates // getDisputeJury

      // describe("🔎 Test dispute contract function", async function () {
      //   beforeEach(async function () {
      //     await deployments.fixture(["freelancecontract"]);
      //     freelancecontract = await ethers.getContract("FreelanceContract");
      //     client = accounts[1];
      //     worker = accounts[2];
      //     jury_1 = accounts[3];
      //     jury_2 = accounts[4];
      //     jury_3 = accounts[5];
      //     jury_4 = accounts[6];
      //     jury_5 = accounts[7];
      //     jury_6 = accounts[8];
      //     jury_7 = accounts[9];
      //     jury_8 = accounts[10];
      //     jury_9 = accounts[11];
      //     jury_10 = accounts[12];
      //     jury_11 = accounts[13];
      //     jury_12 = accounts[14];
      //     jury_13 = accounts[15];
      //     jury_14 = accounts[16];
      //     jury_15 = accounts[17];
      //     jury_16 = accounts[18];
      //     jury_17 = accounts[19];
      //     jury_18 = accounts[20];
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
      //     await freelancecontract
      //       .connect(client)
      //       .createContract(_deadline, _today, _hash, { value: _price });
      //   });

      //   it("should REVERT inState", async function () {
      //     await expect(
      //       freelancecontract.connect(worker).openDispute(1)
      //     ).to.be.revertedWith("Contract is not in the correct state.");
      //   });

      //   it("should create a new dispute", async function () {
      //     expect(await freelancecontract.disputeCounter()).equal(0);
      //     await freelancecontract.connect(worker).signContract(1);
      //     await freelancecontract.connect(worker).openDispute(1);
      //     expect(await freelancecontract.disputeCounter()).equal(1);
      //   });

      //   // ::::::::::::: UNIT TEST FOR VOTING PHASE::::::::::::: //

      //   // vote // juryCounter // random // randomResult

      //   describe("🔎  ", async function () {
      //     beforeEach(async function () {
      //       await deployments.fixture(["freelancecontract"]);
      //       // freelancecontract = await ethers.getContract("FreelanceContract");
      //       // await freelancecontract.addClient(accounts[0].address);
      //       // await freelancecontract.addWorker(accounts[1].address);
      //     });
      //   });

      //   // ::::::::::::: UNIT TEST FOR PAYMENT ::::::::::::: //
      //   // setIsFinishedAndAllowPayment

      //   describe("🔎  ", async function () {
      //     beforeEach(async function () {
      //       await deployments.fixture(["freelancecontract"]);
      //       // freelancecontract = await ethers.getContract("FreelanceContract");
      //       // await freelancecontract.addClient(accounts[0].address);
      //       // await freelancecontract.addWorker(accounts[1].address);
      //     });
      //   });
      // });
    });
