const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Deploy ProduceTraceability contract
  const ProduceTraceability = await hre.ethers.getContractFactory("ProduceTraceability");
  const produceTraceability = await ProduceTraceability.deploy(deployer.address);

  await produceTraceability.waitForDeployment();

  const address = await produceTraceability.getAddress();
  
  console.log("ProduceTraceability deployed to:", address);
  console.log("\n📝 Update your backend .env file with:");
  console.log(`CONTRACT_ADDRESS=${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
