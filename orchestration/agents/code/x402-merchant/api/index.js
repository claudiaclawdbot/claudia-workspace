// Vercel serverless entry point
import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { verifyMessage, parseUnits, formatUnits } from 'viem';
import { sepolia, baseSepolia } from 'viem/chains';

config();

const app = express();
app.use(cors());
app.use(express.json());

// CLAUDIA's wallet address (where payments go)
const MERCHANT_ADDRESS = process.env.MERCHANT_ADDRESS || '0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055';

// Network configuration
const SUPPORTED_NETWORKS = {
  'eip155:84532': {
    name: 'Base Sepolia',
    chain: baseSepolia,
    usdcAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    usdcDecimals: 6
  },
  'eip155:11155111': {
    name: 'Sepolia',
    chain: sepolia,
    usdcAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    usdcDecimals: 6
  }
};

// Pricing tiers
const PRICING_TIERS = {
  basic: {
    id: 'basic',
    name: 'Basic Intel',
    description: 'Quick summary of research topic',
    priceUSD: 25,
    priceUSDC: '25000000',
    features: ['Quick summary', 'Key points', 'Source links'],
    reportType: 'summary'
  },
  deep: {
    id: 'deep',
    name: 'Deep Research',
    description: 'Full research report with analysis',
    priceUSD: 125,
    priceUSDC: '125000000',
    features: ['Detailed analysis', 'Market insights', 'Trend data', 'Risk assessment'],
    reportType: 'full_report'
  },
  custom: {
    id: 'custom',
    name: 'Custom Analysis',
    description: 'Multi-source analysis with custom parameters',
    priceUSD: 250,
    priceUSDC: '250000000',
    features: ['Multi-source aggregation', 'Custom filters', 'Comparative analysis', 'Raw data access'],
    reportType: 'custom_analysis'
  }
};

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
        sources: [{ name: 'Web Search', count: 5 }, { name: 'News Feeds', count: 3 }],
        estimatedReadTime: '2 minutes',
        confidenceScore: 0.75
      };
    case 'full_report':
      return {
        ...baseReport,
        type: 'full_research_report',
        executiveSummary: `Comprehensive analysis of "${topic}"`,
        sections: {
          overview: { title: 'Market Overview', content: 'Detailed market landscape analysis.' },
          trends: { title: 'Trend Analysis', dataPoints: [{ metric: 'Interest Score', value: 72, trend: 'up' }] },
          risks: { title: 'Risk Assessment', level: 'medium', factors: ['Regulatory uncertainty', 'Market volatility'] }
        },
        sources: [{ name: 'Industry Reports', count: 5 }, { name: 'News Archives', count: 12 }],
        estimatedReadTime: '8 minutes',
        confidenceScore: 0.85
      };
    case 'custom_analysis':
      return {
        ...baseReport,
        type: 'custom_multi_source_analysis',
        executiveSummary: `Multi-source deep dive on "${topic}"`,
        analysis: {
          primary: { source: 'Structured Data APIs', findings: ['Dataset A shows 23% growth'] },
          secondary: { source: 'Unstructured Content', findings: ['Sentiment analysis positive'] },
          comparative: { method: 'Cross-source validation', result: 'High correlation (r=0.89)' }
        },
        sources: [{ name: 'Primary APIs', count: 6 }, { name: 'Secondary Feeds', count: 15 }],
        estimatedReadTime: '15 minutes',
        confidenceScore: 0.92
      };
    default:
      return baseReport;
  }
}

async function verifyEIP3009Signature(payload) {
  try {
    const { signature, authorization } = payload;
    const domain = {
      name: 'USDC',
      version: '2',
      chainId: 84532,
      verifyingContract: '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
    };
    const valid = await verifyMessage({
      address: authorization.from,
      message: { types: EIP3009_TYPES, primaryType: 'TransferWithAuthorization', domain, message: authorization },
      signature
    });
    return valid;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'x402-merchant-agent-intel', merchant: MERCHANT_ADDRESS, timestamp: new Date().toISOString() });
});

app.get('/prices', (req, res) => {
  res.json({ merchant: MERCHANT_ADDRESS, tiers: PRICING_TIERS, supportedNetworks: Object.keys(SUPPORTED_NETWORKS).map(key => ({ id: key, name: SUPPORTED_NETWORKS[key].name })) });
});

app.get('/price', (req, res) => {
  const network = req.query.network || 'eip155:84532';
  const tier = req.query.tier || 'basic';
  
  if (!SUPPORTED_NETWORKS[network]) return res.status(400).json({ error: 'Unsupported network' });
  if (!PRICING_TIERS[tier]) return res.status(400).json({ error: 'Invalid tier' });

  const networkConfig = SUPPORTED_NETWORKS[network];
  const pricing = PRICING_TIERS[tier];

  res.json({
    x402Version: 2,
    scheme: 'exact',
    network: network,
    amount: pricing.priceUSDC,
    asset: networkConfig.usdcAddress,
    payTo: MERCHANT_ADDRESS,
    maxTimeoutSeconds: 300,
    description: `${pricing.name} - ${pricing.description}`,
    mimeType: 'application/json',
    extra: { assetTransferMethod: 'eip3009', name: 'USDC', version: '2', tier: tier, features: pricing.features }
  });
});

app.post('/pay', async (req, res) => {
  try {
    const paymentPayload = req.body;
    if (!paymentPayload?.payload || !paymentPayload?.accepted) {
      return res.status(400).json({ error: 'Invalid payment payload' });
    }

    const { payload, accepted, resource } = paymentPayload;
    
    if (!SUPPORTED_NETWORKS[accepted.network]) return res.status(400).json({ error: 'Unsupported network' });
    
    const tier = Object.values(PRICING_TIERS).find(t => t.priceUSDC === accepted.amount);
    if (!tier) return res.status(400).json({ error: 'Invalid payment amount' });
    
    if (accepted.payTo.toLowerCase() !== MERCHANT_ADDRESS.toLowerCase()) {
      return res.status(400).json({ error: 'Invalid payee address' });
    }

    const signatureValid = await verifyEIP3009Signature(payload);
    if (!signatureValid) return res.status(402).json({ error: 'Payment verification failed' });

    const auth = payload.authorization;
    const now = Math.floor(Date.now() / 1000);
    
    if (now < parseInt(auth.validAfter)) return res.status(402).json({ error: 'Authorization not yet valid' });
    if (now > parseInt(auth.validBefore)) return res.status(402).json({ error: 'Authorization expired' });
    if (auth.value !== accepted.amount) return res.status(402).json({ error: 'Payment amount mismatch' });

    const topic = resource?.description?.replace('Agent Intel: ', '') || 'General Research';
    const intelReport = generateIntelReport(tier, topic);

    res.json({
      success: true,
      payment: { verified: true, amount: accepted.amount, payer: auth.from, payee: accepted.payTo, network: accepted.network, timestamp: now },
      report: intelReport,
      settlement: { status: 'pending_onchain', message: 'Payment authorized. Settlement can be executed by facilitator.' }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

app.post('/verify', async (req, res) => {
  try {
    const { paymentPayload, paymentRequirements } = req.body;
    const checks = { signature: false, amount: false, payee: false, timing: false };
    checks.signature = await verifyEIP3009Signature(paymentPayload.payload);
    checks.amount = paymentPayload.payload.authorization.value === paymentRequirements.amount;
    checks.payee = paymentPayload.payload.authorization.to.toLowerCase() === MERCHANT_ADDRESS.toLowerCase();
    const now = Math.floor(Date.now() / 1000);
    const auth = paymentPayload.payload.authorization;
    checks.timing = now >= parseInt(auth.validAfter) && now <= parseInt(auth.validBefore);
    const allValid = Object.values(checks).every(v => v);
    res.json({ valid: allValid, checks });
  } catch (error) {
    res.status(500).json({ valid: false, error: error.message });
  }
});

// Vercel serverless handler
export default async function handler(req, res) {
  return new Promise((resolve, reject) => {
    const originalEnd = res.end.bind(res);
    res.end = function(...args) {
      originalEnd(...args);
      resolve();
    };
    app(req, res, (err) => {
      if (err) reject(err);
    });
  });
}
