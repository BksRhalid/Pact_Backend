const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
//const { BN, expectRevert, expectEvent } = require("@openzeppelin/test-helpers");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Units tests of each function of voting smart contract", function () {
      let accounts;

      before(async () => {
        accounts = await ethers.getSigners();
        _owner = accounts[0];
      });

      describe("🔎 Deployment hardhat deploy testing", async function () {
        it("should deploy the smart contract", async function () {
          await deployments.fixture(["voting"]);
          voting = await ethers.getContract("Voting");
        });
      });

      // ::::::::::::: UNIT TEST FOR REGISTRATION FUNCTION ::::::::::::: //

      describe("🔎 Get add new voters function unit test", async function () {
        beforeEach(async function () {
          await deployments.fixture(["voting"]);
          voting = await ethers.getContract("Voting"); // I should NOT add this in the beforeEach set the owner as a voter
        });
        it("should emit event VoterRegistered ", async function () {
          expect(await voting.addVoter(accounts[0].address))
            .to.emit(voting, "VoterRegistered")
            .withArgs(accounts[0].address);
        });
        it("should be able to set owner as a voter ", async function () {
          expect(await voting.addVoter(accounts[0].address))
            .to.emit(voting, "VoterRegistered")
            .withArgs(accounts[0].address);
          voter_owner = await voting.getVoter(accounts[0].address);
          expect(voter_owner.isRegistered).to.be.true;
        });
        it("should add a new voter_1 and change bool isRegistered from false to true", async function () {
          await voting.addVoter(accounts[0].address);
          voter_1 = await voting.getVoter(accounts[1].address);
          expect(voter_1.isRegistered).to.be.false;
          await voting.addVoter(accounts[1].address);
          voter_1 = await voting.getVoter(accounts[1].address);
          expect(voter_1.isRegistered).to.be.true;
        });
        it("should NOT add a new voter and revert caller is not the owner ", async function () {
          await expect(
            voting.connect(accounts[1]).addVoter(accounts[2].address)
          ).to.be.revertedWith("Ownable: caller is not the owner");
        });
      });

      // ::::::::::::: UNIT TEST FOR GET VOTERS ::::::::::::: //

      describe("🔎 Get voters function unit test", async function () {
        beforeEach(async function () {
          await deployments.fixture(["voting"]);
          voting = await ethers.getContract("Voting");
          await voting.addVoter(accounts[0].address); // set the owner as a voter
        });
        it("should return true for _owner and false for voter_1 not yet Registered", async function () {
          voter_0 = await voting.getVoter(accounts[0].address);
          voter_1 = await voting.getVoter(accounts[1].address);
          expect(voter_0.isRegistered).to.be.true;
          expect(voter_1.isRegistered).to.be.false;
        });
        it("should revert as voter is not registered", async function () {
          expect(await voting.getVoter(accounts[0].address)).to.be.revertedWith(
            "You're not a voter"
          );
        });
      });

      describe("🔎 AddVoter failed as voter registration is not open yet", function () {
        beforeEach(async function () {
          await deployments.fixture(["voting"]);
          voting = await ethers.getContract("Voting");
        });
        it("should NOT addVoter and revert with Voters registration is not open yet", async function () {
          await voting.startProposalsRegistering();
          await expect(voting.addVoter(accounts[0].address)).to.be.revertedWith(
            "Voters registration is not open yet"
          );
          await voting.endProposalsRegistering();
          await expect(voting.addVoter(accounts[0].address)).to.be.revertedWith(
            "Voters registration is not open yet"
          );
          await voting.startVotingSession();
          await expect(voting.addVoter(accounts[0].address)).to.be.revertedWith(
            "Voters registration is not open yet"
          );
          await voting.endVotingSession();
          await expect(voting.addVoter(accounts[0].address)).to.be.revertedWith(
            "Voters registration is not open yet"
          );
          await voting.tallyVotes();
          await expect(voting.addVoter(accounts[0].address)).to.be.revertedWith(
            "Voters registration is not open yet"
          );
        });
        it("should NOT addVoter if not the owner", async function () {
          await expect(
            voting.connect(accounts[1]).addVoter(accounts[0].address)
          ).to.be.revertedWith("Ownable: caller is not the owner");
        });
      });

      // Unit test for proposal

      describe("🔎 Get add new proposal function unit test", async function () {
        beforeEach(async function () {
          await deployments.fixture(["voting"]);
          voting = await ethers.getContract("Voting");
          await voting.addVoter(accounts[0].address);
          voter_0 = await voting.getVoter(accounts[1].address);
          await voting.addVoter(accounts[1].address);
          voter_1 = await voting.getVoter(accounts[1].address);
        });

        it("should add a new proposal", async function () {
          startProposalsRegistering = await voting.startProposalsRegistering();
          await voting.connect(_owner).addProposal("proposal 1");
          newProposal = await voting.getOneProposal(1);
          expect(newProposal.description).to.be.equal("proposal 1");
        });
        it("should emit event add proposal", async function () {
          startProposalsRegistering = await voting.startProposalsRegistering();
          expect(await voting.connect(_owner).addProposal("proposal 1"))
            .to.emit(voting, "ProposalRegistered")
            .withArgs(2);
        });
      });

      describe("🔎  AddProposals failed as Proposals are not allowed yet", function () {
        beforeEach(async function () {
          await deployments.fixture(["voting"]);
          voting = await ethers.getContract("Voting");
        });
        it("should NOT addProposals and revert with Proposals are not allowed yet", async function () {
          await voting.addVoter(accounts[0].address);
          await expect(voting.addProposal("Proposal 0")).to.be.revertedWith(
            "Proposals are not allowed yet"
          );
          await voting.startProposalsRegistering();
          await voting.endProposalsRegistering();
          await expect(voting.addProposal("Proposal 0")).to.be.revertedWith(
            "Proposals are not allowed yet"
          );
          await voting.startVotingSession();
          await expect(voting.addProposal("Proposal 0")).to.be.revertedWith(
            "Proposals are not allowed yet"
          );
          await voting.endVotingSession();
          await expect(voting.addProposal("Proposal 0")).to.be.revertedWith(
            "Proposals are not allowed yet"
          );
          await voting.tallyVotes();
          await expect(voting.addProposal("Proposal 0")).to.be.revertedWith(
            "Proposals are not allowed yet"
          );
        });
        it("should NOT addProposal if caller is not a Voter", async function () {
          await voting.startProposalsRegistering();
          await expect(voting.addProposal("Proposal 0")).to.be.revertedWith(
            "You're not a voter"
          );
        });
      });

      // Unit test for Get one proposal

      describe("🔎 getOneProposal function unit test ", function () {
        beforeEach(async function () {
          await deployments.fixture(["voting"]);
          voting = await ethers.getContract("Voting");
        });
        it("should NOT give proposal if not Voter", async function () {
          await voting.addVoter(accounts[1].address);
          await voting.startProposalsRegistering();
          await voting.connect(accounts[1]).addProposal("Proposal numero 0");
          await expect(voting.getOneProposal(1)).to.be.revertedWith(
            "You're not a voter"
          );
        });
      });

      // Unit test for vote

      describe("🔎 Get add new vote function unit test", async function () {
        beforeEach(async function () {
          await deployments.fixture(["voting"]);
          voting = await ethers.getContract("Voting");
          await voting.addVoter(accounts[0].address);
          voter_0 = await voting.getVoter(accounts[1].address);
          await voting.addVoter(accounts[1].address);
          voter_1 = await voting.getVoter(accounts[1].address);
          await voting.addVoter(accounts[2].address);
          voter_2 = await voting.getVoter(accounts[2].address);
          await voting.startProposalsRegistering();
          await voting.addProposal("proposal 1");
          await voting.connect(accounts[1]).addProposal("proposal 2");
          await voting.connect(accounts[1]).addProposal("proposal 3");
          await voting.endProposalsRegistering();
        });

        it("should add a new vote and increment voteCount", async function () {
          await voting.startVotingSession();
          expect(await voting.connect(accounts[2]).setVote(2))
            .to.emit(voting, "Voted")
            .withArgs(accounts[2].address, 2);
          proposal_2 = await voting.getOneProposal(2);
          expect(proposal_2.voteCount).to.be.equal(1);
        });
      });

      describe("🔎 Test revert setVote function unit test", function () {
        beforeEach(async function () {
          await deployments.fixture(["voting"]);
          voting = await ethers.getContract("Voting");
        });
        it("should revert setVote as the voting session not started", async function () {
          await voting.addVoter(accounts[0].address);
          await expect(voting.setVote(1)).to.be.revertedWith(
            "Voting session havent started yet"
          );
          await voting.startProposalsRegistering();
          await expect(voting.setVote(1)).to.be.revertedWith(
            "Voting session havent started yet"
          );
          await voting.endProposalsRegistering();
          await expect(voting.setVote(1)).to.be.revertedWith(
            "Voting session havent started yet"
          );
          await voting.startVotingSession();
          await voting.endVotingSession();
          await expect(voting.setVote(1)).to.be.revertedWith(
            "Voting session havent started yet"
          );
          await voting.tallyVotes();
          await expect(voting.setVote(1)).to.be.revertedWith(
            "Voting session havent started yet"
          );
        });
        it("should revert as caller is not a voter", async function () {
          await voting.addVoter(accounts[1].address);
          await voting.startProposalsRegistering();
          await voting.connect(accounts[1]).addProposal("Proposal 0");
          await voting.endProposalsRegistering();
          await voting.startVotingSession();
          await expect(
            voting.connect(accounts[2]).setVote(1)
          ).to.be.revertedWith("You're not a voter");
        });
        it("should revert with Voting session havent started yet", async function () {
          await voting.addVoter(accounts[1].address);
          await voting.startProposalsRegistering();
          await voting.connect(accounts[1]).addProposal("Proposal 0");
          await voting.endProposalsRegistering();
          await voting.startVotingSession();
          await voting.connect(accounts[1]).setVote(1);
          await expect(
            voting.connect(accounts[1]).setVote(1)
          ).to.be.revertedWith("You have already voted");
        });
        it("should revert with Proposal not found", async function () {
          await voting.addVoter(accounts[1].address);
          await voting.startProposalsRegistering();
          await voting.endProposalsRegistering();
          await voting.startVotingSession();
          await expect(
            voting.connect(accounts[1]).setVote(99)
          ).to.be.revertedWith("Proposal not found");
        });
      });

      // ending the voting session

      describe("🔎 Get end voting session function unit test", async function () {
        beforeEach(async function () {
          await deployments.fixture(["voting"]);
          voting = await ethers.getContract("Voting");
          await voting.addVoter(accounts[0].address);
          await voting.addVoter(accounts[1].address);
          await voting.addVoter(accounts[2].address);
        });
        it("should end the voting session", async function () {
          await voting.startProposalsRegistering();
          await voting.addProposal("proposal 1");
          await voting.connect(accounts[1]).addProposal("proposal 2");
          await voting.connect(accounts[1]).addProposal("proposal 3");
          await voting.endProposalsRegistering();
          await voting.startVotingSession();
          await voting.connect(accounts[2]).setVote(2);
          await voting.endVotingSession();
          expect(await voting.workflowStatus()).to.be.equal(4);
        });
        // it("should revert", async function () {
        //   expect(await voting.endVotingSession()).to.be.revertedWith(
        //     "Voting session havent started yet"
        //   );
        // });
      });

      describe("🔎 TallyVotes function unit test", async function () {
        beforeEach(async function () {
          await deployments.fixture(["voting"]);
          voting = await ethers.getContract("Voting");
          await voting.addVoter(accounts[0].address);
          await voting.addVoter(accounts[1].address);
          await voting.addVoter(accounts[2].address);
          await voting.startProposalsRegistering();
          await voting.addProposal("proposal 1");
          await voting.connect(accounts[1]).addProposal("proposal 2");
          await voting.connect(accounts[1]).addProposal("proposal 3");
          await voting.endProposalsRegistering();
          await voting.startVotingSession();
          await voting.connect(accounts[1]).setVote(2);
          await voting.connect(accounts[2]).setVote(2);
          await voting.endVotingSession();
        });
        // to finish and add the test for the winning proposal
        it("should return the winning proposal", async function () {
          //const res = await voting.callStatic.tallyVotes();
          //console.log(res);
          // expect(await voting.tallyVotes()).to.be.equal(2);
        });
        it("should change the status", async function () {
          await voting.tallyVotes();
          expect(await voting.workflowStatus()).to.be.equal(5);
        });
      });

      describe("🔎 TallyVotes revert function unit test", function () {
        beforeEach(async () => {
          await deployments.fixture(["voting"]);
          voting = await ethers.getContract("Voting");
        });
        it("should NOT work if not votingSessionEnded", async function () {
          await expect(voting.tallyVotes()).to.be.revertedWith(
            "Current status is not voting session ended"
          );
        });
        it("should NOT work if not Owner", async function () {
          await voting.addVoter(accounts[1].address);
          await voting.startProposalsRegistering();
          await voting.endProposalsRegistering();
          await voting.startVotingSession();
          await voting.endVotingSession();
          await expect(
            voting.connect(accounts[1]).tallyVotes()
          ).to.be.revertedWith("Ownable: caller is not the owner");
        });
      });
    });
