import { NavLink } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";
import { shortenAddress } from "../utils/formatters";

export default function Navbar() {
  const {
    account,
    balance,
    isConnecting,
    isCorrectNetwork,
    connectWallet,
    disconnectWallet,
    switchNetwork,
  } = useWeb3();

  return (
    <header className="site-header">
      <div className="nav-container">
        <NavLink to="/" className="brand" aria-label="ALU Digital Asset Protection">
          <img src="/alu-logo.png" alt="African Leadership University" />
          <span>Digital Asset Protection</span>
        </NavLink>

        <nav className="main-nav" aria-label="Main navigation">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/register">Register</NavLink>
          <NavLink to="/verify">Verify</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
        </nav>

        <div className="wallet-area">
          {account ? (
            <>
              {!isCorrectNetwork ? (
                <button className="button button-warning" onClick={switchNetwork}>
                  Switch network
                </button>
              ) : null}
              <div className="wallet-summary">
                <strong>{shortenAddress(account)}</strong>
                <span>{balance} ALUT</span>
              </div>
              <button className="button button-outline-light" onClick={disconnectWallet}>
                Disconnect
              </button>
            </>
          ) : (
            <button
              className="button button-primary"
              onClick={connectWallet}
              disabled={isConnecting}
            >
              {isConnecting ? "Connecting…" : "Connect Wallet"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
