const { ethers } = require("hardhat");
require("dotenv").config();

async function main(){
  const Gold = await ethers.getContractFactory("KaPt1NGold");
  const gold = await Gold.deploy(process.env.TREASURY_ADDRESS);
  await gold.deployed();
  console.log("Gold contract:",gold.address);

  const Petal = await ethers.getContractFactory("AutoBooNPetal");
  const petal = await Petal.deploy(gold.address);
  await petal.deployed();
  console.log("Petal contract:",petal.address);
}
main().catch(console.error);
