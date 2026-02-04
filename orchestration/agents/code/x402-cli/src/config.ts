import Conf from 'conf';
import { CLIConfig, WalletConfig } from './types.js';
import { randomBytes } from 'crypto';
import { privateKeyToAccount, generatePrivateKey } from 'viem/accounts';

const config = new Conf<CLIConfig>({
  projectName: 'x402-cli',
  defaults: {
    wallet: {
      network: 'base-sepolia',
    },
    directoryUrl: 'https://x402-directory.claudia.dev',
    defaultNetwork: 'base-sepolia',
  },
});

export function getConfig(): CLIConfig {
  return config.store;
}

export function setWalletConfig(wallet: Partial<WalletConfig>): void {
  const current = config.get('wallet');
  config.set('wallet', { ...current, ...wallet });
}

export function getWalletConfig(): WalletConfig {
  return config.get('wallet');
}

export function setDirectoryUrl(url: string): void {
  config.set('directoryUrl', url);
}

export function getDirectoryUrl(): string {
  return config.get('directoryUrl');
}

export function setDefaultNetwork(network: string): void {
  config.set('defaultNetwork', network);
}

export function getDefaultNetwork(): string {
  return config.get('defaultNetwork');
}

export function generateNewWallet(): { privateKey: string; address: string } {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);
  return {
    privateKey,
    address: account.address,
  };
}

export function importWallet(privateKey: string): { address: string } {
  const account = privateKeyToAccount(privateKey as `0x${string}`);
  return {
    address: account.address,
  };
}

export function hasWallet(): boolean {
  const wallet = config.get('wallet');
  return !!wallet.privateKey && !!wallet.address;
}

export function clearConfig(): void {
  config.clear();
}

export function getConfigPath(): string {
  return config.path;
}
