const { network } = require("hardhat");
const { verify } = require("../utils/verify");
const { developementChains } = require("../helper-hardhat-config");
const fs = require("fs");
const path = require("path");
const { pinata } = require("../utils/pinataClient");

const songNames = ["Chandelier", "Titanium", "Unstoppable"];
const songs = ["Chandelier-sia.mp3", "Titanium-sia.mp3", "Unstoppable-sia.mp3"];
const images = [
  "Chandelier-sia.png",
  "Titanium-sia.png",
  "Unstoppable-sia.png",
];
const ArtistImage = "sia.png";
const durations = ["03:51", "04:05", "03-37"];

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  let artistImage;
  let tokenURIs;

  if (process.env.UPLOAD_TO_PINATA) {
    console.log("Uploading music files to pinata...");
    const songsHashes = await uploadMusic("../Album/sia", songs);
    console.log("Uploaded Successfully");

    // names in array should be in same order as provided to uploadMusic function
    console.log("Uploading cover files to pinata...");
    const coverPagesHashes = await uploadCoverImages("../Album/sia", images);
    console.log("Uploaded Successfully");

    console.log("Uploading artist image to ipfs...");
    artistImage = await uploadArtishImage("../Album/sia", ArtistImage);
    console.log("Image Uploaded successfully");

    console.log("uploading Metadata to ipfs...");
    tokenURIs = await uploadMetaData(songsHashes, coverPagesHashes, durations);
    console.log("MetaData Uploaded Successfully");
  }

  log("_________________________________________");
  const args = [tokenURIs, `ipfs://` + artistImage];

  const siaAlbum = await deploy("SiaMusicAlbum", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: developementChains.includes(network.name) ? 1 : 6,
  });

  if (
    !developementChains.includes(network.name) &&
    (process.env.ETHERSCAN_API_KEY || process.env.MUMBAI_POLYGON_API_KEY)
  ) {
    await verify(siaAlbum.address, args);
  }

  log("___________________________________________");
};

async function uploadMusic(directory, songs) {
  const absolutePath = path.resolve(__dirname, directory);
  const songHashes = [];
  for (let i = 0; i < songs.length; i++) {
    const fileStream = fs.createReadStream(absolutePath + "\\" + songs[i]);

    await pinata
      .pinFileToIPFS(fileStream)
      .then((data) => {
        songHashes.push(data.IpfsHash);
      })
      .catch((err) => console.log(err));
  }

  console.log(songHashes);
  return songHashes;
}

async function uploadCoverImages(directory, images) {
  const absolutePath = path.resolve(__dirname, directory);
  const imageHashes = [];
  for (let i = 0; i < images.length; i++) {
    const fileStream = fs.createReadStream(absolutePath + "\\" + images[i]);

    await pinata
      .pinFileToIPFS(fileStream)
      .then((data) => {
        imageHashes.push(data.IpfsHash);
      })
      .catch((err) => console.log(err));
  }

  console.log(imageHashes);
  return imageHashes;
}

async function uploadArtishImage(directory, image) {
  const absolutePath = path.resolve(__dirname, directory);
  let imageHash = "";
  console.log(absolutePath);
  const fileStream = fs.createReadStream(absolutePath + "\\" + image);

  await pinata
    .pinFileToIPFS(fileStream)
    .then((data) => {
      imageHash = data.IpfsHash;
    })
    .catch((err) => console.log(err));

  console.log(imageHash);
  return imageHash;
}

async function uploadMetaData(songHashes, imageHashes, durations) {
  const tokenURIs = [];

  if (songHashes.length == imageHashes.length) {
    for (let i = 0; i < songHashes.length; i++) {
      await pinata
        .pinJSONToIPFS(
          {
            image: `ipfs://${imageHashes[i]}`,
            name: songs[i],
            animation_url: `ipfs://${songHashes[i]}`,
            duration: durations[i],
            artist: "Sia",
            artistImage: "",
            year: "2022",
          },
          {
            pinataMetadata: {
              name: songNames[i] + " MetaData",
            },
          }
        )
        .then((data) => {
          tokenURIs.push(data.IpfsHash);
        })
        .catch((err) => console.log(err));
    }
  } else {
    new Error("Lengths of Hash files are not Same");
  }
  console.log(tokenURIs, " are token uris");
  return tokenURIs;
}
module.exports.tags = ["all", "siaAlbum"];
