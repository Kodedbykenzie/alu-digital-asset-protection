import { useCallback, useEffect, useState } from "react";
import { isAddress, parseUnits } from "ethers";
import StatusMessage from "../components/StatusMessage";
import { APP_CONFIG } from "../config";
import { useWeb3 } from "../context/Web3Context";
import { getReadContracts } from "../utils/contracts";
import {
  formatTokenAmount,
  getReadableError,
  shortenAddress,
} from "../utils/formatters";

export default function TokenDashboard() {
  const {
    account,
    isOwner,
    isCorrectNetwork,
    connectWallet,
    switchNetwork,
    refreshWalletData,
    getWalletContracts,
  } = useWeb3();

  const [dashboard, setDashboard] = useState({
    totalSupply: "0",
    walletBalance: "0",
    ownershipPercentage: "0",
    ownerAddress: "",
    holders: [],
  });
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDistributing, setIsDistributing] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setError("");
    setIsLoading(true);

    try {
      const { token } = getReadContracts();
      const [totalSupplyRaw, decimals, ownerAddress] = await Promise.all([
        token.totalSupply(),
        token.decimals(),
        token.owner(),
      ]);
      const decimalCount = Number(decimals);

      let walletBalance = "0";
      let ownershipPercentage = "0";

      if (account) {
        const [balanceRaw, percentageRaw] = await Promise.all([
          token.balanceOf(account),
          token.ownershipPercentage(account),
        ]);
        walletBalance = formatTokenAmount(balanceRaw, decimalCount);
        ownershipPercentage = percentageRaw.toString();
      }

      const holderRows = await Promise.all(
        APP_CONFIG.sampleHolders.slice(0, 3).map(async (holder) => {
          const [balanceRaw, percentageRaw] = await Promise.all([
            token.balanceOf(holder.address),
            token.ownershipPercentage(holder.address),
          ]);

          return {
            ...holder,
            balance: formatTokenAmount(balanceRaw, decimalCount),
            percentage: percentageRaw.toString(),
          };
        })
      );

      setDashboard({
        totalSupply: formatTokenAmount(totalSupplyRaw, decimalCount),
        walletBalance,
        ownershipPercentage,
        ownerAddress,
        holders: holderRows,
      });
    } catch (loadError) {
      setError(getReadableError(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [account]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  async function handleDistribution(event) {
    event.preventDefault();
    setMessage(null);
    setError("");

    if (!account) {
      setError("Connect the owner wallet before distributing shares.");
      return;
    }

    if (!isOwner) {
      setError("Only the contract owner can distribute ALUT shares.");
      return;
    }

    if (!isCorrectNetwork) {
      setError("Switch to the configured blockchain network first.");
      return;
    }

    if (!isAddress(recipient)) {
      setError("Enter a valid recipient wallet address.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setError("The token amount must be greater than zero.");
      return;
    }

    setIsDistributing(true);

    try {
      const { token } = await getWalletContracts();
      const decimals = Number(await token.decimals());
      const blockchainAmount = parseUnits(amount, decimals);
      const ownerBalance = await token.balanceOf(account);

      if (blockchainAmount > ownerBalance) {
        throw new Error("The owner has insufficient ALUT balance.");
      }

      const transaction = await token.distributeShares(
        recipient,
        blockchainAmount
      );
      const receipt = await transaction.wait();

      setMessage(
        `Successfully distributed ${Number(amount).toLocaleString("en-US")} ALUT. Transaction: ${receipt.hash}`
      );
      setRecipient("");
      setAmount("");
      await Promise.all([loadDashboard(), refreshWalletData(account)]);
    } catch (distributionError) {
      setError(getReadableError(distributionError));
    } finally {
      setIsDistributing(false);
    }
  }

  return (
    <main className="page-container page-section">
      <div className="page-heading">
        <span className="eyebrow">ERC-20 ownership management</span>
        <h1>ALUT token dashboard</h1>
        <p>
          View the current ownership breakdown and distribute shares from the
          contract owner wallet.
        </p>
      </div>

      {isLoading ? <p className="loading-text">Loading contract data…</p> : null}

      <section className="stats-grid">
        <article className="stat-card">
          <span>Total supply</span>
          <strong>{dashboard.totalSupply}</strong>
          <small>ALUT</small>
        </article>
        <article className="stat-card">
          <span>Connected balance</span>
          <strong>{dashboard.walletBalance}</strong>
          <small>ALUT</small>
        </article>
        <article className="stat-card">
          <span>Your ownership</span>
          <strong>{dashboard.ownershipPercentage}%</strong>
          <small>of total supply</small>
        </article>
      </section>

      <div className="two-column-layout dashboard-layout">
        <section className="panel">
          <div className="panel-heading-row">
            <div>
              <h2>Ownership overview</h2>
              <p className="panel-intro">Example holders loaded directly from ALULogoToken.</p>
            </div>
          </div>

          {dashboard.holders.length ? (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Holder</th>
                    <th>Wallet</th>
                    <th>Balance</th>
                    <th>Ownership</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.holders.map((holder) => (
                    <tr key={holder.address}>
                      <td>{holder.label}</td>
                      <td>{shortenAddress(holder.address)}</td>
                      <td>{holder.balance} ALUT</td>
                      <td>{holder.percentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <StatusMessage type="info" title="Sample holders not loaded">
              Run the updated deployment script to create and save three example holder addresses.
            </StatusMessage>
          )}

          <p className="contract-owner-line">
            Contract owner: <strong>{shortenAddress(dashboard.ownerAddress)}</strong>
          </p>
        </section>

        <section className="panel">
          <h2>Distribute shares</h2>
          <p className="panel-intro">
            This transaction is protected by the smart contract&apos;s onlyOwner modifier.
          </p>

          {!account ? (
            <>
              <StatusMessage type="warning" title="Wallet required">
                Connect the contract owner wallet to access this form.
              </StatusMessage>
              <button className="button button-primary" onClick={connectWallet}>
                Connect Wallet
              </button>
            </>
          ) : !isCorrectNetwork ? (
            <button className="button button-warning" onClick={switchNetwork}>
              Switch Network
            </button>
          ) : !isOwner ? (
            <StatusMessage type="error" title="Owner-only function">
              The connected wallet is not the contract owner. The smart contract would reject an attempted distribution.
            </StatusMessage>
          ) : (
            <form className="form-stack" onSubmit={handleDistribution}>
              <label>
                Recipient wallet
                <input
                  type="text"
                  value={recipient}
                  onChange={(event) => setRecipient(event.target.value)}
                  placeholder="0x..."
                />
              </label>
              <label>
                Amount of ALUT
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="10000"
                />
              </label>
              <button
                type="submit"
                className="button button-primary"
                disabled={isDistributing}
              >
                {isDistributing ? "Waiting for confirmation…" : "Distribute shares"}
              </button>
            </form>
          )}

          {message ? (
            <StatusMessage type="success" title="Distribution confirmed">
              {message}
            </StatusMessage>
          ) : null}

          {error ? (
            <StatusMessage type="error" title="Distribution failed">
              {error}
            </StatusMessage>
          ) : null}
        </section>
      </div>
    </main>
  );
}
