import { useState } from 'react';

function App() {
  const [hash, setHash] = useState('');
  const [status, setStatus] = useState(''); // Optional: status feedback

  async function handleMint() {
    setStatus("⏳ Minting...");
    setHash('');

    try {
      const res = await fetch('/.netlify/functions/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: "Petal",
          description: "Auto",
          imageCID: "bafy..." // Update with valid CID if needed
        }),
      });

      console.log("🌐 Response status:", res.status);
      const text = await res.text();
      console.log("📦 Raw response body:", text);

      if (!res.ok) {
        throw new Error(`❌ Server error ${res.status}`);
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        throw new Error("❌ Failed to parse JSON: " + err.message);
      }

      console.log("✅ Parsed JSON:", data);
      setHash(data.txHash || 'No txHash returned');
      setStatus("✅ Mint successful!");

    } catch (err) {
      console.error("💥 Minting failed:", err);
      setStatus("❌ Minting failed");
      setHash(err.message);
    }
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>AutoBooN x KaP't1N Gold</h1>
      <button onClick={handleMint}>🌸 Mint Petal</button>
      <p>Status: {status}</p>
      <p>TxHash: {hash}</p>
    </div>
  );
}

export default App;
