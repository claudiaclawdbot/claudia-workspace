/**
 * Configuration Module
 * Loads and validates environment configuration
 */

import { ServiceConfig } from './types';
import * as dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config();

// Default x402 Payment Contract on Base (placeholder - update with actual)
const X402_PAYMENT_CONTRACT = process.env.X402_CONTRACT || '0x0000000000000000000000000000000000000000';

function validateConfig(): ServiceConfig {
  const required = [
    'WALLET_PRIVATE_KEY',
    'BASE_RPC_URL',
    'SERPER_API_KEY',
    'OPENAI_API_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  const privateKey = process.env.WALLET_PRIVATE_KEY!;
  let walletAddress: string;

  try {
    const wallet = new ethers.Wallet(privateKey);
    walletAddress = wallet.address;
  } catch (error) {
    throw new Error('Invalid WALLET_PRIVATE_KEY format');
  }

  return {
    port: parseInt(process.env.RESEARCH_PORT || '4020', 10),
    environment: (process.env.NODE_ENV as 'development' | 'production') || 'development',
    wallet: {
      privateKey,
      address: walletAddress
    },
    networks: {
      base: {
        rpcUrl: process.env.BASE_RPC_URL!,
        chainId: 8453,
        paymentContract: X402_PAYMENT_CONTRACT
      }
    },
    apis: {
      twitter: process.env.TWITTER_BEARER_TOKEN ? {
        bearerToken: process.env.TWITTER_BEARER_TOKEN,
        apiKey: process.env.TWITTER_API_KEY,
        apiSecret: process.env.TWITTER_API_SECRET
      } : undefined,
      github: process.env.GITHUB_TOKEN ? {
        token: process.env.GITHUB_TOKEN
      } : undefined,
      serper: {
        apiKey: process.env.SERPER_API_KEY!
      },
      openai: {
        apiKey: process.env.OPENAI_API_KEY!
      }
    },
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '30', 10)
    }
  };
}

export const config = validateConfig();

// Re-export pricing tiers from types
export { PRICING_TIERS } from './types';

// Pricing constants
export const ETH_DECIMALS = 18;
export const BASE_CHAIN_ID = 8453;
export const X402_VERSION = '1.0.0';

// Service metadata
export const SERVICE_INFO = {
  name: 'x402 Research Service',
  version: '1.0.0',
  description: 'AI-powered intelligence reports for agents',
  paymentAddress: config.wallet.address,
  supportedNetworks: ['base'],
  documentation: 'https://github.com/ultimatecodemaster/x402-research-service'
};
