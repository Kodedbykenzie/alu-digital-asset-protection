import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { BrowserProvider } from "ethers";
import { APP_CONFIG, hasDeploymentAddresses } from "../config";
import { getReadContracts, getWalletContracts } from "../utils/contracts";
import { formatTokenAmount, getReadableError } from "../utils/formatters";

const Web3Context = createContext(null);

function toHexChainId(chainId) {
  return `0x${Number(chainId).toString(16)}`;
}

export function Web3Provider({ children }) {
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("0");
  const [ownerAddress, setOwnerAddress] = useState("");
  const [chainId, setChainId] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletError, setWalletError] = useState("");

  const walletInstalled =
    typeof window !== "undefined" && Boolean(window.ethereum);

  const isCorrectNetwork = chainId === null || chainId === APP_CONFIG.chainId;
  const isOwner =
    Boolean(account && ownerAddress) &&
    account.toLowerCase() === ownerAddress.toLowerCase();

  const refreshWalletData = useCallback(async (address = account) => {
    if (!address || !hasDeploymentAddresses()) {
      setBalance("0");
      return;
    }

    try {
      const { token } = getReadContracts();
      const [rawBalance, decimals, owner] = await Promise.all([
        token.balanceOf(address),
        token.decimals(),
        token.owner(),
      ]);

      setBalance(formatTokenAmount(rawBalance, Number(decimals)));
      setOwnerAddress(owner);
    } catch (error) {
      setWalletError(getReadableError(error));
    }
  }, [account]);

  const readCurrentChain = useCallback(async () => {
    if (!walletInstalled) return;
    const provider = new BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    setChainId(Number(network.chainId));
  }, [walletInstalled]);

  const connectWallet = useCallback(async () => {
    setWalletError("");

    if (!walletInstalled) {
      setWalletError(
        "MetaMask was not detected. Install MetaMask, refresh the page and try again."
      );
      return;
    }

    if (!hasDeploymentAddresses()) {
      setWalletError(
        "The contracts have not been deployed yet. Run the local deployment script first."
      );
      return;
    }

    setIsConnecting(true);

    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const network = await provider.getNetwork();
      const nextAccount = accounts[0] || "";

      setAccount(nextAccount);
      setChainId(Number(network.chainId));
      await refreshWalletData(nextAccount);
    } catch (error) {
      setWalletError(getReadableError(error));
    } finally {
      setIsConnecting(false);
    }
  }, [refreshWalletData, walletInstalled]);

  const disconnectWallet = useCallback(() => {
    setAccount("");
    setBalance("0");
    setOwnerAddress("");
    setWalletError("");
  }, []);

  const switchNetwork = useCallback(async () => {
    setWalletError("");

    if (!walletInstalled) {
      setWalletError("MetaMask is required to switch networks.");
      return;
    }

    const chainIdHex = toHexChainId(APP_CONFIG.chainId);

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      });
    } catch (error) {
      if (error?.code === 4902 && APP_CONFIG.chainId === 31337) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: chainIdHex,
              chainName: "Hardhat Localhost",
              rpcUrls: [APP_CONFIG.rpcUrl],
              nativeCurrency: {
                name: "Hardhat ETH",
                symbol: "ETH",
                decimals: 18,
              },
            },
          ],
        });
      } else {
        setWalletError(getReadableError(error));
      }
    }
  }, [walletInstalled]);

  useEffect(() => {
    if (!walletInstalled) return undefined;

    const handleAccountsChanged = async (accounts) => {
      const nextAccount = accounts[0] || "";
      setAccount(nextAccount);
      await refreshWalletData(nextAccount);
    };

    const handleChainChanged = (nextChainId) => {
      setChainId(Number.parseInt(nextChainId, 16));
      if (account) refreshWalletData(account);
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);
    readCurrentChain().catch(() => {});

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [account, readCurrentChain, refreshWalletData, walletInstalled]);

  const value = useMemo(
    () => ({
      account,
      balance,
      ownerAddress,
      chainId,
      isConnecting,
      isCorrectNetwork,
      isOwner,
      walletError,
      walletInstalled,
      connectWallet,
      disconnectWallet,
      switchNetwork,
      refreshWalletData,
      getWalletContracts,
    }),
    [
      account,
      balance,
      chainId,
      connectWallet,
      disconnectWallet,
      isConnecting,
      isCorrectNetwork,
      isOwner,
      ownerAddress,
      refreshWalletData,
      switchNetwork,
      walletError,
      walletInstalled,
    ]
  );

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

export function useWeb3() {
  const context = useContext(Web3Context);

  if (!context) {
    throw new Error("useWeb3 must be used inside Web3Provider.");
  }

  return context;
}
