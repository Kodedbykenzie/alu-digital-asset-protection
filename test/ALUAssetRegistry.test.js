const { expect } = require("chai");
const { ethers } = require("hardhat");

const ALU_LOGO_HASH = "0xe03128e7ed668d74c334ed965edf89d0e1b3da112f6aeb6233bfd191ad829348";
const WRONG_LOGO_HASH = "0x1111111111111111111111111111111111111111111111111111111111111111";

describe("ALUAssetRegistry and ALULogoToken", function () {
  async function deployContractsFixture() {
    const [owner, recipient, otherAccount] = await ethers.getSigners();

    const Registry = await ethers.getContractFactory("ALUAssetRegistry");
    const registry = await Registry.deploy();
    await registry.waitForDeployment();

    const LogoToken = await ethers.getContractFactory("ALULogoToken");
    const logoToken = await LogoToken.deploy(owner.address);
    await logoToken.waitForDeployment();

    return { owner, recipient, otherAccount, registry, logoToken };
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

      await registry.registerAsset("ALU Official Logo", "image/png", ALU_LOGO_HASH);
      expect(await registry.ownerOf(1)).to.equal(owner.address);
    });

    it("rejects a duplicate registration using the same hash", async function () {
      const { registry } = await deployContractsFixture();

      await registry.registerAsset("ALU Official Logo", "image/png", ALU_LOGO_HASH);

      await expect(
        registry.registerAsset("ALU Official Logo Copy", "image/png", ALU_LOGO_HASH)
      ).to.be.revertedWith("Asset with this content hash already registered");
    });

    it("verifyLogoIntegrity returns true for the correct logo hash", async function () {
      const { registry } = await deployContractsFixture();

      await registry.registerAsset("ALU Official Logo", "image/png", ALU_LOGO_HASH);
      const result = await registry.verifyLogoIntegrity(1, ALU_LOGO_HASH);

      expect(result[0]).to.equal(true);
      expect(result[1]).to.equal("Logo is authentic.");
    });

    it("verifyLogoIntegrity returns false for an incorrect logo hash", async function () {
      const { registry } = await deployContractsFixture();

      await registry.registerAsset("ALU Official Logo", "image/png", ALU_LOGO_HASH);
      const result = await registry.verifyLogoIntegrity(1, WRONG_LOGO_HASH);

      expect(result[0]).to.equal(false);
      expect(result[1]).to.equal("Warning: logo does not match.");
    });

    it("getAsset returns the correct asset name and file type", async function () {
      const { registry } = await deployContractsFixture();

      await registry.registerAsset("ALU Official Logo", "image/png", ALU_LOGO_HASH);
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

      expect(await logoToken.ownershipPercentage(recipient.address)).to.equal(25);
    });
  });
});
