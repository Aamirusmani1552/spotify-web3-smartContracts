const { network } = require("hardhat");
const { developementChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;

  console.log("_______________________________");
  const args = [];

  const spotify = await deploy("SpotifyWeb3", {
    from: deployer,
    args: args,
    log: true,
    waitCofirmations: developementChains.includes(network.name) ? 1 : 6,
  });

  if (
    !developementChains.includes(network.name) &&
    (process.env.ETHERSCAN_API_KEY || process.env.MUMBAI_POLYGON_API_KEY)
  ) {
    await verify(spotify.address, args);
  }

  log("___________________________________________");
};

module.exports.tags = ["all", "spotify"];
