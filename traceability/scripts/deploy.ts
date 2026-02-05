import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy ProduceTraceability contract
  const ProduceTraceability = await ethers.getContractFactory("ProduceTraceability");
  const contract = await ProduceTraceability.deploy(deployer.address); // Pass initialOwner
  
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  console.log("ProduceTraceability deployed to:", contractAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
