import { 
  createWalletClient, 
  createPublicClient, 
  http, 
  parseEther,
  formatEther,
  erc20Abi,
  type PublicClient,
  type WalletClient,
  type Account 
} from 'viem';
import { base, baseSepolia, type Chain } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import { getWalletConfig } from './config.js';
import { WalletConfig } from './types.js';

const USDC_CONTRACTS: Record<string, `0x${string}`> = {
  'base': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  'base-sepolia': '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
};

export function getChain(network: string): Chain {
  switch (network) {
    case 'base':
      return base;
    case 'base-sepolia':
      return baseSepolia;
    default:
      return baseSepolia;
  }
}

export function getUsdcContract(network: string): `0x${string}` {
  return USDC_CONTRACTS[network] || USDC_CONTRACTS['base-sepolia'];
}

export function createClients(config: WalletConfig): { 
  publicClient: PublicClient; 
  walletClient: WalletClient; 
  account: Account 
} {
  const chain = getChain(config.network || 'base-sepolia');
  
  if (!config.privateKey) {
    throw new Error('No wallet configured. Run: x402 wallet setup');
  }

  const account = privateKeyToAccount(config.privateKey as `0x${string}`);
  
  const publicClient = createPublicClient({
    chain,
    transport: config.rpcUrl ? http(config.rpcUrl) : http(),
  });

  const walletClient = createWalletClient({
    account,
    chain,
    transport: config.rpcUrl ? http(config.rpcUrl) : http(),
  });

  return { publicClient, walletClient, account };
}

export async function getBalance(address: string, network?: string): Promise<{ 
  eth: string; 
  usdc: string;
  network: string;
}> {
  const config = getWalletConfig();
  const targetNetwork: 'base' | 'base-sepolia' = (network as 'base' | 'base-sepolia') || config.network || 'base-sepolia';
  const tempConfig: WalletConfig = { ...config, network: targetNetwork };
  const { publicClient } = createClients(tempConfig);
  
  const usdcContract = getUsdcContract(targetNetwork);

  const [ethBalance, usdcBalance] = await Promise.all([
    publicClient.getBalance({ address: address as `0x${string}` }),
    publicClient.readContract({
      address: usdcContract,
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [address as `0x${string}`],
    }),
  ]);

  return {
    eth: formatEther(ethBalance),
    usdc: (Number(usdcBalance) / 1_000_000).toFixed(2),
    network: targetNetwork,
  };
}

export async function sendPayment(
  to: string,
  amount: string,
  token: string,
  network?: string
): Promise<{ txHash: string }> {
  const config = getWalletConfig();
  const targetNetwork: 'base' | 'base-sepolia' = (network as 'base' | 'base-sepolia') || config.network || 'base-sepolia';
  const tempConfig: WalletConfig = { ...config, network: targetNetwork };
  const { walletClient, publicClient, account } = createClients(tempConfig);
  const chain = getChain(targetNetwork);
  
  const usdcContract = getUsdcContract(targetNetwork);
  const amountBigInt = BigInt(amount);

  let txHash: `0x${string}`;

  if (token.toLowerCase() === 'eth' || token.toLowerCase().includes('ether')) {
    txHash = await walletClient.sendTransaction({
      account,
      chain,
      to: to as `0x${string}`,
      value: amountBigInt,
    });
  } else {
    // USDC payment
    txHash = await walletClient.writeContract({
      account,
      chain,
      address: usdcContract,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [to as `0x${string}`, amountBigInt],
    });
  }

  // Wait for receipt
  await publicClient.waitForTransactionReceipt({ hash: txHash });

  return { txHash };
}

export async function getTransactionHistory(address: string, network?: string): Promise<{
  transactions: Array<{
    hash: string;
    type: 'send' | 'receive';
    amount: string;
    token: string;
    to?: string;
    from?: string;
    timestamp: string;
  }>;
}> {
  // This would integrate with a block explorer API
  // For now, return empty (can be enhanced with Etherscan/Basescan API)
  return { transactions: [] };
}

export function getExplorerUrl(txHash: string, network: string): string {
  const baseUrl = network === 'base' 
    ? 'https://basescan.org'
    : 'https://sepolia.basescan.org';
  return `${baseUrl}/tx/${txHash}`;
}

export function getAddress(): string {
  const config = getWalletConfig();
  if (!config.address) {
    throw new Error('No wallet configured. Run: x402 wallet setup');
  }
  return config.address;
}

export function getNetwork(): string {
  const config = getWalletConfig();
  return config.network;
}
