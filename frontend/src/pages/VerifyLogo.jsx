import { useState } from "react";
import FileUploader from "../components/FileUploader";
import StatusMessage from "../components/StatusMessage";
import { APP_CONFIG } from "../config";
import { getReadContracts } from "../utils/contracts";
import {
  formatDateFromTimestamp,
  getReadableError,
  shortenAddress,
} from "../utils/formatters";
import { isValidBytes32Hash } from "../utils/hashFile";

export default function VerifyLogo() {
  const [pastedHash, setPastedHash] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verification, setVerification] = useState(null);
  const [error, setError] = useState("");

  async function verifyHash(hash) {
    const normalizedHash = hash.trim();
    setVerification(null);
    setError("");

    if (!isValidBytes32Hash(normalizedHash)) {
      setError("Enter a valid SHA-256 hash beginning with 0x and containing 64 hexadecimal characters.");
      return;
    }

    setIsVerifying(true);

    try {
      const { registry } = getReadContracts();
      const [isAuthentic] = await registry.verifyLogoIntegrity(
        APP_CONFIG.logoTokenId,
        normalizedHash
      );

      if (!isAuthentic) {
        setVerification({ authentic: false });
        return;
      }

      const asset = await registry.getAsset(APP_CONFIG.logoTokenId);
      setVerification({
        authentic: true,
        metadata: {
          assetName: asset.assetName,
          fileType: asset.fileType,
          registeredBy: asset.registeredBy,
          registeredAt: asset.registeredAt,
        },
      });
    } catch (verificationError) {
      setError(getReadableError(verificationError));
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleFileHash({ hash }) {
    await verifyHash(hash);
  }

  function handleHashSubmit(event) {
    event.preventDefault();
    verifyHash(pastedHash);
  }

  return (
    <main className="page-container page-section">
      <div className="page-heading">
        <span className="eyebrow">Public read-only verification</span>
        <h1>Verify an ALU logo</h1>
        <p>
          No wallet is required. Upload a logo or paste a SHA-256 hash to compare it
          with the official blockchain record.
        </p>
      </div>

      <div className="two-column-layout">
        <section className="panel">
          <h2>Verify by file upload</h2>
          <p className="panel-intro">
            The file remains on your device and is automatically hashed in the browser.
          </p>
          <FileUploader
            label="Upload a logo to verify"
            onHashGenerated={handleFileHash}
            disabled={isVerifying}
          />
        </section>

        <section className="panel">
          <h2>Verify by hash</h2>
          <p className="panel-intro">
            Paste an existing SHA-256 bytes32 fingerprint.
          </p>
          <form className="form-stack" onSubmit={handleHashSubmit}>
            <label>
              SHA-256 hash
              <textarea
                value={pastedHash}
                onChange={(event) => setPastedHash(event.target.value)}
                rows="4"
                placeholder="0x..."
              />
            </label>
            <button
              type="submit"
              className="button button-primary"
              disabled={isVerifying}
            >
              {isVerifying ? "Checking blockchain…" : "Verify hash"}
            </button>
          </form>
        </section>
      </div>

      {verification?.authentic ? (
        <section className="verification-result verification-success">
          <div className="verification-symbol">✓</div>
          <div>
            <span className="result-label">Logo verified</span>
            <h2>This is the authentic ALU logo.</h2>
            <p>
              Its SHA-256 fingerprint matches the official record stored on the
              blockchain.
            </p>
            <dl className="metadata-grid">
              <div>
                <dt>Asset name</dt>
                <dd>{verification.metadata.assetName}</dd>
              </div>
              <div>
                <dt>File type</dt>
                <dd>{verification.metadata.fileType}</dd>
              </div>
              <div>
                <dt>Registered by</dt>
                <dd>{shortenAddress(verification.metadata.registeredBy)}</dd>
              </div>
              <div>
                <dt>Registered on</dt>
                <dd>{formatDateFromTimestamp(verification.metadata.registeredAt)}</dd>
              </div>
            </dl>
          </div>
        </section>
      ) : null}

      {verification && !verification.authentic ? (
        <section className="verification-result verification-failure">
          <div className="verification-symbol">!</div>
          <div>
            <span className="result-label">Verification failed</span>
            <h2>Warning: This logo has been modified.</h2>
            <p>
              The fingerprint does not match the official ALU logo registered on the
              blockchain. Do not treat this file as an authentic copy.
            </p>
          </div>
        </section>
      ) : null}

      {error ? (
        <StatusMessage type="error" title="Unable to verify">
          {error}
        </StatusMessage>
      ) : null}
    </main>
  );
}
