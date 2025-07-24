const { ethers } = require("ethers");
const { NFTStorage, File } = require("nft.storage");

exports.handler = async (event) => {
  try{
    const { name, description, imageCID } = JSON.parse(event.body);
    const nft = new NFTStorage({ token: process.env.NFT_STORAGE_KEY });
    const meta = await nft.store({ name, description,
        image: new File([], imageCID,{type:"image/png"})});
    const uri = meta.url;
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const abi=[ "function mint(address to,string uri) external returns(uint256)" ];
    const petal = new ethers.Contract(process.env.CONTRACT_ADDRESS,abi,wallet);
    const tx = await petal.mint(wallet.address, uri);
    await tx.wait();
    return { statusCode:200, body: JSON.stringify({ txHash: tx.hash, tokenURI: uri }) };
  }catch(err){
    return { statusCode:500, body: err.message };
  }
};
