// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IKaPt1NGold {
  function mintToTreasury(uint256 linkedId) external returns (uint256);
}

contract AutoBooNPetal is ERC721URIStorage, Ownable {
    uint256 public tokenCount;
    address public goldContract;

    constructor(address _gold) 
    ERC721("AutoBooN Petal", "PETAL") 
    Ownable(msg.sender) 
{
    goldContract = _gold;
}

    function mint(address to,string memory uri) external onlyOwner returns(uint256){
        tokenCount++;
        uint256 id = tokenCount;
        _safeMint(to,id);
        _setTokenURI(id,uri);

        // auto mint gold token to treasury
        if(goldContract!=address(0)){
            IKaPt1NGold(goldContract).mintToTreasury(id);
        }
        return id;
    }

    function updateTokenURI(uint256 tokenId,string memory newURI) external onlyOwner{
        _setTokenURI(tokenId,newURI);
    }
}
