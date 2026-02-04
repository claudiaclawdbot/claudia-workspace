/**
 * Agent Intelligence Suite - Bundled Service
 * 
 * Combines Research + Crypto capabilities into tiered offerings
 * for maximum value delivery to agent clients.
 * 
 * Tiers:
 * - Basic: $0.05 USDC (Research + single coin price)
 * - Pro: $0.15 USDC (Deep research + batch prices + analysis)
 * - Enterprise: Custom pricing
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3004;
const RECEIVER_ADDRESS = process.env.RECEIVER_ADDRESS || '0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055';
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

// Service endpoints
const RESEARCH_ENDPOINT = process.env.RESEARCH_ENDPOINT || 'https://tours-discretion-walked-hansen.trycloudflare.com';
const CRYPTO_ENDPOINT = process.env.CRYPTO_ENDPOINT || 'https://x402-crypto-claudia.loca.lt';

// ============================================================================
// Pricing Configuration
// ============================================================================

const BUNDLE_PRICING = {
  basic: {
    name: 'Basic',
    price: '0.05',
    priceWei: '50000', // 0.05 USDC = 50000 (6 decimals)
    currency: 'USDC',
    description: 'Research + single coin price',
    features: [
      'Simple research query (5-10 results)',
      'Single cryptocurrency price',
      'Basic market context',
      'JSON response format'
    ],
    researchTier: 'simple',
    cryptoEndpoint: '/price/:coin'
  },
  pro: {
    name: 'Pro',
    price: '0.15',
    priceWei: '150000', // 0.15 USDC = 150000 (6 decimals)
    currency: 'USDC',
    description: 'Deep research + batch prices + analysis',
    features: [
      'Deep research (50+ results)',
      'Batch price data (up to 10 coins)',
      'Sentiment analysis',
      'Market correlation insights',
      'Comprehensive report',
      'Priority processing'
    ],
    researchTier: 'deep',
    cryptoEndpoint: '/prices'
  },
  enterprise: {
    name: 'Enterprise',
    price: 'custom',
    currency: 'USDC',
    description: 'Custom integration and support',
    features: [
      'Unlimited research depth',
      'Custom data sources',
      'API integration support',
      'Dedicated endpoint',
      'Priority support',
      'SLA guarantees',
      'Volume discounts'
    ],
    contact: 'https://clawk.ai/contact'
  }
};

// ============================================================================
// Helper Functions
// ============================================================================

function generatePaymentRequirements(tier) {
  const tierConfig = BUNDLE_PRICING[tier];
  
  if (tier === 'enterprise') {
    return {
      error: 'Enterprise tier requires custom negotiation',
      contact: tierConfig.contact,
      description: 'Please contact us for enterprise pricing'
    };
  }

  return {
    scheme: "exact",
    network: "base",
    maxAmountRequired: tierConfig.priceWei,
    resource: `intelligence-suite-${tier}`,
    description: `Agent Intelligence Suite - ${tierConfig.name} (${tierConfig.price} USDC)`,
    mimeType: "application/json",
    payTo: RECEIVER_ADDRESS,
    maxTimeoutSeconds: 300,
    asset: {
      [USDC_ADDRESS]: {
        "asset": USDC_ADDRESS,
        "amount": tierConfig.priceWei,
        "decimals": 6,
        "eip712": true
      }
    }
  };
}

async function callResearchService(query, tier) {
  try {
    const response = await fetch(`${RESEARCH_ENDPOINT}/research`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        depth: tier === 'pro' ? 'deep' : 'simple',
        sources: ['twitter', 'github', 'web']
      })
    });
    
    if (!response.ok) throw new Error(`Research service error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Research service error:', error);
    return { error: 'Research service unavailable', details: error.message };
  }
}

async function callCryptoService(coins) {
  try {
    const endpoint = Array.isArray(coins) && coins.length > 1 
      ? `${CRYPTO_ENDPOINT}/prices`
      : `${CRYPTO_ENDPOINT}/price/${coins}`;
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) throw new Error(`Crypto service error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Crypto service error:', error);
    return { error: 'Crypto service unavailable', details: error.message };
  }
}

function generateIntelligenceReport(researchData, cryptoData, tier) {
  const timestamp = new Date().toISOString();
  
  return {
    report: {
      title: `Intelligence Report - ${tier.toUpperCase()} Tier`,
      generatedAt: timestamp,
      tier,
      summary: {
        researchFindings: researchData.results?.length || 0,
        priceDataPoints: cryptoData.prices ? Object.keys(cryptoData.prices).length : 1,
        marketSentiment: analyzeSentiment(researchData)
      },
      research: researchData,
      marketData: cryptoData,
      insights: tier === 'pro' ? generateInsights(researchData, cryptoData) : undefined
    },
    meta: {
      service: 'Agent Intelligence Suite',
      version: '1.0.0',
      tier,
      dataFreshness: 'real-time'
    }
  };
}

function analyzeSentiment(researchData) {
  // Simple sentiment analysis based on content
  const text = JSON.stringify(researchData).toLowerCase();
  const positiveWords = ['bullish', 'growth', 'adoption', 'breakthrough', 'success'];
  const negativeWords = ['bearish', 'decline', 'crash', 'fraud', 'hack'];
  
  let score = 50; // Neutral baseline
  positiveWords.forEach(word => {
    if (text.includes(word)) score += 5;
  });
  negativeWords.forEach(word => {
    if (text.includes(word)) score -= 5;
  });
  
  return {
    score: Math.max(0, Math.min(100, score)),
    label: score > 60 ? 'positive' : score < 40 ? 'negative' : 'neutral'
  };
}

function generateInsights(researchData, cryptoData) {
  const insights = [];
  
  // Price movement correlation
  if (cryptoData.prices) {
    const prices = Object.entries(cryptoData.prices);
    const biggestMover = prices.reduce((max, curr) => {
      const change = Math.abs(parseFloat(curr[1].change24h) || 0);
      return change > max.change ? { coin: curr[0], change } : max;
    }, { coin: '', change: 0 });
    
    if (biggestMover.coin) {
      insights.push({
        type: 'market_movement',
        description: `${biggestMover.coin} showing significant activity`,
        significance: biggestMover.change > 10 ? 'high' : 'medium'
      });
    }
  }
  
  // Research correlation
  if (researchData.results?.length > 0) {
    insights.push({
      type: 'intelligence',
      description: `Found ${researchData.results.length} relevant sources`,
      significance: researchData.results.length > 20 ? 'high' : 'medium'
    });
  }
  
  return insights;
}

// ============================================================================
// Public Endpoints
// ============================================================================

/**
 * Health check
 */
app.get('/status', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'agent-intelligence-suite',
    version: '1.0.0',
    tiers: Object.keys(BUNDLE_PRICING),
    endpoints: {
      research: RESEARCH_ENDPOINT,
      crypto: CRYPTO_ENDPOINT
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * Get pricing information
 */
app.get('/pricing', (req, res) => {
  res.json({
    service: 'Agent Intelligence Suite',
    description: 'Combined research and crypto intelligence for agents',
    tiers: BUNDLE_PRICING,
    paymentAddress: RECEIVER_ADDRESS,
    acceptedTokens: ['USDC'],
    network: 'base',
    timestamp: new Date().toISOString()
  });
});

/**
 * Get tier details
 */
app.get('/tiers/:tier', (req, res) => {
  const { tier } = req.params;
  
  if (!BUNDLE_PRICING[tier]) {
    return res.status(404).json({
      error: 'Tier not found',
      availableTiers: Object.keys(BUNDLE_PRICING)
    });
  }
  
  res.json({
    tier: BUNDLE_PRICING[tier],
    paymentRequirements: generatePaymentRequirements(tier)
  });
});

// ============================================================================
// Paid Endpoints (x402)
// ============================================================================

/**
 * Basic tier - Simple research + single coin price
 */
app.post('/intelligence/basic', async (req, res) => {
  const paymentHeader = req.headers['x-x402-payment'];
  
  if (!paymentHeader) {
    return res.status(402).json({
      error: 'Payment required',
      paymentRequirements: generatePaymentRequirements('basic')
    });
  }

  // Payment verification would happen here
  // For now, we'll accept the payment header as valid
  
  const { query, coin = 'bitcoin' } = req.body;
  
  if (!query) {
    return res.status(400).json({
      error: 'Query is required',
      example: { query: 'latest DeFi developments', coin: 'ethereum' }
    });
  }

  // Call services in parallel
  const [research, crypto] = await Promise.all([
    callResearchService(query, 'basic'),
    callCryptoService(coin)
  ]);

  const report = generateIntelligenceReport(research, crypto, 'basic');
  
  res.json({
    success: true,
    tier: 'basic',
    ...report,
    payment: {
      tier: 'basic',
      amount: BUNDLE_PRICING.basic.price,
      currency: 'USDC'
    }
  });
});

/**
 * Pro tier - Deep research + batch prices + analysis
 */
app.post('/intelligence/pro', async (req, res) => {
  const paymentHeader = req.headers['x-x402-payment'];
  
  if (!paymentHeader) {
    return res.status(402).json({
      error: 'Payment required',
      paymentRequirements: generatePaymentRequirements('pro')
    });
  }

  const { query, coins = ['bitcoin', 'ethereum', 'solana'] } = req.body;
  
  if (!query) {
    return res.status(400).json({
      error: 'Query is required',
      example: { query: 'AI agent market analysis', coins: ['bitcoin', 'ethereum'] }
    });
  }

  // Call services in parallel
  const [research, crypto] = await Promise.all([
    callResearchService(query, 'pro'),
    callCryptoService(coins)
  ]);

  const report = generateIntelligenceReport(research, crypto, 'pro');
  
  res.json({
    success: true,
    tier: 'pro',
    ...report,
    payment: {
      tier: 'pro',
      amount: BUNDLE_PRICING.pro.price,
      currency: 'USDC'
    }
  });
});

/**
 * Enterprise inquiry
 */
app.post('/intelligence/enterprise', (req, res) => {
  res.json({
    message: 'Enterprise tier requires custom setup',
    description: BUNDLE_PRICING.enterprise.description,
    features: BUNDLE_PRICING.enterprise.features,
    contact: BUNDLE_PRICING.enterprise.contact,
    nextSteps: [
      'Contact us with your requirements',
      'We will provide custom pricing',
      'Dedicated endpoint setup',
      'SLA agreement'
    ]
  });
});

/**
 * Compare all tiers
 */
app.get('/compare', (req, res) => {
  const comparison = {
    tiers: Object.entries(BUNDLE_PRICING).map(([key, tier]) => ({
      name: tier.name,
      price: tier.price === 'custom' ? 'Contact us' : `$${tier.price} USDC`,
      description: tier.description,
      featureCount: tier.features.length,
      features: tier.features
    })),
    recommendation: {
      for: 'Autonomous trading agents',
      suggestedTier: 'pro',
      reason: 'Deep research + batch prices enables better trading decisions'
    }
  };
  
  res.json(comparison);
});

// ============================================================================
// Start Server
// ============================================================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║     🧠 Agent Intelligence Suite v1.0.0                     ║
╠════════════════════════════════════════════════════════════╣
║  Port: ${PORT}${' '.repeat(52 - PORT.toString().length)}║
║  Network: Base                                             ║
║  Receiver: ${RECEIVER_ADDRESS.slice(0, 25)}...              ║
╠════════════════════════════════════════════════════════════╣
║  Tiers:                                                    ║
║    • Basic:     $0.05 USDC (Research + 1 coin)             ║
║    • Pro:       $0.15 USDC (Deep research + batch)         ║
║    • Enterprise: Custom (Contact us)                       ║
╠════════════════════════════════════════════════════════════╣
║  Endpoints:                                                ║
║    GET  /status              - Health check                ║
║    GET  /pricing             - Tier pricing                ║
║    GET  /compare             - Compare tiers               ║
║    POST /intelligence/basic  - Basic bundle (paid)         ║
║    POST /intelligence/pro    - Pro bundle (paid)           ║
╚════════════════════════════════════════════════════════════╝
  `);
});

export { app, BUNDLE_PRICING };
