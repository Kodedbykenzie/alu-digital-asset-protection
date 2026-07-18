# ALU Digital Asset Protection DApp

## Project Overview

This project protects the official African Leadership University (ALU) logo through blockchain-based registration, public integrity verification and tokenised ownership management.

The project combines two Solidity smart contracts with a React frontend:

- `ALUAssetRegistry.sol` registers image fingerprints as ERC-721 assets.
- `ALULogoToken.sol` creates 1,000,000 ALUT ERC-20 tokens representing fractional ownership shares.
- The React dApp allows non-technical users to connect MetaMask, hash an image inside the browser, register an asset, verify a logo without a wallet and view or distribute ALUT shares.

## Formative Assessment 1: Smart Contracts

### ALUAssetRegistry

`ALUAssetRegistry` stores the asset name, file type, SHA-256 content hash, registering wallet and registration timestamp. Each successful registration mints an ERC-721 token to the caller. The contract rejects a duplicate content hash.

Important functions:

- `registerAsset(string assetName, string fileType, bytes32 contentHash)`
- `verifyLogoIntegrity(uint256 tokenId, bytes32 suppliedHash)`
- `getAsset(uint256 tokenId)`
- `registeredContentHashes(bytes32 hash)`

### ALULogoToken

`ALULogoToken` mints a fixed supply of 1,000,000 ALUT to the initial owner. Only the owner can call `distributeShares()`.

Important functions:

- `totalSupply()`
- `balanceOf(address holder)`
- `ownershipPercentage(address holder)`
- `distributeShares(address recipient, uint256 amount)`
- `owner()`

## Assignment 2: DApp Integration

### Implemented Features

1. **Wallet connection**
   - MetaMask connection from every page.
   - Shortened wallet address and current ALUT balance.
   - Helpful message when MetaMask is unavailable.
   - Local Hardhat network switching.
   - Local dApp disconnect state.

2. **Logo upload and browser hashing**
   - Image preview.
   - SHA-256 calculation using the Web Crypto API.
   - Correct `bytes32` formatting with a `0x` prefix.
   - No server-side file upload.

3. **Asset registration**
   - Asset name and file type form.
   - Wallet approval before submitting a transaction.
   - Duplicate-hash pre-check and smart-contract rejection handling.
   - Confirmation message showing the minted token ID and transaction hash.

4. **Public logo verification**
   - Verification by uploaded image.
   - Verification by pasted SHA-256 hash.
   - No wallet required because the page uses read-only calls.
   - Clear success or warning result for non-technical users.
   - Registered metadata shown for an authentic logo.

5. **Token dashboard**
   - Total ALUT supply.
   - Connected-wallet balance and ownership percentage.
   - Three example holders and their percentages.
   - Owner-only share distribution form.
   - Recipient and amount validation.
   - Automatic balance refresh after a confirmed transfer.

## ALU Logo SHA-256 Hash

The registered ALU logo hash is:

```text
0xe03128e7ed668d74c334ed965edf89d0e1b3da112f6aeb6233bfd191ad829348
```

To independently calculate the hash of the included file:

```bash
npm run hash-logo
```

## Architecture

```text
User
  |
  v
React dApp
  |-- Web Crypto API --> SHA-256 file fingerprint
  |
  |-- ethers.js read provider --> Public verification calls
  |
  `-- MetaMask signer --> State-changing transactions
                               |
                               v
                    Hardhat local blockchain
                      |                 |
                      v                 v
              ALUAssetRegistry     ALULogoToken
                 ERC-721              ERC-20
```

The ABI files describe the public contract interfaces that ethers.js can call. The deployment script copies the current ABIs and contract addresses into the frontend after deployment.

## Project Structure

```text
contracts/
  ALUAssetRegistry.sol
  ALULogoToken.sol
scripts/
  deploy.js
  hash-logo.js
test/
  ALUAssetRegistry.test.js
frontend/
  public/
    alu-logo.png
  src/
    abi/
    components/
    context/
    contracts/
    pages/
    utils/
    App.jsx
    App.css
    config.js
    index.css
    main.jsx
alu-logo.png
hardhat.config.js
package.json
README.md
Project_Report.pdf
```

## Versions

- Node.js target: `20 LTS`
- Solidity: `0.8.20`
- Hardhat: `2.28.6`
- OpenZeppelin Contracts: `5.0.2`
- ethers.js: `6.17.x`
- React: `19.2.x`
- Vite: `8.1.x`

Node.js 20 LTS is recommended. Node.js 23 may show a Hardhat compatibility warning.

## Installation

Clone the repository and enter it:

```bash
git clone https://github.com/Kodedbykenzie/alu-digital-asset-protection.git
cd alu-digital-asset-protection
```

Install the Hardhat dependencies:

```bash
npm install
```

Install the frontend dependencies:

```bash
cd frontend
npm install
cd ..
```

## Compile and Run the Thirteen Tests

```bash
npm run compile
npm test
```

Expected result:

```text
13 passing
```

The final five tests cover:

- Reading and formatting the 1,000,000 ALUT total supply.
- Correct browser-style SHA-256 bytes32 hashing.
- Successful logo-verification result.
- Failed logo-verification result.
- Recipient balance update after share distribution.

## Run the Full DApp Locally

Use three terminal windows.

### Terminal 1: Start Hardhat

From the repository root:

```bash
npm run node
```

Leave this terminal running.

### Terminal 2: Deploy the Contracts

From the repository root:

```bash
npm run deploy:local
```

The deployment script:

1. Hashes `alu-logo.png`.
2. Deploys `ALUAssetRegistry`.
3. Registers the official logo as token ID `1`.
4. Deploys `ALULogoToken`.
5. Distributes sample ALUT balances to three Hardhat accounts.
6. Writes the current contract addresses, holder addresses and ABIs to the frontend.

Do not restart the Hardhat node after deploying unless you also deploy again. A restarted local chain has new state, while old contract addresses no longer contain the deployed code.

### Terminal 3: Start React

```bash
cd frontend
npm run dev
```

Open the Vite address shown in the terminal, normally:

```text
http://localhost:5173
```

## Connect MetaMask to Hardhat

### Add the Local Network

The dApp can request this automatically, or add it manually:

- Network name: `Hardhat Localhost`
- RPC URL: `http://127.0.0.1:8545`
- Chain ID: `31337`
- Currency symbol: `ETH`

### Import a Test Account

1. Look at the terminal running `npx hardhat node`.
2. Copy the private key for the first test account.
3. In MetaMask, choose **Add account or hardware wallet** and then **Import account**.
4. Paste the Hardhat private key.
5. Use this test account only on the local development network.

Never use or publish the private key of a real wallet. Hardhat test keys are public development credentials and must never hold real assets.

## Using the DApp

### Register an Asset

1. Open **Register**.
2. Connect the owner wallet.
3. Upload an image.
4. Confirm the preview and generated hash.
5. Enter the asset name and file type.
6. Select **Register on blockchain**.
7. Approve the transaction in MetaMask.
8. Wait for the token ID confirmation.

The official logo is already registered during deployment, so attempting to register `alu-logo.png` again correctly displays a duplicate warning. To demonstrate a successful second registration, use a different image file.

### Verify a Logo Without a Wallet

1. Open **Verify**.
2. Upload `alu-logo.png` to see an authentic result.
3. Upload a modified image to see a warning result.
4. Alternatively, paste a bytes32 SHA-256 hash and select **Verify hash**.

### View and Distribute ALUT Shares

1. Open **Dashboard**.
2. Connect a wallet to view its balance and percentage.
3. Connect the first Hardhat account to use the owner-only form.
4. Enter a valid recipient address and token amount.
5. Approve the transaction in MetaMask.
6. Confirm that the balance data refreshes.

## Read Calls and Transactions

A read-only call retrieves stored blockchain data without changing state. It does not require a wallet signature and does not create an on-chain gas charge when called through the RPC provider. Examples include `verifyLogoIntegrity()`, `getAsset()`, `totalSupply()` and `balanceOf()`.

A transaction changes blockchain state. It requires a wallet signer, user approval and gas. Examples include `registerAsset()` and `distributeShares()`.

The user signs transactions because their wallet controls their private key. The dApp prepares the transaction but must not hold or use the user's private key.

## Known Issues and Limitations

- The default configuration uses a blockchain running on the developer's computer. Other people cannot use the deployed local contracts from a separately hosted website.
- Restarting the Hardhat node removes the previous local deployment and requires redeployment.
- The ownership percentage function returns a whole-number percentage, so holdings below 1% display as `0%`.
- The dApp supports MetaMask directly. WalletConnect and Coinbase Wallet are not separately configured.
- The current ERC-20 contract represents ownership shares but does not implement shareholder voting or governance.
- Browser-level disconnect does not revoke MetaMask permissions; it clears the dApp's local wallet state.

For public access, the contracts would need to be deployed to an Ethereum testnet such as Sepolia and the frontend would need a public RPC endpoint and the testnet contract addresses.

## Security and Design Decisions

- Files are hashed in the browser and are not sent to a server.
- Duplicate content hashes are rejected by the smart contract.
- `distributeShares()` uses `onlyOwner` for contract-level access control.
- The frontend also hides the distribution form from non-owner accounts, but the smart contract remains the final security boundary.
- No wallet private keys are stored in the project.
- Environment files and generated dependency folders are excluded through `.gitignore`.

## External Libraries and Learning Resources

- OpenZeppelin Contracts for audited ERC-721, ERC-20 and Ownable implementations.
- Hardhat for local blockchain development, deployment and automated testing.
- ethers.js for providers, signers, ABI contract instances and token formatting.
- React and Vite for the user interface and development server.
- Web Crypto API for in-browser SHA-256 hashing.

