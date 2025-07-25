// frontend/src/components/BauhausMintButton.jsx
import React, { useState } from "react";
import { drawBauhausSVG } from "./bauhausMath";

export default function BauhausMintButton() {
  const [svg, setSvg] = useState("");
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState(null);

  const handleMint = async () => {
    setLoading(true);
    const glyphs = Array.from({length: 13}, () => "/\\|7_ "[Math.floor(Math.random()*6)]).join("");
    setSvg(drawBauhausSVG(glyphs));
    const res = await fetch("/.netlify/functions/mint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ glyphs })
    });
    const data = await res.json();
    setMeta(data.metadata || null);
    setLoading(false);
  };

  return (
    <div>
      <button onClick={handleMint} disabled={loading}>
        {loading ? "Minting..." : "Mint Bauhaus Witness"}
      </button>
      {svg && <div dangerouslySetInnerHTML={{ __html: svg }} />}
      {meta && <div>
        <h4>Minted!</h4>
        <pre>{JSON.stringify(meta, null, 2)}</pre>
      </div>}
    </div>
  );
}
