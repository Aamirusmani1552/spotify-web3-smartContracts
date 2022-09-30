const { network } = require("hardhat");
const { verify } = require("../utils/verify");
const { developementChains } = require("../helper-hardhat-config");
const fs = require("fs");
const path = require("path");
const { pinata } = require("../utils/pinataClient");

const songNames = ["Laal-Ishq", "Soch-Na-Sake"];
const songs = ["Laal-Ishq.mp3", "Soch-Na-Sake.mp3"];
const images = ["Laal-Ishq-Cover.png", "Soch-Na-Sake-Cover.png"];
const ArtistImage = "arijitSinghImage.jpg";
const durations = ["06:27", "04:41"];

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  let artistImage;
  let tokenURIs;

  if (process.env.UPLOAD_TO_PINATA) {
    console.log("Uploading music files to pinata...");
    const songsHashes = await uploadMusic("../Album/arijitAlbum", songs);
    console.log("Uploaded Successfully");

    // names in array should be in same order as provided to uploadMusic function
    console.log("Uploading cover files to pinata...");
    const coverPagesHashes = await uploadCoverImages(
      "../Album/arijitAlbum",
      images
    );
    console.log("Uploaded Successfully");

    console.log("Uploading artist image to ipfs...");
    artistImage = await uploadArtishImage("../Album/arijitAlbum", ArtistImage);
    console.log("Image Uploaded successfully");

    console.log("uploading Metadata to ipfs...");
    tokenURIs = await uploadMetaData(songsHashes, coverPagesHashes, durations);
    console.log("MetaData Uploaded Successfully");
  }

  log("_________________________________________");
  const args = [tokenURIs, `ipfs://` + artistImage];

  const arijitAlbum = await deploy("ArijitSinghMusicAlbum", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: developementChains.includes(network.name) ? 1 : 6,
  });

  if (
    !developementChains.includes(network.name) &&
    (process.env.ETHERSCAN_API_KEY || process.env.MUMBAI_POLYGON_API_KEY)
  ) {
    await verify(arijitAlbum.address, args);
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
            artist: "Arijit Singh",
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
module.exports.tags = ["all", "arijitSinghAlbum"];

// Arijit Singh
