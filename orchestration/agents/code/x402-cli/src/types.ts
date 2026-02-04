/**
 * Type definitions for x402 CLI
 */

export interface Service {
  id: string;
  name: string;
  description: string;
  url: string;
  price: {
    amount: string;
    token: string;
    decimals: number;
  };
  category: string;
  tags: string[];
  featured: boolean;
  createdAt: string;
}

export interface PaymentRequirements {
  scheme: string;
  network: string;
  requiredToken: string;
  requiredAmount: string;
  payToAddress: string;
  description: string;
  extra?: Record<string, unknown>;
}

export interface PaymentReceipt {
  txHash: string;
  network: string;
  amount: string;
  token: string;
  timestamp: string;
}

export interface PaymentResponse {
  receipt: PaymentReceipt;
  serviceResponse: unknown;
}

export interface UsageRecord {
  id: string;
  serviceId: string;
  serviceName: string;
  endpoint: string;
  amount: string;
  token: string;
  txHash: string;
  timestamp: string;
  status: 'success' | 'failed';
}

export interface WalletConfig {
  privateKey?: string;
  address?: string;
  network: 'base' | 'base-sepolia';
  rpcUrl?: string;
}

export interface CLIConfig {
  wallet: WalletConfig;
  directoryUrl: string;
  defaultNetwork: string;
}

export interface ServiceEndpoint {
  path: string;
  method: string;
  description: string;
  price?: string;
}

export interface ServiceDetails extends Service {
  endpoints: ServiceEndpoint[];
  documentation?: string;
  version?: string;
  uptime?: number;
}
