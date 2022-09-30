// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

error SpotifyWeb3_ZeroAddressProvided(address);
error SpotifyWeb3_CountCannotBeZero();
error SpotifyWeb3_NameIsRequired();

contract SpotifyWeb3 is Ownable {
  mapping(uint256 => Album) private s_Albums;
  uint256 private s_albumCount = 0;

  struct Album {
    address owner;
    address albumAddress;
    uint32 songsCount;
    uint256 timeStamp;
    string albumName;
  }

  event AlbumAdded(
    uint256 id,
    address indexed owner,
    address indexed albumAddress,
    uint32 songsCount,
    uint256 timeStamp,
    string albumName
  );

  function addAlbum(
    address owner,
    address albumAddress,
    uint32 songsCount,
    string memory albumName
  ) public onlyOwner {
    if (owner == address(0) || albumAddress == address(0)) {
      revert SpotifyWeb3_ZeroAddressProvided(address(0));
    }

    if (songsCount <= 0) {
      revert SpotifyWeb3_CountCannotBeZero();
    }

    bytes memory AlbumNameInBytes = bytes(albumName);
    if (AlbumNameInBytes.length <= 0) {
      revert SpotifyWeb3_NameIsRequired();
    }

    uint256 currentId = s_albumCount;
    s_Albums[currentId] = Album(
      owner,
      albumAddress,
      songsCount,
      block.timestamp,
      albumName
    );

    s_albumCount++;

    emit AlbumAdded(
      currentId,
      owner,
      albumAddress,
      songsCount,
      block.timestamp,
      albumName
    );
  }

  //getter functions
  function getAlbumById(uint256 id) public view returns (Album memory) {
    return s_Albums[id];
  }

  function getAlbumCount() public view returns (uint256) {
    return s_albumCount;
  }
}
