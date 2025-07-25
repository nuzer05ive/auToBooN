const { ethers } = require("hardhat");
require("dotenv").config();

async function main(){
  const Gold = await ethers.getContractFactory("KaPt1NGold");
  const gold = await Gold.deploy(process.env.TREASURY_ADDRESS);
  await gold.waitForDeployment();
  console.log("Gold contract:", await gold.getAddress());

  const Petal = await ethers.getContractFactory("AutoBooNPetal");
  const petal = await Petal.deploy(await gold.getAddress());
  await petal.waitForDeployment();
  console.log("Petal contract:", await petal.getAddress());

}
main().catch(console.error);
