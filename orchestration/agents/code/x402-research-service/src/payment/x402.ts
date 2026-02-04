/**
 * x402 Payment Verification Module
 * Handles payment header parsing, signature verification, and settlement
 */

import { ethers } from 'ethers';
import {
  X402PaymentHeader,
  X402Payload,
  PaymentVerificationResult,
  X402Settlement
} from '../types';
import { config, BASE_CHAIN_ID } from '../config';
import { logger } from '../utils/logger';

// EIP-712 Domain for x402
const X402_DOMAIN = {
  name: 'x402 Payment Protocol',
  version: '1',
  chainId: BASE_CHAIN_ID,
  verifyingContract: config.networks.base.paymentContract
};

// EIP-712 Types for x402 payment
const X402_TYPES = {
  Payment: [
    { name: 'sender', type: 'address' },
    { name: 'receiver', type: 'address' },
    { name: 'amount', type: 'uint256' },
    { name: 'token', type: 'address' },
    { name: 'chainId', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' },
    { name: 'timestamp', type: 'uint256' },
    { name: 'metadata', type: 'bytes' }
  ]
};

class PaymentVerifier {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private processedNonces: Set<string> = new Set();

  constructor() {
    this.provider = new ethers.JsonRpcProvider(config.networks.base.rpcUrl);
    this.wallet = new ethers.Wallet(config.wallet.privateKey, this.provider);
  }

  /**
   * Parse and validate x402 payment headers
   */
  parsePaymentHeader(headers: Record<string, string>): X402Payload | null {
    try {
      const payloadBase64 = headers['x-x402-payload'];
      if (!payloadBase64) {
        logger.warn('Missing x-x402-payload header');
        return null;
      }

      const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
      const payload: X402Payload = JSON.parse(payloadJson);

      // Validate required fields
      if (!payload.sender || !payload.receiver || !payload.amount || !payload.token) {
        logger.warn('Invalid payload structure');
        return null;
      }

      // Validate chain ID
      if (payload.chainId !== BASE_CHAIN_ID) {
        logger.warn(`Invalid chain ID: ${payload.chainId}, expected: ${BASE_CHAIN_ID}`);
        return null;
      }

      // Validate receiver is our address
      if (payload.receiver.toLowerCase() !== config.wallet.address.toLowerCase()) {
        logger.warn(`Invalid receiver: ${payload.receiver}`);
        return null;
      }

      // Check timestamp (5 minute window)
      const now = Math.floor(Date.now() / 1000);
      if (Math.abs(now - payload.timestamp) > 300) {
        logger.warn('Payment timestamp expired');
        return null;
      }

      return payload;
    } catch (error) {
      logger.error('Failed to parse payment header:', error);
      return null;
    }
  }

  /**
   * Verify payment signature
   */
  async verifySignature(
    payload: X402Payload,
    signature: string | undefined
  ): Promise<boolean> {
    if (!signature) return false;
    try {
      // Reconstruct the message hash using EIP-712
      const message = {
        sender: payload.sender,
        receiver: payload.receiver,
        amount: payload.amount,
        token: payload.token,
        chainId: payload.chainId,
        nonce: payload.nonce,
        timestamp: payload.timestamp,
        metadata: ethers.toUtf8Bytes(JSON.stringify(payload.metadata || {}))
      };

      const recoveredAddress = ethers.verifyTypedData(
        X402_DOMAIN,
        X402_TYPES,
        message,
        signature
      );

      const valid = recoveredAddress.toLowerCase() === payload.sender.toLowerCase();
      
      if (!valid) {
        logger.warn(`Signature verification failed. Recovered: ${recoveredAddress}, Expected: ${payload.sender}`);
      }

      return valid;
    } catch (error) {
      logger.error('Signature verification error:', error);
      return false;
    }
  }

  /**
   * Check for replay attacks (nonce already used)
   */
  isNonceUsed(nonce: string): boolean {
    return this.processedNonces.has(nonce);
  }

  /**
   * Mark nonce as used
   */
  markNonceUsed(nonce: string): void {
    this.processedNonces.add(nonce);
    
    // Keep set size manageable (keep last 10000)
    if (this.processedNonces.size > 10000) {
      const iterator = this.processedNonces.values();
      for (let i = 0; i < 1000; i++) {
        const value = iterator.next().value;
        if (value) this.processedNonces.delete(value);
      }
    }
  }

  /**
   * Verify token is supported (ETH/wETH/USDC on Base)
   */
  isSupportedToken(tokenAddress: string): boolean {
    const supportedTokens = [
      '0x0000000000000000000000000000000000000000', // ETH
      '0x4200000000000000000000000000000000000006', // wETH on Base
      '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
    ].map(t => t.toLowerCase());

    return supportedTokens.includes(tokenAddress.toLowerCase());
  }

  /**
   * Verify payment amount matches expected price
   */
  verifyAmount(amount: string, expectedEth: string): boolean {
    try {
      const paymentWei = BigInt(amount);
      const expectedWei = ethers.parseEther(expectedEth);
      
      // Allow 1% tolerance for fees/rounding
      const tolerance = expectedWei / 100n;
      const diff = paymentWei > expectedWei ? paymentWei - expectedWei : expectedWei - paymentWei;
      
      return diff <= tolerance;
    } catch (error) {
      logger.error('Amount verification error:', error);
      return false;
    }
  }

  /**
   * Full payment verification flow
   */
  async verifyPayment(
    headers: Record<string, string>,
    expectedAmount: string
  ): Promise<PaymentVerificationResult> {
    // Parse payload
    const payload = this.parsePaymentHeader(headers);
    if (!payload) {
      return { valid: false, error: 'Invalid or missing payment headers' };
    }

    // Check nonce
    if (this.isNonceUsed(payload.nonce)) {
      return { valid: false, error: 'Payment nonce already used (replay attack)' };
    }

    // Verify signature
    const signature = headers['x-x402-signature'];
    if (!signature) {
      return { valid: false, error: 'Missing payment signature' };
    }

    const signatureValid = await this.verifySignature(payload, signature as string);
    if (!signatureValid) {
      return { valid: false, error: 'Invalid payment signature' };
    }

    // Verify token
    if (!this.isSupportedToken(payload.token)) {
      return { valid: false, error: 'Unsupported payment token' };
    }

    // Verify amount
    if (!this.verifyAmount(payload.amount, expectedAmount)) {
      return { valid: false, error: `Payment amount mismatch. Expected: ${expectedAmount} ETH` };
    }

    // Mark nonce as used
    this.markNonceUsed(payload.nonce);

    logger.info(`Payment verified: ${payload.sender} -> ${ethers.formatEther(payload.amount)} ETH`);

    return { valid: true, payload };
  }

  /**
   * Settle payment on-chain (for non-ETH tokens or contract-based settlement)
   * For simple ETH transfers, we verify the tx exists on-chain
   */
  async settlePayment(
    payload: X402Payload,
    txHash: string
  ): Promise<X402Settlement> {
    try {
      // Wait for transaction receipt
      const receipt = await this.provider.waitForTransaction(txHash, 1, 60000);
      
      if (!receipt) {
        throw new Error('Transaction not found');
      }

      const settlement: X402Settlement = {
        txHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
        effectiveGasPrice: BigInt(0), // Not available in ethers v6 receipt, using 0
        status: receipt.status === 1 ? 'success' : 'failed'
      };

      logger.info(`Payment settled: ${txHash} (block ${receipt.blockNumber})`);

      return settlement;
    } catch (error) {
      logger.error('Settlement failed:', error);
      throw error;
    }
  }

  /**
   * Get wallet balance
   */
  async getBalance(): Promise<string> {
    const balance = await this.provider.getBalance(config.wallet.address);
    return ethers.formatEther(balance);
  }

  /**
   * Get service wallet address
   */
  getServiceAddress(): string {
    return config.wallet.address;
  }
}

export const paymentVerifier = new PaymentVerifier();
