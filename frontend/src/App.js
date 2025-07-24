import { useState } from 'react';
function App(){
 const [hash,setHash]=useState('');
 async function handleMint(){
   const res = await fetch('/.netlify/functions/mint',{method:'POST',
     body:JSON.stringify({name:"Petal",description:"Auto",imageCID:"bafy..."}),
   });
   const j = await res.json();
   setHash(j.txHash || 'error');
 }
 return (<div style={{textAlign:'center'}}>
   <h1>AutoBooN x KaP't1N Gold</h1>
   <button onClick={handleMint}>Mint Petal</button>
   <p>{hash}</p>
 </div>);
}
export default App;
