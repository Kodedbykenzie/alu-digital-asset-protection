import deployment from "./contracts/deployment.json";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const APP_CONFIG = {
  chainId: Number(deployment.chainId || 31337),
  registryAddress:
    import.meta.env.VITE_REGISTRY_ADDRESS || deployment.registryAddress,
  tokenAddress: import.meta.env.VITE_TOKEN_ADDRESS || deployment.tokenAddress,
  logoTokenId: Number(deployment.logoTokenId || 1),
  logoHash: deployment.logoHash,
  sampleHolders: deployment.sampleHolders || [],
  rpcUrl: import.meta.env.VITE_RPC_URL || "http://127.0.0.1:8545",
};

export function hasDeploymentAddresses() {
  return (
    APP_CONFIG.registryAddress &&
    APP_CONFIG.registryAddress !== ZERO_ADDRESS &&
    APP_CONFIG.tokenAddress &&
    APP_CONFIG.tokenAddress !== ZERO_ADDRESS
  );
}
