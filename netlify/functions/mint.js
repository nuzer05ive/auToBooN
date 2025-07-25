const { ethers } = require("ethers");
const { NFTStorage, File } = require("nft.storage");

// Main Netlify handler
exports.handler = async (event) => {
  try {
    // 1. Parse the request
    const { name, description, imageCID } = JSON.parse(event.body);

    // 2. Check envs and log for debugging (will show in Netlify logs)
    if (!process.env.NFT_STORAGE_KEY || !process.env.PRIVATE_KEY || !process.env.RPC_URL || !process.env.CONTRACT_ADDRESS) {
      console.error("Missing one or more env vars:", {
        NFT_STORAGE_KEY: !!process.env.NFT_STORAGE_KEY,
        PRIVATE_KEY: !!process.env.PRIVATE_KEY,
        RPC_URL: !!process.env.RPC_URL,
        CONTRACT_ADDRESS: !!process.env.CONTRACT_ADDRESS,
      });
      return { statusCode: 500, body: "Server config error: Missing environment variables" };
    }
    console.log("NFT_STORAGE_KEY exists:", !!process.env.NFT_STORAGE_KEY);
    console.log("imageCID:", imageCID);

    // 3. Upload metadata to IPFS (NFT.storage)
    const nft = new NFTStorage({ token: process.env.NFT_STORAGE_KEY });
    const meta = await nft.store({
      name,
      description,
      image: new File([], imageCID, { type: "image/png" }),
    });

    const uri = meta.url;
    console.log("NFT metadata URI:", uri);

    // 4. Connect to Ethereum and contract
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const abi = [ "function mint(address to, string uri) external returns(uint256)" ];
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, wallet);

    // 5. Mint NFT
    const tx = await contract.mint(wallet.address, uri);
    await tx.wait();

    // 6. Return success
    return {
      statusCode: 200,
      body: JSON.stringify({ txHash: tx.hash, tokenURI: uri }),
    };
  } catch (err) {
    console.error("Mint failed:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || "Unknown error" }),
    };
  }
};
