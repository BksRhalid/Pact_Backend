const { assert, expect, expectRevert, withNamedArgs } = require("chai");
const { arrayify } = require("ethers/lib/utils");
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

      // // ::::::::::::: UNIT TEST FOR DISPUTE ::::::::::::: //
      // // openDispute // disputeCounter // disputes // disputeStates // getDisputeJury

      describe("🔎 Test dispute contract function", async function () {
        beforeEach(async function () {
          await deployments.fixture(["freelancecontract"]);
          freelancecontract = await ethers.getContract("freelanceContract");
        });

        //check if a random number is generated

        it("should generate a number", async function () {
          _seed_1 = 7;
          _seed_2 = 8;
          _seed_3 = 9;
          random_1 = (await freelancecontract.random(_seed_1)) % _seed_1;
          random_2 = (await freelancecontract.random(_seed_2)) % _seed_2;
          random_3 = (await freelancecontract.random(_seed_3)) % _seed_3;
          expect(random_1).not.equal(undefined);
          expect(random_2).not.equal(undefined);
          expect(random_3).not.equal(undefined);
        });
      });
    });
