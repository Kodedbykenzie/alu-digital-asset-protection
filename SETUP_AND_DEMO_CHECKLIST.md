# Setup, Screenshot and Demonstration Checklist

## Before running

- Use Node.js 20 LTS where possible.
- Confirm both root and frontend `package.json` files exist.
- Run `npm install` in the root.
- Run `npm install` inside `frontend`.

## Start the application

Terminal 1:

```bash
npm run node
```

Terminal 2:

```bash
npm run deploy:local
```

Terminal 3:

```bash
cd frontend
npm run dev
```

## MetaMask

- Add Hardhat network: `http://127.0.0.1:8545`, chain ID `31337`.
- Import the first Hardhat test account using the private key printed by the node.
- Never use the Hardhat key for real assets.

## Required screenshots for the report

1. Home page with navigation and Connect Wallet button.
2. Connected wallet showing shortened address and ALUT balance.
3. File upload preview and generated SHA-256 hash.
4. Successful asset registration using a different image from `alu-logo.png`.
5. Duplicate rejection when attempting to register the official logo again.
6. Authentic verification result using `alu-logo.png`.
7. Failed verification result using a modified logo.
8. Dashboard showing total supply, connected balance and three sample holders.
9. Owner-only distribution form and confirmed transfer.
10. Terminal showing `13 passing`.

## Demonstration order

1. Introduce the problem and the two contracts.
2. Show the home page.
3. Connect MetaMask.
4. Show in-browser hashing and asset registration.
5. Show duplicate protection.
6. Disconnect the dApp and verify the official logo to prove no wallet is required.
7. Verify a modified image and show the warning.
8. Reconnect the owner wallet.
9. Show total supply, owner balance and example holders.
10. Distribute tokens to another Hardhat account.
11. Show the updated recipient balance.
12. Show all thirteen tests passing.
13. Show the GitHub repository and mention the README.

## Before submission

- Replace the video placeholder in README and report.
- Insert real screenshots into the report.
- Export the report as `Project_Report.pdf`.
- Run `npm test` and capture `13 passing`.
- Run `cd frontend && npm run build`.
- Confirm no `.env`, real private keys or `node_modules` folders are in the ZIP.
- Push the final commits to GitHub.
- Download or create the final repository ZIP.
