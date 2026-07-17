# ALU Digital Asset Protection

This project registers the official ALU logo on a local Ethereum blockchain and tokenises ownership shares of that logo. `ALUAssetRegistry.sol` uses ERC-721 to register the logo as a unique NFT with a SHA-256 fingerprint of the exact file. `ALULogoToken.sol` uses ERC-20 to issue 1,000,000 ALUT fungible tokens that represent fractional ownership shares in the logo.

## ALU logo SHA-256 hash

The `alu-logo.png` file included in this project was generated from the ALU logo image hosted on the official ALU website and saved in PNG format.

```text
0xe03128e7ed668d74c334ed965edf89d0e1b3da112f6aeb6233bfd191ad829348
```

To independently verify the hash, run:

```bash
npm run hash-logo
```

## Versions used

- Solidity: `0.8.20`
- Hardhat: `^2.28.6`
- OpenZeppelin Contracts: `^5.6.1`
- Node.js tested target: Node 20 or newer

## Setup instructions

1. Install Node.js from `nodejs.org`.
2. Open the project folder in VS Code or Terminal.
3. Install dependencies:

```bash
npm install
```

4. Compile the contracts:

```bash
npm run compile
```

5. Run the automated tests:

```bash
npm test
```

6. Start a local blockchain in one terminal:

```bash
npm run node
```

7. In a second terminal, deploy both contracts to the local blockchain:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

The deployment script deploys `ALUAssetRegistry`, calculates the SHA-256 hash of `alu-logo.png`, registers the logo as token ID 1, then deploys `ALULogoToken` and mints the full 1,000,000 ALUT supply to the deployer's wallet.

## Project structure

```text
contracts/ALUAssetRegistry.sol      ERC-721 contract for unique logo registration
contracts/ALULogoToken.sol          ERC-20 contract for tokenised ownership shares
scripts/deploy.js                   Deploys both contracts and registers the logo
scripts/hash-logo.js                Generates the SHA-256 hash of alu-logo.png
test/ALUAssetRegistry.test.js       Eight automated tests
alu-logo.png                        Logo file used for hashing and registration
hardhat.config.js                   Hardhat configuration
```

## Development notes and problems resolved

- OpenZeppelin Contracts v5 requires `Ownable(initialOwner)`, so both contracts pass the owner address into the `Ownable` constructor.
- ERC-20 balances use 18 decimals. For example, 100,000 ALUT is represented in code as `ethers.parseUnits("100000", 18)`.
- The registry prevents duplicate file registration by mapping every `bytes32` content hash to a boolean.
- The deployment script hashes the real local `alu-logo.png` file instead of using a placeholder value, reducing the risk of registering the wrong fingerprint.


