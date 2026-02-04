import express from 'express';
import cors from 'cors';
import { createPublicClient, http, parseAbi } from 'viem';
import { base } from 'viem/chains';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuration
const PORT = process.env.PORT || 3002;
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // Base USDC
const RECEIVER_ADDRESS = process.env.RECEIVER_ADDRESS || '0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055';

// Price cache to reduce API calls
let priceCache = new Map();
let cacheTimestamps = new Map();
const CACHE_TTL = 30000; // 30 seconds

// ERC-20 ABI for USDC
const erc20Abi = parseAbi([
  'function transferFrom(address from, address to, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)'
]);

// Supported cryptocurrencies
const SUPPORTED_COINS = {
  'bitcoin': { symbol: 'BTC', name: 'Bitcoin', id: 'bitcoin' },
  'ethereum': { symbol: 'ETH', name: 'Ethereum', id: 'ethereum' },
  'base': { symbol: 'BASE', name: 'Base', id: 'base-governance-token' },
  'solana': { symbol: 'SOL', name: 'Solana', id: 'solana' },
  'cardano': { symbol: 'ADA', name: 'Cardano', id: 'cardano' },
  'polkadot': { symbol: 'DOT', name: 'Polkadot', id: 'polkadot' },
  'chainlink': { symbol: 'LINK', name: 'Chainlink', id: 'chainlink' },
  'uniswap': { symbol: 'UNI', name: 'Uniswap', id: 'uniswap' },
  'aave': { symbol: 'AAVE', name: 'Aave', id: 'aave' },
  'compound': { symbol: 'COMP', name: 'Compound', id: 'compound-governance-token' }
};

// Get prices from CoinGecko (free tier)
async function fetchPrices(coinIds) {
  const ids = coinIds.join(',');
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`CoinGecko API error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch prices:', error);
    throw error;
  }
}

// Check cache or fetch fresh data
async function getPrices(coinIds) {
  const now = Date.now();
  const cacheKey = coinIds.sort().join(',');
  
  if (priceCache.has(cacheKey) && (now - cacheTimestamps.get(cacheKey)) < CACHE_TTL) {
    console.log('Returning cached prices');
    return priceCache.get(cacheKey);
  }
  
  const prices = await fetchPrices(coinIds);
  priceCache.set(cacheKey, prices);
  cacheTimestamps.set(cacheKey, now);
  
  return prices;
}

// Generate x402 payment requirements
function generatePaymentRequirements(resource) {
  const pricePerRequest = resource === 'batch' ? '50000' : '10000'; // $0.05 for batch, $0.01 for single
  
  return {
    scheme: "exact",
    network: "base",
    maxAmountRequired: pricePerRequest,
    resource: resource,
    description: resource === 'batch' ? "Batch crypto price data" : "Single crypto price",
    mimeType: "application/json",
    payTo: RECEIVER_ADDRESS,
    maxTimeoutSeconds: 300,
    asset: {
      "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913": {
        "asset": USDC_ADDRESS,
        "amount": pricePerRequest,
        "decimals": 6,
        "eip712": true
      }
    }
  };
}

// Verify x402 payment
async function verifyPayment(paymentPayload) {
  try {
    // In production, this would verify the signature on-chain
    // For now, we do basic validation
    if (!paymentPayload.signature) {
      return { valid: false, error: 'Missing signature' };
    }
    
    // Parse the payment
    const payment = JSON.parse(Buffer.from(paymentPayload.signature, 'base64').toString());
    
    // Basic validation
    if (!payment.from || !payment.to || !payment.amount) {
      return { valid: false, error: 'Invalid payment structure' };
    }
    
    return { valid: true, payment };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

// Health check endpoint
app.get('/status', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'x402-crypto-service',
    version: '1.0.0',
    uptime: process.uptime(),
    supportedCoins: Object.keys(SUPPORTED_COINS).length,
    timestamp: new Date().toISOString()
  });
});

// List supported cryptocurrencies
app.get('/coins', (req, res) => {
  res.json({
    coins: Object.entries(SUPPORTED_COINS).map(([key, data]) => ({
      id: key,
      ...data
    }))
  });
});

// Get single crypto price (requires payment)
app.get('/price/:coin', async (req, res) => {
  const coin = req.params.coin.toLowerCase();
  
  if (!SUPPORTED_COINS[coin]) {
    return res.status(400).json({
      error: 'Unsupported cryptocurrency',
      supported: Object.keys(SUPPORTED_COINS)
    });
  }
  
  // Check for payment header
  const paymentHeader = req.headers['x-x402-payment'];
  
  if (!paymentHeader) {
    // Return payment requirements
    return res.status(402).json({
      error: 'Payment required',
      paymentRequirements: generatePaymentRequirements(coin)
    });
  }
  
  // Verify payment
  const paymentPayload = JSON.parse(Buffer.from(paymentHeader, 'base64').toString());
  const verification = await verifyPayment(paymentPayload);
  
  if (!verification.valid) {
    return res.status(402).json({
      error: 'Invalid payment',
      details: verification.error,
      paymentRequirements: generatePaymentRequirements(coin)
    });
  }
  
  // Payment valid - return price data
  try {
    const prices = await getPrices([SUPPORTED_COINS[coin].id]);
    const priceData = prices[SUPPORTED_COINS[coin].id];
    
    res.json({
      coin: coin,
      symbol: SUPPORTED_COINS[coin].symbol,
      name: SUPPORTED_COINS[coin].name,
      price_usd: priceData.usd,
      change_24h_percent: priceData.usd_24h_change,
      market_cap_usd: priceData.usd_market_cap,
      volume_24h_usd: priceData.usd_24h_vol,
      timestamp: new Date().toISOString(),
      payment: {
        amount: '10000', // $0.01
        currency: 'USDC'
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch price data',
      message: error.message
    });
  }
});

// Get multiple crypto prices (batch - requires higher payment)
app.post('/prices', async (req, res) => {
  const { coins } = req.body;
  
  if (!coins || !Array.isArray(coins) || coins.length === 0) {
    return res.status(400).json({
      error: 'Please provide an array of coin IDs in the request body',
      example: { coins: ['bitcoin', 'ethereum', 'solana'] }
    });
  }
  
  // Validate coins
  const invalidCoins = coins.filter(c => !SUPPORTED_COINS[c.toLowerCase()]);
  if (invalidCoins.length > 0) {
    return res.status(400).json({
      error: 'Some coins are not supported',
      invalid: invalidCoins,
      supported: Object.keys(SUPPORTED_COINS)
    });
  }
  
  // Check for payment header
  const paymentHeader = req.headers['x-x402-payment'];
  
  if (!paymentHeader) {
    return res.status(402).json({
      error: 'Payment required',
      paymentRequirements: generatePaymentRequirements('batch')
    });
  }
  
  // Verify payment
  const paymentPayload = JSON.parse(Buffer.from(paymentHeader, 'base64').toString());
  const verification = await verifyPayment(paymentPayload);
  
  if (!verification.valid) {
    return res.status(402).json({
      error: 'Invalid payment',
      details: verification.error,
      paymentRequirements: generatePaymentRequirements('batch')
    });
  }
  
  // Payment valid - return batch price data
  try {
    const coinIds = coins.map(c => SUPPORTED_COINS[c.toLowerCase()].id);
    const prices = await getPrices(coinIds);
    
    const results = coins.map(coin => {
      const coinData = SUPPORTED_COINS[coin.toLowerCase()];
      const priceData = prices[coinData.id];
      return {
        coin: coin.toLowerCase(),
        symbol: coinData.symbol,
        name: coinData.name,
        price_usd: priceData.usd,
        change_24h_percent: priceData.usd_24h_change,
        market_cap_usd: priceData.usd_market_cap,
        volume_24h_usd: priceData.usd_24h_vol
      };
    });
    
    res.json({
      prices: results,
      count: results.length,
      timestamp: new Date().toISOString(),
      payment: {
        amount: '50000', // $0.05
        currency: 'USDC'
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch price data',
      message: error.message
    });
  }
});

// Get all supported coins at once (requires batch payment)
app.get('/prices/all', async (req, res) => {
  const paymentHeader = req.headers['x-x402-payment'];
  
  if (!paymentHeader) {
    return res.status(402).json({
      error: 'Payment required',
      paymentRequirements: generatePaymentRequirements('batch')
    });
  }
  
  // Verify payment
  const paymentPayload = JSON.parse(Buffer.from(paymentHeader, 'base64').toString());
  const verification = await verifyPayment(paymentPayload);
  
  if (!verification.valid) {
    return res.status(402).json({
      error: 'Invalid payment',
      details: verification.error,
      paymentRequirements: generatePaymentRequirements('batch')
    });
  }
  
  try {
    const coinIds = Object.values(SUPPORTED_COINS).map(c => c.id);
    const prices = await getPrices(coinIds);
    
    const results = Object.entries(SUPPORTED_COINS).map(([key, data]) => {
      const priceData = prices[data.id];
      return {
        coin: key,
        symbol: data.symbol,
        name: data.name,
        price_usd: priceData?.usd || null,
        change_24h_percent: priceData?.usd_24h_change || null,
        market_cap_usd: priceData?.usd_market_cap || null,
        volume_24h_usd: priceData?.usd_24h_vol || null
      };
    });
    
    res.json({
      prices: results,
      count: results.length,
      timestamp: new Date().toISOString(),
      payment: {
        amount: '50000',
        currency: 'USDC'
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch price data',
      message: error.message
    });
  }
});

// Payment verification endpoint (for testing)
app.post('/verify-payment', async (req, res) => {
  const { signature } = req.body;
  
  if (!signature) {
    return res.status(400).json({ error: 'Missing signature' });
  }
  
  const verification = await verifyPayment({ signature });
  res.json(verification);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 x402 Crypto Service running on port ${PORT}`);
  console.log(`📊 Supported coins: ${Object.keys(SUPPORTED_COINS).length}`);
  console.log(`💰 Payment receiver: ${RECEIVER_ADDRESS}`);
  console.log(`\nEndpoints:`);
  console.log(`  GET  /status        - Health check`);
  console.log(`  GET  /coins         - List supported coins`);
  console.log(`  GET  /price/:coin   - Single coin price ($0.01)`);
  console.log(`  POST /prices        - Batch prices ($0.05)`);
  console.log(`  GET  /prices/all    - All coins ($0.05)`);
});
