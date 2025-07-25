const { ethers } = require("ethers");
const { NFTStorage, File } = require("nft.storage");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args)); // dynamic fetch workaround

exports.handler = async (event) => {
  try {
    console.log("Incoming event body:", event.body);

    const { name, description, imageCID } = JSON.parse(event.body);
    console.log("Parsed payload:", { name, description, imageCID });

    const nft = new NFTStorage({ token: process.env.NFT_STORAGE_KEY });

    const imageURL = `https://${imageCID}.ipfs.nftstorage.link`;
    console.log("Fetching image from:", imageURL);

    const imageRes = await fetch(imageURL);
    const imageBuffer = await imageRes.arrayBuffer();
    console.log("Fetched image size (bytes):", imageBuffer.byteLength);

    const meta = await nft.store({
      name,
      description,
      image: new File([imageBuffer], `${imageCID}.png`, { type: "image/png" })
    });
    console.log("Stored metadata:", meta.url);

    const uri = meta.url;

    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log("Wallet address:", wallet.address);

    const abi = [ "function mint(address to,string uri) external returns(uint256)" ];
    const petal = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, wallet);

    const tx = await petal.mint(wallet.address, uri);
    await tx.wait();

    console.log("Transaction hash:", tx.hash);

    return {
      statusCode: 200,
      body: JSON.stringify({ txHash: tx.hash, tokenURI: uri })
    };

  } catch (err) {
    console.error("Mint function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
