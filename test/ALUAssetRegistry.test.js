const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ALU_LOGO_HASH =
  "0xe03128e7ed668d74c334ed965edf89d0e1b3da112f6aeb6233bfd191ad829348";
const WRONG_LOGO_HASH =
  "0x1111111111111111111111111111111111111111111111111111111111111111";

function formatTokenDisplay(rawAmount, decimals = 18) {
  const formatted = ethers.formatUnits(rawAmount, decimals);
  return Number(formatted).toLocaleString("en-US", {
    maximumFractionDigits: 4,
  });
}

function buildVerificationViewModel(isAuthentic) {
  return isAuthentic
    ? {
        status: "success",
        heading: "Logo Verified",
        message: "This is the authentic ALU logo.",
      }
    : {
        status: "error",
        heading: "Verification Failed",
        message: "Warning: This logo has been modified.",
      };
}

describe("ALUAssetRegistry and ALULogoToken", function () {
  async function deployContractsFixture() {
    const [owner, recipient, otherAccount, thirdAccount] =
      await ethers.getSigners();

    const Registry = await ethers.getContractFactory("ALUAssetRegistry");
    const registry = await Registry.deploy();
    await registry.waitForDeployment();

    const LogoToken = await ethers.getContractFactory("ALULogoToken");
    const logoToken = await LogoToken.deploy(owner.address);
    await logoToken.waitForDeployment();

    return {
      owner,
      recipient,
      otherAccount,
      thirdAccount,
      registry,
      logoToken,
    };
  }

  describe("ALUAssetRegistry ERC-721 registration", function () {
    it("registers the ALU logo successfully and returns token ID 1", async function () {
      const { owner, registry } = await deployContractsFixture();

      const predictedTokenId = await registry.registerAsset.staticCall(
        "ALU Official Logo",
        "image/png",
        ALU_LOGO_HASH
      );

      expect(predictedTokenId).to.equal(1);
      await registry.registerAsset(
        "ALU Official Logo",
        "image/png",
        ALU_LOGO_HASH
      );
      expect(await registry.ownerOf(1)).to.equal(owner.address);
    });

    it("rejects a duplicate registration using the same hash", async function () {
      const { registry } = await deployContractsFixture();

      await registry.registerAsset(
        "ALU Official Logo",
        "image/png",
        ALU_LOGO_HASH
      );

      await expect(
        registry.registerAsset(
          "ALU Official Logo Copy",
          "image/png",
          ALU_LOGO_HASH
        )
      ).to.be.revertedWith(
        "Asset with this content hash already registered"
      );
    });

    it("verifyLogoIntegrity returns true for the correct logo hash", async function () {
      const { registry } = await deployContractsFixture();

      await registry.registerAsset(
        "ALU Official Logo",
        "image/png",
        ALU_LOGO_HASH
      );

      const result = await registry.verifyLogoIntegrity(1, ALU_LOGO_HASH);
      expect(result[0]).to.equal(true);
      expect(result[1]).to.equal("Logo is authentic.");
    });

    it("verifyLogoIntegrity returns false for an incorrect logo hash", async function () {
      const { registry } = await deployContractsFixture();

      await registry.registerAsset(
        "ALU Official Logo",
        "image/png",
        ALU_LOGO_HASH
      );

      const result = await registry.verifyLogoIntegrity(1, WRONG_LOGO_HASH);
      expect(result[0]).to.equal(false);
      expect(result[1]).to.equal("Warning: logo does not match.");
    });

    it("getAsset returns the correct asset name and file type", async function () {
      const { registry } = await deployContractsFixture();

      await registry.registerAsset(
        "ALU Official Logo",
        "image/png",
        ALU_LOGO_HASH
      );

      const asset = await registry.getAsset(1);
      expect(asset.assetName).to.equal("ALU Official Logo");
      expect(asset.fileType).to.equal("image/png");
      expect(asset.contentHash).to.equal(ALU_LOGO_HASH);
    });
  });

  describe("ALULogoToken ERC-20 tokenisation", function () {
    it("mints the full supply of 1,000,000 ALUT to the logo owner", async function () {
      const { owner, logoToken } = await deployContractsFixture();
      const fullSupply = ethers.parseUnits("1000000", 18);

      expect(await logoToken.totalSupply()).to.equal(fullSupply);
      expect(await logoToken.balanceOf(owner.address)).to.equal(fullSupply);
    });

    it("distributeShares transfers the specified tokens to a recipient", async function () {
      const { recipient, logoToken } = await deployContractsFixture();
      const amount = ethers.parseUnits("100000", 18);

      await logoToken.distributeShares(recipient.address, amount);
      expect(await logoToken.balanceOf(recipient.address)).to.equal(amount);
    });

    it("ownershipPercentage returns the correct whole-number percentage", async function () {
      const { recipient, logoToken } = await deployContractsFixture();
      const amount = ethers.parseUnits("250000", 18);

      await logoToken.distributeShares(recipient.address, amount);
      expect(await logoToken.ownershipPercentage(recipient.address)).to.equal(
        25
      );
    });
  });

  describe("DApp frontend integration", function () {
    it("reads the total ALUT supply and formats it as 1,000,000", async function () {
      const { logoToken } = await deployContractsFixture();
      const totalSupply = await logoToken.totalSupply();
      const decimals = await logoToken.decimals();

      expect(formatTokenDisplay(totalSupply, Number(decimals))).to.equal(
        "1,000,000"
      );
    });

    it("returns the correct SHA-256 file hash in bytes32 format", async function () {
      const logoPath = path.join(__dirname, "..", "alu-logo.png");
      const fileBuffer = fs.readFileSync(logoPath);
      const computedHash = `0x${crypto
        .createHash("sha256")
        .update(fileBuffer)
        .digest("hex")}`;

      expect(computedHash).to.match(/^0x[a-f0-9]{64}$/);
      expect(computedHash).to.equal(ALU_LOGO_HASH);
    });

    it("displays a verification success result for the authentic logo", async function () {
      const { registry } = await deployContractsFixture();
      await registry.registerAsset(
        "ALU Official Logo",
        "image/png",
        ALU_LOGO_HASH
      );

      const [isAuthentic] = await registry.verifyLogoIntegrity(
        1,
        ALU_LOGO_HASH
      );
      const viewModel = buildVerificationViewModel(isAuthentic);

      expect(viewModel.status).to.equal("success");
      expect(viewModel.heading).to.equal("Logo Verified");
      expect(viewModel.message).to.equal("This is the authentic ALU logo.");
    });

    it("displays a verification failure result for an incorrect hash", async function () {
      const { registry } = await deployContractsFixture();
      await registry.registerAsset(
        "ALU Official Logo",
        "image/png",
        ALU_LOGO_HASH
      );

      const [isAuthentic] = await registry.verifyLogoIntegrity(
        1,
        WRONG_LOGO_HASH
      );
      const viewModel = buildVerificationViewModel(isAuthentic);

      expect(viewModel.status).to.equal("error");
      expect(viewModel.heading).to.equal("Verification Failed");
      expect(viewModel.message).to.equal(
        "Warning: This logo has been modified."
      );
    });

    it("updates the recipient balance after a successful share distribution", async function () {
      const { recipient, logoToken } = await deployContractsFixture();
      const amount = ethers.parseUnits("75000", 18);
      const balanceBefore = await logoToken.balanceOf(recipient.address);

      await logoToken.distributeShares(recipient.address, amount);

      const balanceAfter = await logoToken.balanceOf(recipient.address);
      expect(balanceAfter - balanceBefore).to.equal(amount);
      expect(formatTokenDisplay(balanceAfter)).to.equal("75,000");
    });
  });
});
