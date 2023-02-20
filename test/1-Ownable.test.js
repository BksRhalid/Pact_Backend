const { assert, expect, expectRevert, withNamedArgs } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Units tests on Ownable access functions", function () {
      let accounts;
      let vote;

      before(async () => {
        accounts = await ethers.getSigners();
        deployer = accounts[0];
      });

      //Test if STATES
      describe("🔎 Test Ownable Revert if the owner is not the caller", function () {
        beforeEach(async function () {
          await deployments.fixture(["freelancecontract"]);
          freelancecontract = await ethers.getContract("freelanceContract");
        });
        it("should NOT setProtocolFee if caller is not the owner", async function () {
          await expect(
            freelancecontract.connect(accounts[1]).setProtocolFee(10)
          ).to.be.revertedWith("Ownable: caller is not the owner");
        });
        it("should NOT setJuryFee if caller is not the owner", async function () {
          await expect(
            freelancecontract.connect(accounts[1]).setJuryFee(10)
          ).to.be.revertedWith("Ownable: caller is not the owner");
        });
        it("should NOT setJuryLength if caller is not the owner", async function () {
          await expect(
            freelancecontract.connect(accounts[1]).setJuryLength(10)
          ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("should CHANGE ProtocolFee if caller is the owner", async function () {
          ProtocolFee = await freelancecontract.protocolFee();
          expect(ProtocolFee).to.equal(5);
          await freelancecontract.connect(accounts[0]).setProtocolFee(10);
          ProtocolFee = await freelancecontract.protocolFee();
          expect(ProtocolFee).to.equal(10);
        });

        it("should CHANGE JuryFee if caller is the owner", async function () {
          JuryFee = await freelancecontract.juryFee();
          expect(JuryFee).to.equal(5);
          await freelancecontract.connect(accounts[0]).setJuryFee(10);
          JuryFee = await freelancecontract.juryFee();
          expect(JuryFee).to.equal(10);
        });

        it("should CHANGE juryLength if caller is the owner", async function () {
          juryLength = await freelancecontract.juryLength();
          expect(juryLength).to.equal(3);
          await freelancecontract.connect(accounts[0]).setJuryLength(10);
          juryLength = await freelancecontract.juryLength();
          expect(juryLength).to.equal(10);
        });
      });
    });
