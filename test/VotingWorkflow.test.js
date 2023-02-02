const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Units tests for overall workflow of voting smart contract", function () {
      let accounts;
      let vote;

      before(async () => {
        accounts = await ethers.getSigners();
        deployer = accounts[0];
      });

      describe("🔎 Control workflow status not allow to change if previous status is NOT correct", function () {
        beforeEach(async function () {
          await deployments.fixture(["voting"]);
          vote = await ethers.getContract("Voting");
        });
        it("should NOT start Proposal registering if the workflow status is not the expected one", async function () {
          await voting.startProposalsRegistering();
          await expect(voting.startProposalsRegistering()).to.be.revertedWith(
            "Registering proposals cant be started now"
          );
          await voting.endProposalsRegistering();
          await expect(voting.startProposalsRegistering()).to.be.revertedWith(
            "Registering proposals cant be started now"
          );
          await voting.startVotingSession();
          await expect(voting.startProposalsRegistering()).to.be.revertedWith(
            "Registering proposals cant be started now"
          );
          await voting.endVotingSession();
          await expect(voting.startProposalsRegistering()).to.be.revertedWith(
            "Registering proposals cant be started now"
          );
        });
        it("should NOT end Proposal registering if the workflow status is not the expected one", async function () {
          await expect(voting.endProposalsRegistering()).to.be.revertedWith(
            "Registering proposals havent started yet"
          );
          await voting.startProposalsRegistering();
          await voting.endProposalsRegistering();
          await expect(voting.endProposalsRegistering()).to.be.revertedWith(
            "Registering proposals havent started yet"
          );
          await voting.startVotingSession();
          await expect(voting.endProposalsRegistering()).to.be.revertedWith(
            "Registering proposals havent started yet"
          );
          await voting.endVotingSession();
          await expect(voting.endProposalsRegistering()).to.be.revertedWith(
            "Registering proposals havent started yet"
          );
        });
        it("should NOT start voting session in incorrect WF", async function () {
          await expect(voting.startVotingSession()).to.be.revertedWith(
            "Registering proposals phase is not finished"
          );
          await voting.startProposalsRegistering();
          await expect(voting.startVotingSession()).to.be.revertedWith(
            "Registering proposals phase is not finished"
          );
          await voting.endProposalsRegistering();
          await voting.startVotingSession();
          await expect(voting.startVotingSession()).to.be.revertedWith(
            "Registering proposals phase is not finished"
          );
          await voting.endVotingSession();
          await expect(voting.startVotingSession()).to.be.revertedWith(
            "Registering proposals phase is not finished"
          );
        });
        it("should NOT end voting session if the workflow status is not the expected one", async function () {
          await expect(voting.endVotingSession()).to.be.revertedWith(
            "Voting session havent started yet"
          );
          await voting.startProposalsRegistering();
          await expect(voting.endVotingSession()).to.be.revertedWith(
            "Voting session havent started yet"
          );
          await voting.endProposalsRegistering();
          await expect(voting.endVotingSession()).to.be.revertedWith(
            "Voting session havent started yet"
          );
          await voting.startVotingSession();
          await voting.endVotingSession();
          await expect(voting.endVotingSession()).to.be.revertedWith(
            "Voting session havent started yet"
          );
        });
        it("should NOT launch tallyVotes", async function () {
          await expect(voting.tallyVotes()).to.be.revertedWith(
            "Current status is not voting session ended"
          );
          await voting.startProposalsRegistering();
          await expect(voting.tallyVotes()).to.be.revertedWith(
            "Current status is not voting session ended"
          );
          await voting.endProposalsRegistering();
          await expect(voting.tallyVotes()).to.be.revertedWith(
            "Current status is not voting session ended"
          );
          await voting.startVotingSession();
          await expect(voting.tallyVotes()).to.be.revertedWith(
            "Current status is not voting session ended"
          );
          await voting.endVotingSession();
        });
      });

      describe("🔎  Check event of each workflow status change", function () {
        beforeEach(async function () {
          await deployments.fixture(["voting"]);
          voting = await ethers.getContract("Voting");
        });
        it("should start Proposal registering if the owner", async function () {
          await expect(voting.startProposalsRegistering())
            .to.emit(voting, "WorkflowStatusChange")
            .withArgs(0, 1);
        });
        it("should end Proposal registering if the owner", async function () {
          await voting.startProposalsRegistering();
          await expect(voting.endProposalsRegistering())
            .to.emit(voting, "WorkflowStatusChange")
            .withArgs(1, 2);
        });
        it("should start voting session if the owner", async function () {
          await voting.startProposalsRegistering();
          await voting.endProposalsRegistering();
          await expect(voting.startVotingSession())
            .to.emit(voting, "WorkflowStatusChange")
            .withArgs(2, 3);
        });
        it("should end voting session if the owner", async function () {
          await voting.startProposalsRegistering();
          await voting.endProposalsRegistering();
          await voting.startVotingSession();
          await expect(voting.endVotingSession())
            .to.emit(voting, "WorkflowStatusChange")
            .withArgs(3, 4);
        });
        it("should launch tallyVotes if the owner", async function () {
          await voting.startProposalsRegistering();
          await voting.endProposalsRegistering();
          await voting.startVotingSession();
          await voting.endVotingSession();
          await expect(voting.tallyVotes())
            .to.emit(voting, "WorkflowStatusChange")
            .withArgs(4, 5);
        });
      });
    });
