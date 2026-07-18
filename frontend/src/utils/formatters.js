import { formatUnits } from "ethers";

export function shortenAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatTokenAmount(rawAmount, decimals = 18) {
  if (rawAmount === null || rawAmount === undefined) return "0";

  const value = Number(formatUnits(rawAmount, decimals));
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 4,
  });
}

export function formatDateFromTimestamp(timestamp) {
  const value = Number(timestamp);
  if (!value) return "Unknown";

  return new Date(value * 1000).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function getReadableError(error) {
  const message =
    error?.reason ||
    error?.shortMessage ||
    error?.info?.error?.message ||
    error?.message ||
    "Something went wrong.";

  const normalized = message.toLowerCase();

  if (normalized.includes("user rejected") || normalized.includes("denied")) {
    return "The transaction was rejected in your wallet.";
  }

  if (normalized.includes("already registered")) {
    return "This exact file has already been registered on the blockchain.";
  }

  if (normalized.includes("insufficient funds")) {
    return "The connected wallet does not have enough test ETH for gas.";
  }

  if (normalized.includes("could not coalesce") || normalized.includes("network")) {
    return "The dApp could not reach the configured blockchain network. Confirm that the Hardhat node is running.";
  }

  return message.replace(/^execution reverted:\s*/i, "");
}
