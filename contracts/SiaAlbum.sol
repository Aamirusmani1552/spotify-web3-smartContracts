// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

error ERC721_NotOwner(address);

contract SiaMusicAlbum is ERC721, ERC721URIStorage {
  using Counters for Counters.Counter;
  address private immutable i_owner;
  uint8 private s_TotalNFTs;
  Counters.Counter private s_tokenIds;
  string private s_artist;

  event NFTCreated(
    string tokenURI,
    uint256 timeStamp,
    address owner,
    uint256 tokenId
  );

  constructor(string[] memory tokenURIs, string memory artist)
    ERC721("Sia", "SIA")
  {
    i_owner = msg.sender;
    s_artist = artist;
    for (uint8 i = 0; i < tokenURIs.length; i++) {
      createToken(tokenURIs[i]);
    }
  }

  function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
    super._burn(tokenId);
    s_TotalNFTs = 0;
  }

  function tokenURI(uint256 tokenId)
    public
    view
    override(ERC721, ERC721URIStorage)
    returns (string memory)
  {
    return super.tokenURI(tokenId);
  }

  function createToken(string memory _tokenURI) public {
    if (msg.sender != i_owner) {
      revert ERC721_NotOwner(msg.sender);
    }
    s_TotalNFTs++;
    uint256 currentId = s_tokenIds.current();
    s_tokenIds.increment();
    _safeMint(msg.sender, currentId);
    _setTokenURI(currentId, _tokenURI);
    emit NFTCreated(_tokenURI, block.timestamp, msg.sender, currentId);
  }

  //getter
  function collectionNFTCount() public view returns (uint8) {
    return s_TotalNFTs;
  }

  function currentTokenId() public view returns (uint256) {
    return s_tokenIds.current();
  }

  function getArtistImage() public view returns (string memory) {
    return s_artist;
  }
}
