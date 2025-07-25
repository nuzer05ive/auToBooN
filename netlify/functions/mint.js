const { ethers } = require("ethers");
const { NFTStorage } = require("nft.storage");

exports.handler = async (event) => {
  try {
    // Parse request body
    const { name, description, imageCID } = JSON.parse(event.body || "{}");

    // Validate required fields
    if (!name || !description || !imageCID) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields." }),
      };
    }

    // Ensure all env vars are set
    const { NFT_STORAGE_KEY, RPC_URL, PRIVATE_KEY, CONTRACT_ADDRESS } = process.env;
    if (!NFT_STORAGE_KEY || !RPC_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Missing required environment variables." }),
      };
    }

    // Log for debugging (will show in Netlify deploy logs)
    console.log("NFT_STORAGE_KEY exists:", !!NFT_STORAGE_KEY);
    console.log("imageCID:", imageCID);

    // Mint metadata (no file upload, just reference image by CID)
    const nft = new NFTStorage({ token: NFT_STORAGE_KEY });
    const meta = await nft.store({
      name,
      description,
      image: `ipfs://${imageCID}`,
    });

    // Get metadata URL
    const uri = meta.url;
    console.log("Stored metadata:", uri);

    // Set up Ethers and contract
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const abi = [
      "function mint(address to, string uri) external returns (uint256)"
    ];
    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

    // Mint NFT
    const tx = await contract.mint(wallet.address, uri);
    await tx.wait();

    // Return success
    return {
      statusCode: 200,
      body: JSON.stringify({ txHash: tx.hash, tokenURI: uri }),
    };

  } catch (err) {
    // Print stack trace to logs for debugging
    console.error("Mint failed:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || "Unknown error" }),
    };
  }
};
