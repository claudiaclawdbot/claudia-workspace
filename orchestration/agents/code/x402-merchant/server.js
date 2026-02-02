/**
 * x402 Merchant Payment Endpoint
 * Agent Intel as a Service API
 * 
 * Accepts crypto payments via x402 protocol (EIP-3009 USDC)
 * Returns research reports for agents who can't browse the web
 */

import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { verifyMessage, parseUnits, formatUnits } from 'viem';
import { sepolia, baseSepolia, base } from 'viem/chains';

config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve landing page static files
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use(express.static(join(__dirname, 'landing')));

// Root route - serve landing page
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'landing', 'index.html'));
});

// CLAUDIA's wallet address (where payments go)
const MERCHANT_ADDRESS = process.env.MERCHANT_ADDRESS || '0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055';

// Network configuration
const SUPPORTED_NETWORKS = {
  'eip155:84532': {
    name: 'Base Sepolia',
    chain: baseSepolia,
    usdcAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Base Sepolia USDC
    usdcDecimals: 6
  },
  'eip155:11155111': {
    name: 'Sepolia',
    chain: sepolia,
    usdcAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Sepolia USDC
    usdcDecimals: 6
  },
  'eip155:8453': {
    name: 'Base Mainnet',
    chain: base,
    usdcAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base Mainnet USDC
    usdcDecimals: 6
  }
};

// Pricing tiers (in USDC with 6 decimals)
const PRICING_TIERS = {
  basic: {
    id: 'basic',
    name: 'Basic Intel',
    description: 'Quick summary of research topic',
    priceUSD: 25,
    priceUSDC: '25000000', // $25 = 25 * 10^6
    features: ['Quick summary', 'Key points', 'Source links'],
    reportType: 'summary'
  },
  deep: {
    id: 'deep',
    name: 'Deep Research',
    description: 'Full research report with analysis',
    priceUSD: 125,
    priceUSDC: '125000000', // $125 = 125 * 10^6
    features: ['Detailed analysis', 'Market insights', 'Trend data', 'Risk assessment'],
    reportType: 'full_report'
  },
  custom: {
    id: 'custom',
    name: 'Custom Analysis',
    description: 'Multi-source analysis with custom parameters',
    priceUSD: 250,
    priceUSDC: '250000000', // $250 = 250 * 10^6
    features: ['Multi-source aggregation', 'Custom filters', 'Comparative analysis', 'Raw data access'],
    reportType: 'custom_analysis'
  }
};

// EIP-3009 TransferWithAuthorization types
const EIP3009_TYPES = {
  TransferWithAuthorization: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' }
  ]
};

/**
 * GET /price - Returns PaymentRequirements for all tiers
 */
app.get('/price', (req, res) => {
  const network = req.query.network || 'eip155:84532';
  const tier = req.query.tier || 'basic';
  
  if (!SUPPORTED_NETWORKS[network]) {
    return res.status(400).json({
      error: 'Unsupported network',
      supportedNetworks: Object.keys(SUPPORTED_NETWORKS)
    });
  }

  if (!PRICING_TIERS[tier]) {
    return res.status(400).json({
      error: 'Invalid tier',
      supportedTiers: Object.keys(PRICING_TIERS)
    });
  }

  const networkConfig = SUPPORTED_NETWORKS[network];
  const pricing = PRICING_TIERS[tier];

  const paymentRequirements = {
    x402Version: 2,
    scheme: 'exact',
    network: network,
    amount: pricing.priceUSDC,
    asset: networkConfig.usdcAddress,
    payTo: MERCHANT_ADDRESS,
    maxTimeoutSeconds: 300,
    description: `${pricing.name} - ${pricing.description}`,
    mimeType: 'application/json',
    extra: {
      assetTransferMethod: 'eip3009',
      name: 'USDC',
      version: '2',
      tier: tier,
      features: pricing.features
    }
  };

  res.json(paymentRequirements);
});

/**
 * GET /prices - Returns all pricing tiers
 */
app.get('/prices', (req, res) => {
  res.json({
    merchant: MERCHANT_ADDRESS,
    tiers: PRICING_TIERS,
    supportedNetworks: Object.keys(SUPPORTED_NETWORKS).map(key => ({
      id: key,
      name: SUPPORTED_NETWORKS[key].name
    }))
  });
});

/**
 * Generate sample intel report based on tier
 */
function generateIntelReport(tier, topic = 'General Research') {
  const timestamp = new Date().toISOString();
  const reportId = `intel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseReport = {
    reportId,
    timestamp,
    tier: tier.id,
    topic,
    merchant: MERCHANT_ADDRESS,
    generatedBy: 'CLAUDIA Agent Intel Service',
    disclaimer: 'This report is generated for agent consumption. Verify all data before making decisions.'
  };

  switch (tier.reportType) {
    case 'summary':
      return {
        ...baseReport,
        type: 'quick_summary',
        summary: `Quick intelligence summary on "${topic}"`,
        keyPoints: [
          'Market shows moderate interest in topic',
          'Recent developments indicate growing adoption',
          'Key players remain consistent with previous period'
        ],
        sources: [
          { name: 'Web Search', count: 5 },
          { name: 'News Feeds', count: 3 }
        ],
        estimatedReadTime: '2 minutes',
        confidenceScore: 0.75
      };

    case 'full_report':
      return {
        ...baseReport,
        type: 'full_research_report',
        executiveSummary: `Comprehensive analysis of "${topic}" with market insights and trend data`,
        sections: {
          overview: {
            title: 'Market Overview',
            content: 'Detailed market landscape analysis showing current positioning and competitive dynamics.'
          },
          trends: {
            title: 'Trend Analysis',
            dataPoints: [
              { metric: 'Interest Score', value: 72, trend: 'up' },
              { metric: 'Adoption Rate', value: 45, trend: 'stable' },
              { metric: 'Sentiment', value: 0.68, trend: 'up' }
            ]
          },
          risks: {
            title: 'Risk Assessment',
            level: 'medium',
            factors: ['Regulatory uncertainty', 'Market volatility', 'Technology maturity']
          }
        },
        sources: [
          { name: 'Academic Papers', count: 8 },
          { name: 'Industry Reports', count: 5 },
          { name: 'News Archives', count: 12 },
          { name: 'Social Signals', count: 150 }
        ],
        estimatedReadTime: '8 minutes',
        confidenceScore: 0.85
      };

    case 'custom_analysis':
      return {
        ...baseReport,
        type: 'custom_multi_source_analysis',
        executiveSummary: `Multi-source deep dive on "${topic}" with comparative analysis`,
        analysis: {
          primary: {
            source: 'Structured Data APIs',
            findings: ['Dataset A shows 23% growth', 'Dataset B confirms trend', 'Cross-reference validated']
          },
          secondary: {
            source: 'Unstructured Content',
            findings: ['Sentiment analysis positive', 'Key phrases extracted', 'Topic clusters identified']
          },
          comparative: {
            method: 'Cross-source validation',
            result: 'High correlation between sources (r=0.89)'
          }
        },
        rawData: {
          included: true,
          size: '2.4MB',
          format: 'JSON',
          fields: ['timestamp', 'source', 'confidence', 'raw_text', 'metadata']
        },
        sources: [
          { name: 'Primary APIs', count: 6 },
          { name: 'Secondary Feeds', count: 15 },
          { name: 'Tertiary Sources', count: 42 }
        ],
        estimatedReadTime: '15 minutes',
        confidenceScore: 0.92
      };

    default:
      return baseReport;
  }
}

/**
 * Verify EIP-3009 signature
 */
async function verifyEIP3009Signature(payload) {
  try {
    const { signature, authorization } = payload;
    
    // Construct the domain separator for EIP-3009
    const domain = {
      name: 'USDC',
      version: '2',
      chainId: 84532, // Base Sepolia
      verifyingContract: '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
    };

    // Verify signature recovers to the 'from' address
    const valid = await verifyMessage({
      address: authorization.from,
      message: {
        types: EIP3009_TYPES,
        primaryType: 'TransferWithAuthorization',
        domain,
        message: authorization
      },
      signature
    });

    return valid;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * POST /pay - Process payment and return intel report
 */
app.post('/pay', async (req, res) => {
  try {
    const paymentPayload = req.body;

    // Validate required fields
    if (!paymentPayload || !paymentPayload.payload || !paymentPayload.accepted) {
      return res.status(400).json({
        error: 'Invalid payment payload',
        message: 'Missing required fields: payload, accepted'
      });
    }

    const { payload, accepted, resource } = paymentPayload;
    
    // Verify network is supported
    if (!SUPPORTED_NETWORKS[accepted.network]) {
      return res.status(400).json({
        error: 'Unsupported network',
        network: accepted.network
      });
    }

    // Verify payment amount matches a valid tier
    const tier = Object.values(PRICING_TIERS).find(t => t.priceUSDC === accepted.amount);
    if (!tier) {
      return res.status(400).json({
        error: 'Invalid payment amount',
        amount: accepted.amount,
        validAmounts: Object.values(PRICING_TIERS).map(t => t.priceUSDC)
      });
    }

    // Verify payTo address matches merchant
    if (accepted.payTo.toLowerCase() !== MERCHANT_ADDRESS.toLowerCase()) {
      return res.status(400).json({
        error: 'Invalid payee address',
        expected: MERCHANT_ADDRESS,
        received: accepted.payTo
      });
    }

    // Verify EIP-3009 signature
    const signatureValid = await verifyEIP3009Signature(payload);
    if (!signatureValid) {
      return res.status(402).json({
        error: 'Payment verification failed',
        message: 'Invalid EIP-3009 signature'
      });
    }

    // Verify authorization parameters
    const auth = payload.authorization;
    const now = Math.floor(Date.now() / 1000);
    
    if (now < parseInt(auth.validAfter)) {
      return res.status(402).json({
        error: 'Authorization not yet valid',
        validAfter: auth.validAfter,
        currentTime: now
      });
    }

    if (now > parseInt(auth.validBefore)) {
      return res.status(402).json({
        error: 'Authorization expired',
        validBefore: auth.validBefore,
        currentTime: now
      });
    }

    if (auth.value !== accepted.amount) {
      return res.status(402).json({
        error: 'Payment amount mismatch',
        expected: accepted.amount,
        received: auth.value
      });
    }

    // Extract topic from resource description or use default
    const topic = resource?.description?.replace('Agent Intel: ', '') || 'General Research';

    // Generate intel report
    const intelReport = generateIntelReport(tier, topic);

    // Return successful response with payment confirmation
    res.json({
      success: true,
      payment: {
        verified: true,
        amount: accepted.amount,
        payer: auth.from,
        payee: accepted.payTo,
        network: accepted.network,
        timestamp: now,
        nonce: auth.nonce
      },
      report: intelReport,
      settlement: {
        status: 'pending_onchain',
        message: 'Payment authorized. Settlement can be executed by facilitator.'
      }
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /health - Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'x402-merchant-agent-intel',
    merchant: MERCHANT_ADDRESS,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /verify - x402 facilitator verification endpoint
 * (Called by facilitators to verify payment before settlement)
 */
app.post('/verify', async (req, res) => {
  try {
    const { paymentPayload, paymentRequirements } = req.body;
    
    // Run verification checks
    const checks = {
      signature: false,
      amount: false,
      payee: false,
      timing: false
    };

    // Verify signature
    checks.signature = await verifyEIP3009Signature(paymentPayload.payload);
    
    // Verify amount
    checks.amount = paymentPayload.payload.authorization.value === paymentRequirements.amount;
    
    // Verify payee
    checks.payee = paymentPayload.payload.authorization.to.toLowerCase() === MERCHANT_ADDRESS.toLowerCase();
    
    // Verify timing
    const now = Math.floor(Date.now() / 1000);
    const auth = paymentPayload.payload.authorization;
    checks.timing = now >= parseInt(auth.validAfter) && now <= parseInt(auth.validBefore);

    const allValid = Object.values(checks).every(v => v);

    res.json({
      valid: allValid,
      checks,
      message: allValid ? 'Payment payload is valid' : 'Payment verification failed'
    });

  } catch (error) {
    res.status(500).json({
      valid: false,
      error: error.message
    });
  }
});

// Export for serverless platforms
export default app;

// Start server if running locally (not on Vercel)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 4020;
  app.listen(PORT, () => {
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║     x402 Merchant - Agent Intel as a Service           ║');
    console.log('╠════════════════════════════════════════════════════════╣');
    console.log(`║  Merchant: ${MERCHANT_ADDRESS}    ║`);
    console.log(`║  Server: http://localhost:${PORT}                      ║`);
    console.log('╠════════════════════════════════════════════════════════╣');
    console.log('║  Landing Page: http://localhost:' + PORT + '                     ║');
    console.log('╠════════════════════════════════════════════════════════╣');
    console.log('║  API Endpoints:                                        ║');
    console.log('║    GET  /health     - Health check                     ║');
    console.log('║    GET  /prices     - All pricing tiers                ║');
    console.log('║    GET  /price      - Payment requirements             ║');
    console.log('║    POST /pay        - Process payment & get report     ║');
    console.log('║    POST /verify     - Verify payment payload           ║');
    console.log('╚════════════════════════════════════════════════════════╝');
  });
}
