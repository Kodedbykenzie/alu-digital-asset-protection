import { useState } from "react";
import FileUploader from "../components/FileUploader";
import StatusMessage from "../components/StatusMessage";
import { useWeb3 } from "../context/Web3Context";
import { getReadableError } from "../utils/formatters";

export default function RegisterAsset() {
  const {
    account,
    isCorrectNetwork,
    walletError,
    connectWallet,
    switchNetwork,
    getWalletContracts,
  } = useWeb3();

  const [assetName, setAssetName] = useState("ALU Official Logo 2026");
  const [fileType, setFileType] = useState("image/png");
  const [contentHash, setContentHash] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  function handleHashGenerated({ hash, file }) {
    setContentHash(hash);
    setFileType(file.type || "image/png");
    setResult(null);
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setResult(null);
    setError("");

    if (!account) {
      setError("Connect your wallet before registering an asset.");
      return;
    }

    if (!isCorrectNetwork) {
      setError("Switch to the configured blockchain network first.");
      return;
    }

    if (!contentHash) {
      setError("Upload an image so the dApp can generate its SHA-256 hash.");
      return;
    }

    if (!assetName.trim() || !fileType.trim()) {
      setError("Asset name and file type are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { registry } = await getWalletContracts();
      const alreadyRegistered = await registry.registeredContentHashes(contentHash);

      if (alreadyRegistered) {
        throw new Error(
          "This exact file has already been registered on the blockchain."
        );
      }

      const transaction = await registry.registerAsset(
        assetName.trim(),
        fileType.trim(),
        contentHash
      );
      const receipt = await transaction.wait();

      let tokenId = "Unknown";
      for (const log of receipt.logs) {
        try {
          const parsedLog = registry.interface.parseLog(log);
          if (parsedLog?.name === "AssetRegistered") {
            tokenId = parsedLog.args.tokenId.toString();
            break;
          }
        } catch {
          // Ignore logs emitted by contracts that do not match this ABI.
        }
      }

      setResult({ tokenId, transactionHash: receipt.hash });
    } catch (submitError) {
      setError(getReadableError(submitError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page-container page-section">
      <div className="page-heading">
        <span className="eyebrow">ERC-721 asset registration</span>
        <h1>Register a logo file</h1>
        <p>
          The file is hashed inside your browser. Only its SHA-256 fingerprint and
          metadata are sent to the blockchain.
        </p>
      </div>

      {walletError ? (
        <StatusMessage type="error" title="Wallet connection issue">
          {walletError}
        </StatusMessage>
      ) : null}

      {!account ? (
        <StatusMessage type="warning" title="Wallet required">
          Connect your Web3 wallet to sign the registration transaction.
        </StatusMessage>
      ) : null}

      {account && !isCorrectNetwork ? (
        <StatusMessage type="warning" title="Wrong network">
          Switch to the network where the contracts were deployed.
        </StatusMessage>
      ) : null}

      <div className="two-column-layout">
        <section className="panel">
          <h2>1. Upload and hash the file</h2>
          <FileUploader onHashGenerated={handleHashGenerated} />
        </section>

        <section className="panel">
          <h2>2. Register the asset</h2>
          <form className="form-stack" onSubmit={handleSubmit}>
            <label>
              Asset name
              <input
                type="text"
                value={assetName}
                onChange={(event) => setAssetName(event.target.value)}
                placeholder="ALU Official Logo 2026"
              />
            </label>

            <label>
              File type
              <input
                type="text"
                value={fileType}
                onChange={(event) => setFileType(event.target.value)}
                placeholder="image/png"
              />
            </label>

            <label>
              SHA-256 content hash
              <textarea
                value={contentHash}
                readOnly
                rows="3"
                placeholder="Upload a file to generate its hash"
              />
            </label>

            {!account ? (
              <button type="button" className="button button-primary" onClick={connectWallet}>
                Connect Wallet
              </button>
            ) : !isCorrectNetwork ? (
              <button type="button" className="button button-warning" onClick={switchNetwork}>
                Switch Network
              </button>
            ) : (
              <button
                type="submit"
                className="button button-primary"
                disabled={isSubmitting || !contentHash}
              >
                {isSubmitting ? "Waiting for confirmation…" : "Register on blockchain"}
              </button>
            )}
          </form>

          {result ? (
            <StatusMessage type="success" title="Asset registered successfully">
              New token ID: {result.tokenId}. Transaction: {result.transactionHash}
            </StatusMessage>
          ) : null}

          {error ? (
            <StatusMessage type="error" title="Registration failed">
              {error}
            </StatusMessage>
          ) : null}
        </section>
      </div>
    </main>
  );
}
