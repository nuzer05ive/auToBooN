// /netlify/functions/mint.js
const { NFTStorage, File } = require("nft.storage");
const { ethers } = require("ethers");
const crypto = require("crypto");

const BAUHAUS_COLORS = ["#E63946", "#F1FAEE", "#A8DADC", "#457B9D", "#22223B"];

function glyphToColor(g) {
  if (g === "/") return BAUHAUS_COLORS[0];
  if (g === "\\") return BAUHAUS_COLORS[1];
  if (g === "|") return BAUHAUS_COLORS[2];
  if (g === "7") return BAUHAUS_COLORS[3];
  if (g === "_") return BAUHAUS_COLORS[4];
  return "#CCCCCC";
}

function drawBauhausSVG(glyphs, a = 30) {
  const phi = (1 + Math.sqrt(5)) / 2;
  const tau = 2 * Math.PI;
  const deltaTheta = tau * (2 - phi);
  let kappa = 0;
  let svg = `<svg viewBox="0 0 400 400" width="400" height="400" xmlns="http://www.w3.org/2000/svg">\n`;
  for (let k = 0; k < glyphs.length; ++k) {
    let r = a * Math.sqrt(k + 1);
    let theta = k * deltaTheta;
    let x = 200 + r * Math.cos(theta);
    let y = 200 + r * Math.sin(theta);
    let col = glyphToColor(glyphs[k]);
    if (glyphs[k] === "/") kappa += 1;
    if (glyphs[k] === "\\") kappa -= 1;
    svg += `<circle cx="${x}" cy="${y}" r="${10 + 2 * Math.abs(kappa)}" fill="${col}" opacity="0.9"/>\n`;
    if (glyphs[k] === "7" || kappa === 0) {
      svg += `<circle cx="${x}" cy="${y}" r="16" fill="gold" opacity="0.5"/>\n`;
    }
  }
  svg += `</svg>`;
  return svg;
}

exports.handler = async (event) => {
  try {
    const { name = "Bauhaus Witness", description = "", glyphs } = JSON.parse(event.body);

    // 1. Generate random glyph string if not provided
    const sessionSeed = glyphs || Array.from({length: 13}, () => "/\\|7_ "[Math.floor(Math.random()*6)]).join("");
    // 2. Build SVG
    const svg = drawBauhausSVG(sessionSeed);
    // 3. Buffer SVG to File
    const svgFile = new File([Buffer.from(svg)], "witness.svg", { type: "image/svg+xml" });
    // 4. Store on NFT.Storage
    const nft = new NFTStorage({ token: process.env.NFT_STORAGE_KEY });
    const metadata = await nft.store({
      name,
      description: description || "Mathematically-generated Bauhaus Witness, glyphs: " + sessionSeed,
      image: svgFile,
      properties: { sessionSeed, mintedAt: Date.now() }
    });
    // 5. Mint on-chain (OPTIONAL, pseudocode)
    // const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    // const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    // ...smart contract call here...

    return {
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        metadata,
        svg,
        sessionSeed,
      }),
      headers: { "Content-Type": "application/json" }
    };

  } catch (err) {
    console.error("Mint failed:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || "Mint failed" }),
    };
  }
};
