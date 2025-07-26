// netlify/functions/renderScene.js – headless render & pin
const { readFileSync } = require('fs');
const lighthouse = require('@lighthouse-web3/sdk');
const { mapScale }  = require('../../lib/scaleMapper');

exports.handler = async (event) => {
  try {
    const { seed, radius, zcm } = JSON.parse(event.body);
    const scaleInfo = mapScale(seed, radius);

    // ⬇️  Render via headless WebGPU / node-canvas-webgl (pseudo)
    const pngBuffer = await renderPNG(scaleInfo, zcm);

    // ⬇️  Pin to Lighthouse
    const upRes = await lighthouse.upload(pngBuffer, process.env.LIGHTHOUSE_API_KEY, `tattoo_${Date.now()}.png`);

    return {
      statusCode: 200,
      body: JSON.stringify({ cid: upRes.data.Hash, ...scaleInfo })
    };
  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
};
