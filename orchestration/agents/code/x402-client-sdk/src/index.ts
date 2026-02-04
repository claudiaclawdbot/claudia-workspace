/**
 * x402 Client SDK
 * Official client for paying for agent services using x402 protocol
 * 
 * @example
 * ```typescript
 * import { X402Client } from '@x402/client';
 * 
 * const client = new X402Client({
 *   privateKey: process.env.PRIVATE_KEY,
 *   chain: 'base'
 * });
 * 
 * // Pay for research
 * const result = await client.pay({
 *   serviceUrl: 'https://api.x402-research.com/research',
 *   amount: '0.001',
 *   payload: { query: 'AI trends 2024', complexity: 'standard' }
 * });
 * ```
 */

import { ethers } from 'ethers';
import axios, { AxiosResponse } from 'axios';

// Chain configurations
export const SUPPORTED_CHAINS = {
  base: {
    id: 8453,
    name: 'Base',
    rpcUrl: 'https://mainnet.base.org',
    usdcAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
  },
  ethereum: {
    id: 1,
    name: 'Ethereum',
    rpcUrl: 'https://eth.llamarpc.com',
    usdcAddress: '0xA0b86a33E6441b8a46a59DE4c4C5E8F5a6a7A8d0'
  },
  arbitrum: {
    id: 42161,
    name: 'Arbitrum',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    usdcAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831'
  }
} as const;

export type Chain = keyof typeof SUPPORTED_CHAINS;

// EIP-3009 authorization types
const TRANSFER_WITH_AUTHORIZATION_TYPES = {
  TransferWithAuthorization: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' }
  ]
};

// Interfaces
export interface X402ClientConfig {
  privateKey: string;
  chain?: Chain;
  facilitatorUrl?: string;
}

export interface PaymentRequest {
  serviceUrl: string;
  amount: string;
  payload?: Record<string, any>;
  expiresIn?: number; // seconds
}

export interface PaymentResult {
  success: boolean;
  data?: any;
  error?: string;
  payment: {
    proof: string;
    amount: string;
    token: string;
    recipient?: string;
    expiresAt: number;
  };
}

export interface ServiceInfo {
  name: string;
  version: string;
  description: string;
  pricing: Array<{
    complexity: string;
    basePrice: string;
    description: string;
  }>;
  endpoints: Record<string, string>;
}

export interface WalletInfo {
  address: string;
  balance: string;
  chain: Chain;
}

/**
 * X402 Client - Main SDK class for paying for agent services
 */
export class X402Client {
  private wallet: ethers.Wallet;
  private chain: Chain;
  private chainConfig: typeof SUPPORTED_CHAINS[Chain];
  private facilitatorUrl: string;

  constructor(config: X402ClientConfig) {
    if (!config.privateKey) {
      throw new Error('Private key is required');
    }

    this.wallet = new ethers.Wallet(config.privateKey);
    this.chain = config.chain || 'base';
    this.chainConfig = SUPPORTED_CHAINS[this.chain];
    this.facilitatorUrl = config.facilitatorUrl || 'https://x402.org/facilitator';
  }

  /**
   * Get wallet address
   */
  getAddress(): string {
    return this.wallet.address;
  }

  /**
   * Get wallet info including balance
   */
  async getWalletInfo(): Promise<WalletInfo> {
    const provider = new ethers.JsonRpcProvider(this.chainConfig.rpcUrl);
    const connectedWallet = this.wallet.connect(provider);

    // Get ETH balance
    const ethBalance = await provider.getBalance(connectedWallet.address);

    // Get USDC balance
    const usdc = new ethers.Contract(
      this.chainConfig.usdcAddress,
      ['function balanceOf(address) view returns (uint256)'],
      provider
    );

    let usdcBalance = '0';
    try {
      const balance = await usdc.balanceOf(connectedWallet.address);
      usdcBalance = ethers.formatUnits(balance, 6);
    } catch (e) {
      // USDC contract might not exist on this chain
    }

    return {
      address: connectedWallet.address,
      balance: `${ethers.formatEther(ethBalance)} ETH, ${usdcBalance} USDC`,
      chain: this.chain
    };
  }

  /**
   * Get service info and pricing
   */
  async getServiceInfo(serviceUrl: string): Promise<ServiceInfo> {
    const baseUrl = serviceUrl.replace(/\/$/, '');
    const response = await axios.get(`${baseUrl}/`);
    return response.data.data;
  }

  /**
   * Create a payment authorization (EIP-3009)
   */
  async createPayment(
    recipient: string,
    amount: string,
    expiresIn: number = 3600
  ): Promise<{ proof: string; expiresAt: number }> {
    const provider = new ethers.JsonRpcProvider(this.chainConfig.rpcUrl);
    const connectedWallet = this.wallet.connect(provider);

    const amountWei = ethers.parseUnits(amount, 6); // USDC has 6 decimals
    const nonce = ethers.hexlify(ethers.randomBytes(32));
    const validBefore = Math.floor(Date.now() / 1000) + expiresIn;

    const domain = {
      name: 'USDC',
      version: '2',
      chainId: this.chainConfig.id,
      verifyingContract: this.chainConfig.usdcAddress
    };

    const value = {
      from: connectedWallet.address,
      to: recipient,
      value: amountWei,
      validAfter: 0,
      validBefore: validBefore,
      nonce: nonce
    };

    // Sign authorization
    const signature = await connectedWallet.signTypedData(
      domain,
      TRANSFER_WITH_AUTHORIZATION_TYPES,
      value
    );

    const { v, r, s } = ethers.Signature.from(signature);

    // Build payment payload
    const paymentPayload = {
      scheme: 'exact',
      network: this.chain,
      payload: {
        authorization: {
          from: connectedWallet.address,
          to: recipient,
          value: amountWei.toString(),
          validAfter: 0,
          validBefore: validBefore,
          nonce: nonce,
          signature: { v, r, s }
        }
      }
    };

    return {
      proof: Buffer.from(JSON.stringify(paymentPayload)).toString('base64'),
      expiresAt: validBefore
    };
  }

  /**
   * Pay for a service and get the result
   * This is the main method - one line to pay for any x402 service
   */
  async pay(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // Step 1: Get service info to find pricing
      const serviceInfo = await this.getServiceInfo(request.serviceUrl);
      
      // Extract recipient from service info or pricing endpoint
      const pricingResponse = await axios.get(`${request.serviceUrl.replace(/\/$/, '')}/pricing`);
      const recipient = pricingResponse.data.data?.paymentAddress;
      
      if (!recipient) {
        throw new Error('Could not determine payment recipient from service');
      }

      // Step 2: Create payment authorization
      const { proof, expiresAt } = await this.createPayment(
        recipient,
        request.amount,
        request.expiresIn
      );

      // Step 3: Make request with payment proof
      const response = await axios.post(
        request.serviceUrl,
        request.payload || {},
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Payment-Proof': proof,
            'X-Payment-Version': 'x402/1.0'
          },
          timeout: 60000 // 60 second timeout for research services
        }
      );

      return {
        success: true,
        data: response.data,
        payment: {
          proof,
          amount: request.amount,
          token: 'USDC',
          recipient,
          expiresAt
        }
      };

    } catch (error: any) {
      // Handle 402 Payment Required response
      if (error.response?.status === 402) {
        const paymentInfo = error.response.data;
        return {
          success: false,
          error: `Payment required: ${paymentInfo.error?.message || 'Invalid payment'}`,
          payment: {
            proof: '',
            amount: request.amount,
            token: 'USDC',
            expiresAt: 0
          }
        };
      }

      return {
        success: false,
        error: error.message || 'Payment failed',
        payment: {
          proof: '',
          amount: request.amount,
          token: 'USDC',
          expiresAt: 0
        }
      };
    }
  }

  /**
   * Quick pay - Simplest possible API
   * Just provide URL and amount, get result
   */
  async quickPay(serviceUrl: string, amount: string, payload?: Record<string, any>): Promise<any> {
    const result = await this.pay({
      serviceUrl,
      amount,
      payload
    });

    if (!result.success) {
      throw new Error(result.error || 'Payment failed');
    }

    return result.data;
  }
}

/**
 * Service Discovery - Find available x402 services
 */
export class ServiceDiscovery {
  private registryUrl: string;

  constructor(registryUrl: string = 'https://registry.x402.org') {
    this.registryUrl = registryUrl;
  }

  /**
   * List all registered services
   */
  async listServices(): Promise<Array<{
    id: string;
    name: string;
    url: string;
    category: string;
    description: string;
    pricing: { min: string; max: string; currency: string };
  }>> {
    // For now, return hardcoded known services
    // In production, this would fetch from a registry
    return [
      {
        id: 'research-v1',
        name: 'x402 Research Service',
        url: 'https://tours-discretion-walked-hansen.trycloudflare.com',
        category: 'research',
        description: 'AI-powered research on any topic. Twitter, GitHub, web sources.',
        pricing: { min: '0.001', max: '0.01', currency: 'ETH' }
      },
      {
        id: 'crypto-v1',
        name: 'x402 Crypto Price Service',
        url: 'https://x402-crypto-claudia.loca.lt',
        category: 'data',
        description: 'Real-time cryptocurrency prices and market data',
        pricing: { min: '0.0001', max: '0.001', currency: 'ETH' }
      }
    ];
  }

  /**
   * Find services by category
   */
  async findByCategory(category: string): Promise<any[]> {
    const services = await this.listServices();
    return services.filter(s => s.category === category);
  }

  /**
   * Get service details
   */
  async getServiceDetails(serviceId: string): Promise<any> {
    const services = await this.listServices();
    return services.find(s => s.id === serviceId);
  }
}

// Export default
export default X402Client;
