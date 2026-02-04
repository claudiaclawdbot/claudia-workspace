import fetch, { Response } from 'node-fetch';
import { PaymentRequirements, PaymentResponse, PaymentReceipt } from './types.js';
import { sendPayment, getNetwork } from './wallet.js';
import { getConfigPath } from './config.js';
import { appendFileSync } from 'fs';

const USDC_DECIMALS = 6;
const FETCH_TIMEOUT = 15000; // 15 second timeout for payments

async function fetchWithTimeout(url: string, options: Parameters<typeof fetch>[1] = {}): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return response;
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

export async function executePayment(
  endpoint: string,
  method: string = 'GET',
  body?: unknown
): Promise<PaymentResponse> {
  // Step 1: Make initial request to get payment requirements
  const initialResponse = await fetchWithTimeout(endpoint, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  // If not payment required, return the response
  if (initialResponse.status !== 402) {
    const serviceResponse = await initialResponse.json();
    return {
      receipt: {
        txHash: 'N/A',
        network: getNetwork(),
        amount: '0',
        token: 'FREE',
        timestamp: new Date().toISOString(),
      },
      serviceResponse,
    };
  }

  // Step 2: Parse payment requirements
  const requirementsHeader = initialResponse.headers.get('X-Payment-Requirements');
  if (!requirementsHeader) {
    throw new Error('402 response missing X-Payment-Requirements header');
  }

  const requirements: PaymentRequirements = JSON.parse(requirementsHeader);

  // Step 3: Execute payment
  console.log(`💳 Paying ${formatAmount(requirements.requiredAmount, requirements.requiredToken)}...`);
  
  const { txHash } = await sendPayment(
    requirements.payToAddress,
    requirements.requiredAmount,
    requirements.requiredToken
  );

  // Step 4: Retry request with payment proof
  const paymentResponse: PaymentReceipt = {
    txHash,
    network: requirements.network,
    amount: requirements.requiredAmount,
    token: requirements.requiredToken,
    timestamp: new Date().toISOString(),
  };

  const retryResponse = await fetchWithTimeout(endpoint, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Payment-Response': JSON.stringify(paymentResponse),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!retryResponse.ok) {
    throw new Error(`Service request failed after payment: ${retryResponse.status} ${retryResponse.statusText}`);
  }

  const serviceResponse = await retryResponse.json();

  // Step 5: Log usage
  logUsage({
    endpoint,
    method,
    amount: requirements.requiredAmount,
    token: requirements.requiredToken,
    txHash,
    status: 'success',
  });

  return {
    receipt: paymentResponse,
    serviceResponse,
  };
}

export async function payForResearch(topic: string): Promise<PaymentResponse> {
  const endpoint = 'https://tours-discretion-walked-hansen.trycloudflare.com/research';
  return executePayment(endpoint, 'POST', { topic });
}

export async function payForCryptoPrice(coin: string): Promise<PaymentResponse> {
  const endpoint = `https://x402-crypto-claudia.loca.lt/price/${coin}`;
  return executePayment(endpoint, 'GET');
}

export async function payForCryptoPrices(coins: string[]): Promise<PaymentResponse> {
  const endpoint = 'https://x402-crypto-claudia.loca.lt/prices';
  return executePayment(endpoint, 'POST', { coins });
}

export async function payForAllCryptoPrices(): Promise<PaymentResponse> {
  const endpoint = 'https://x402-crypto-claudia.loca.lt/prices/all';
  return executePayment(endpoint, 'GET');
}

function formatAmount(amount: string, token: string): string {
  const decimals = token.toLowerCase().includes('usdc') ? USDC_DECIMALS : 18;
  const value = Number(amount) / Math.pow(10, decimals);
  const symbol = token.toLowerCase().includes('usdc') ? 'USDC' : 'ETH';
  return `${value.toFixed(value < 0.01 ? 6 : 4)} ${symbol}`;
}

interface UsageLog {
  endpoint: string;
  method: string;
  amount: string;
  token: string;
  txHash: string;
  status: 'success' | 'failed';
  timestamp: string;
}

function logUsage(usage: Omit<UsageLog, 'timestamp'>): void {
  const entry: UsageLog = {
    ...usage,
    timestamp: new Date().toISOString(),
  };

  try {
    const logPath = getConfigPath().replace('config.json', 'usage.jsonl');
    appendFileSync(logPath, JSON.stringify(entry) + '\n');
  } catch {
    // Silent fail for logging
  }
}

export async function getUsageHistory(): Promise<UsageLog[]> {
  try {
    const logPath = getConfigPath().replace('config.json', 'usage.jsonl');
    const { readFileSync } = await import('fs');
    const data = readFileSync(logPath, 'utf-8');
    
    return data
      .trim()
      .split('\n')
      .filter(Boolean)
      .map(line => JSON.parse(line));
  } catch {
    return [];
  }
}

export function formatTxHash(txHash: string): string {
  if (txHash === 'N/A') return 'N/A';
  return `${txHash.slice(0, 10)}...${txHash.slice(-8)}`;
}
