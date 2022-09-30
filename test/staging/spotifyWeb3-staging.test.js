const { expect, assert } = require("chai");
const { network, ethers, deployments } = require("hardhat");
const { developementChains } = require("../../helper-hardhat-config");

developementChains.includes(network.name)
  ? describe.skip
  : describe("SpotifyWeb3 staging tests", () => {
      let accounts, deployer, spotify;
      beforeEach(async () => {
        accounts = await ethers.getSigners();
        deployer = accounts[0];

        spotify = await ethers.getContract("SpotifyWeb3");
        albumAddress = "0x3612e71b29A1Bb242155E941d87A7293D14cd6a7";
      });

      it("should add the Album in app", async () => {
        const tx = await spotify.addAlbum(
          deployer.address.toString(),
          albumAddress,
          2,
          "Arijit Singh Songs"
        );

        const txResponse = await tx.wait(1);

        console.log(txResponse);
      });
    });
