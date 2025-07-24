// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract KaPt1NGold is ERC721URIStorage, Ownable {
    address public treasury;
    uint256 public goldCount;

    constructor(address _treasury) ERC721("KaPt1N Gold","KGOLD") {
        treasury = _treasury;
    }

    function mintToTreasury(uint256 linkedId) external returns (uint256){
        goldCount++;
        uint256 id = goldCount;
        _safeMint(treasury,id);
        _setTokenURI(id,string(abi.encodePacked("ipfs://gold-meta/",Strings.toString(linkedId))));
        return id;
    }
}
