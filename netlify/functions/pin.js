// netlify/functions/pin.js
import * as lh from '@lighthouse-web3/sdk';          // ➊ server-only
import fs from 'fs/promises';

export const handler = async (event) => {
  try {
    const { svgString, filename = 'phi-tattoo.svg' } = JSON.parse(event.body);

    // ➋ write temp file (Lighthouse SDK needs a path)
    const tmp = `/tmp/${Date.now()}_${filename}`;
    await fs.writeFile(tmp, svgString, 'utf8');

    // ➌ pin -> IPFS
    const { data: { Hash } } = await lh.upload(tmp, process.env.LIGHTHOUSE_API_KEY);

    return {
      statusCode: 200,
      body: JSON.stringify({ cid: Hash })
    };
  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
};
