const fs = require("fs");
const crypto = require("crypto");
const path = require("path");
const hre = require("hardhat");

function hashLogoFile() {
  const logoPath = path.join(__dirname, "..", "alu-logo.png");

  if (!fs.existsSync(logoPath)) {
    throw new Error("alu-logo.png not found. Add the official ALU logo file to the project root.");
  }

  const fileBuffer = fs.readFileSync(logoPath);
  return `0x${crypto.createHash("sha256").update(fileBuffer).digest("hex")}`;
}

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const logoHash = hashLogoFile();

  console.log("Deploying contracts with account:", deployer.address);
  console.log("ALU logo SHA-256 hash:", logoHash);

  const Registry = await hre.ethers.getContractFactory("ALUAssetRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  console.log("ALUAssetRegistry deployed to:", await registry.getAddress());

  const registerTx = await registry.registerAsset("ALU Official Logo", "image/png", logoHash);
  const receipt = await registerTx.wait();
  console.log("ALU logo registered. Transaction hash:", receipt.hash);
  console.log("Registered token ID: 1");

  const LogoToken = await hre.ethers.getContractFactory("ALULogoToken");
  const logoToken = await LogoToken.deploy(deployer.address);
  await logoToken.waitForDeployment();
  console.log("ALULogoToken deployed to:", await logoToken.getAddress());
  console.log("Full ALUT supply minted to:", deployer.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
