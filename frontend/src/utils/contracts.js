import { BrowserProvider, Contract, JsonRpcProvider } from "ethers";
import registryArtifact from "../abi/ALUAssetRegistry.json";
import tokenArtifact from "../abi/ALULogoToken.json";
import { APP_CONFIG, hasDeploymentAddresses } from "../config";

function assertDeployment() {
  if (!hasDeploymentAddresses()) {
    throw new Error(
      "Contract addresses are missing. Start the Hardhat node and run the deployment script first."
    );
  }
}

export function getReadProvider() {
  assertDeployment();
  return new JsonRpcProvider(APP_CONFIG.rpcUrl);
}

export function getReadContracts() {
  const provider = getReadProvider();

  return {
    provider,
    registry: new Contract(
      APP_CONFIG.registryAddress,
      registryArtifact.abi,
      provider
    ),
    token: new Contract(APP_CONFIG.tokenAddress, tokenArtifact.abi, provider),
  };
}

export async function getWalletContracts() {
  assertDeployment();

  if (!window.ethereum) {
    throw new Error("No Web3 wallet was detected. Please install MetaMask.");
  }

  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  return {
    provider,
    signer,
    registry: new Contract(
      APP_CONFIG.registryAddress,
      registryArtifact.abi,
      signer
    ),
    token: new Contract(APP_CONFIG.tokenAddress, tokenArtifact.abi, signer),
  };
}
