const fs = require("fs");
const crypto = require("crypto");
const path = require("path");
const hre = require("hardhat");

function hashLogoFile() {
  const logoPath = path.join(__dirname, "..", "alu-logo.png");

  if (!fs.existsSync(logoPath)) {
    throw new Error(
      "alu-logo.png not found. Add the official ALU logo file to the project root."
    );
  }

  const fileBuffer = fs.readFileSync(logoPath);
  return `0x${crypto.createHash("sha256").update(fileBuffer).digest("hex")}`;
}

function writeFrontendContractFiles({
  registryAddress,
  tokenAddress,
  logoHash,
  sampleHolders,
  chainId,
}) {
  const frontendContractsDirectory = path.join(
    __dirname,
    "..",
    "frontend",
    "src",
    "contracts"
  );
  const frontendAbiDirectory = path.join(
    __dirname,
    "..",
    "frontend",
    "src",
    "abi"
  );

  fs.mkdirSync(frontendContractsDirectory, { recursive: true });
  fs.mkdirSync(frontendAbiDirectory, { recursive: true });

  const registryArtifact = hre.artifacts.readArtifactSync("ALUAssetRegistry");
  const tokenArtifact = hre.artifacts.readArtifactSync("ALULogoToken");

  fs.writeFileSync(
    path.join(frontendAbiDirectory, "ALUAssetRegistry.json"),
    JSON.stringify({ abi: registryArtifact.abi }, null, 2)
  );

  fs.writeFileSync(
    path.join(frontendAbiDirectory, "ALULogoToken.json"),
    JSON.stringify({ abi: tokenArtifact.abi }, null, 2)
  );

  fs.writeFileSync(
    path.join(frontendContractsDirectory, "deployment.json"),
    JSON.stringify(
      {
        chainId: Number(chainId),
        registryAddress,
        tokenAddress,
        logoTokenId: 1,
        logoHash,
        sampleHolders,
      },
      null,
      2
    )
  );
}

async function main() {
  const [deployer, studentRepresentative, communicationsOffice, facultyRepresentative] =
    await hre.ethers.getSigners();
  const logoHash = hashLogoFile();
  const network = await hre.ethers.provider.getNetwork();

  console.log("Deploying contracts with account:", deployer.address);
  console.log("Network chain ID:", network.chainId.toString());
  console.log("ALU logo SHA-256 hash:", logoHash);

  const Registry = await hre.ethers.getContractFactory("ALUAssetRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("ALUAssetRegistry deployed to:", registryAddress);

  const registerTx = await registry.registerAsset(
    "ALU Official Logo 2026",
    "image/png",
    logoHash
  );
  const registerReceipt = await registerTx.wait();
  console.log("ALU logo registered. Transaction hash:", registerReceipt.hash);
  console.log("Registered token ID: 1");

  const LogoToken = await hre.ethers.getContractFactory("ALULogoToken");
  const logoToken = await LogoToken.deploy(deployer.address);
  await logoToken.waitForDeployment();
  const tokenAddress = await logoToken.getAddress();
  console.log("ALULogoToken deployed to:", tokenAddress);

  const distributions = [
    {
      label: "Student Representative",
      signer: studentRepresentative,
      amount: "100000",
    },
    {
      label: "Communications Office",
      signer: communicationsOffice,
      amount: "50000",
    },
    {
      label: "Faculty Representative",
      signer: facultyRepresentative,
      amount: "25000",
    },
  ];

  for (const distribution of distributions) {
    const amount = hre.ethers.parseUnits(distribution.amount, 18);
    const tx = await logoToken.distributeShares(
      distribution.signer.address,
      amount
    );
    await tx.wait();
    console.log(
      `Distributed ${distribution.amount} ALUT to ${distribution.label}: ${distribution.signer.address}`
    );
  }

  const sampleHolders = distributions.map((distribution) => ({
    label: distribution.label,
    address: distribution.signer.address,
  }));

  writeFrontendContractFiles({
    registryAddress,
    tokenAddress,
    logoHash,
    sampleHolders,
    chainId: network.chainId,
  });

  console.log("Frontend ABI and deployment files updated successfully.");
  console.log("Full remaining ALUT supply belongs to:", deployer.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
