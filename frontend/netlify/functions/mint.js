const { ethers } = require("ethers");
const { NFTStorage, File } = require("nft.storage");

exports.handler = async (event) => {
  try {
    const { name, description, imageCID } = JSON.parse(event.body);

    const nft = new NFTStorage({ token: process.env.NFT_STORAGE_KEY });

    // 🧠 SAFETY: log environment and inputs
    console.log("NFT_STORAGE_KEY exists:", !!process.env.NFT_STORAGE_KEY);
    console.log("imageCID:", imageCID);

    const meta = await nft.store({
      name,
      description,
      image: new File([], imageCID, { type: "image/png" }),
    });

    const uri = meta.url;
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const abi = [
      "function mint(address to, string uri) external returns (uint256)",
    ];
    const contract = new ethers.Contract(
      process.env.CONTRACT_ADDRESS,
      abi,
      wallet
    );

    const tx = await contract.mint(wallet.address, uri);
    await tx.wait();

    return {
      statusCode: 200,
      body: JSON.stringify({ txHash: tx.hash, tokenURI: uri }),
    };
  } catch (err) {
    console.error("MINT ERROR:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message, stack: err.stack }),
    };
  }
};
