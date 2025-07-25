/**
 * AutoBooN x KaP't1N Gold
 * Netlify Function – INLINE “pin + mint”
 *
 * – Builds a Bauhaus‑Cartoon‑Witness SVG from a seed
 * – Pins the SVG + JSON metadata to NFT.Storage
 * – Calls the AutoBooNPetal contract with the metadata URI
 *
 * Required ENV (set in Netlify UI or .env):
 *   RPC_URL           – Polygon RPC endpoint
 *   PRIVATE_KEY       – signer that owns the Petal contract
 *   CONTRACT_ADDRESS  – deployed AutoBooNPetal address
 *   TREASURY_ADDRESS  – Gnosis Safe (used for gold token contract deploy)
 *   NFT_STORAGE_KEY   – API key from https://nft.storage
 */

import { NFTStorage, File }           from 'nft.storage'
import { ethers }                     from 'ethers'

const GOLDEN_ANGLE = 2 * Math.PI * (2 - 1.61803398875)  // 137.507°

/* -------------------------------------------------- */
/* 1.  Bauhaus‑Cartoon‑Witness generator → SVG string */
/* -------------------------------------------------- */
function buildBauhausSVG (seed) {
  // simple deterministic pseudo‑rand from seed
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0

  const pts = []
  const petals = 89                                         // feel free to tweak
  const a = 14                                              // radial scale
  for (let k = 0; k < petals; k++) {
    const r = a * Math.sqrt(k)
    const theta = k * GOLDEN_ANGLE
    const x = (r * Math.cos(theta)).toFixed(2)
    const y = (r * Math.sin(theta)).toFixed(2)
    pts.push(`<circle cx="${x}" cy="${y}" r="2" fill="hsl(${(h + k * 47) % 360} 70% 60%)"/>`)
  }

  // “swoop hair” glyph overlay (the user’s 2;)) signature)
  const swoop = `<path d="M-60,-80 Q0,-100 60,-80" fill="none" stroke="black" stroke-width="4"
                     transform="rotate(${h % 360})"/>`

  return `
  <svg viewBox="-150 -150 300 300" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="white"/>
    ${pts.join('')}
    ${swoop}
  </svg>`
}

/* ------------------------------- */
/* 2.  Netlify Handler             */
/* ------------------------------- */
export const handler = async (event) => {
  try {
    /* 2.1 parse user payload --------------------------------- */
    const { name, description, seed = Date.now().toString() } = JSON.parse(event.body || '{}')
    if (!name || !description) {
      return { statusCode: 400, body: 'Missing name or description' }
    }

    /* 2.2 build + pin artwork -------------------------------- */
    const svg    = buildBauhausSVG(seed)
    const file   = new File([svg], `${seed}.svg`, { type: 'image/svg+xml' })
    const client = new NFTStorage({ token: process.env.NFT_STORAGE_KEY })

    const metadata = await client.store({
      name,
      description,
      image: file,
      properties: { seed, phiIndex: seed.length }
    })

    /* 2.3 call Petal contract -------------------------------- */
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL)
    const wallet   = new ethers.Wallet(process.env.PRIVATE_KEY, provider)
    const petalAbi = ['function mint(address to,string uri) external returns(uint256)']
    const petal    = new ethers.Contract(process.env.CONTRACT_ADDRESS, petalAbi, wallet)

    const tx = await petal.mint(wallet.address, metadata.url)
    await tx.wait()

    return {
      statusCode: 200,
      body: JSON.stringify({ txHash: tx.hash, tokenURI: metadata.url })
    }

  } catch (err) {
    console.error('Mint failed:', err)
    return { statusCode: 500, body: 'Mint error: ' + err.message }
  }
}
