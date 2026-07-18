import { Link } from "react-router-dom";
import { APP_CONFIG, hasDeploymentAddresses } from "../config";
import StatusMessage from "../components/StatusMessage";
import { shortenAddress } from "../utils/formatters";

export default function Home() {
  const deployed = hasDeploymentAddresses();

  return (
    <main>
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">Blockchain-backed authenticity</span>
          <h1>Protecting the official ALU logo with verifiable digital ownership.</h1>
          <p>
            Register logo files, verify authenticity without a wallet, and view
            ALUT ownership shares through a simple Web3 interface.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" to="/verify">
              Verify a logo
            </Link>
            <Link className="button button-secondary" to="/register">
              Register an asset
            </Link>
          </div>
        </div>

        <div className="hero-card" aria-label="Official ALU logo fingerprint">
          <img src="/alu-logo.png" alt="African Leadership University" />
          <div>
            <span>Official fingerprint</span>
            <code>{APP_CONFIG.logoHash}</code>
          </div>
        </div>
      </section>

      {!deployed ? (
        <div className="page-container compact-top">
          <StatusMessage type="warning" title="Local deployment required">
            Start the Hardhat node and run the deployment script. The script will
            update the frontend with the current contract addresses.
          </StatusMessage>
        </div>
      ) : null}

      <section className="page-container feature-grid">
        <article className="feature-card">
          <span className="feature-number">01</span>
          <h2>Register</h2>
          <p>
            Hash an image inside the browser and permanently register the unique
            fingerprint as an ERC-721 asset.
          </p>
        </article>
        <article className="feature-card">
          <span className="feature-number">02</span>
          <h2>Verify</h2>
          <p>
            Upload a logo or paste a hash and receive a clear authenticity result
            through a free read-only blockchain call.
          </p>
        </article>
        <article className="feature-card">
          <span className="feature-number">03</span>
          <h2>Distribute</h2>
          <p>
            View the 1,000,000 ALUT supply and allow only the contract owner to
            distribute ownership shares.
          </p>
        </article>
      </section>

      {deployed ? (
        <section className="page-container contract-strip">
          <div>
            <span>Asset registry</span>
            <strong>{shortenAddress(APP_CONFIG.registryAddress)}</strong>
          </div>
          <div>
            <span>ALUT token</span>
            <strong>{shortenAddress(APP_CONFIG.tokenAddress)}</strong>
          </div>
          <div>
            <span>Registered token ID</span>
            <strong>#{APP_CONFIG.logoTokenId}</strong>
          </div>
          <div>
            <span>Network chain ID</span>
            <strong>{APP_CONFIG.chainId}</strong>
          </div>
        </section>
      ) : null}
    </main>
  );
}
