const { network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log("--------------------------------------");
  const juryfee = 5;
  const protocolFee = 5;
  const juryLength = 3;

  arguments = [juryfee, protocolFee, juryLength];
  const freelanceContract = await deploy("freelanceContract", {
    from: deployer,
    args: arguments,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  // Verify the smart contract
  if (!developmentChains.includes(network.name) && process.env.ETHERSCAN) {
    log("Verifying...");
    await verify(freelanceContract.address, arguments);
  }
};

module.exports.tags = ["all", "freelancecontract", "main"];
