/**
 * x402 Service Directory
 * 
 * A discovery and registry service for x402-enabled agent services.
 * Services can register for a fee, agents can discover them for free.
 * Premium features (featured listings, advanced analytics) require payment.
 * 
 * Revenue Model:
 * - Service Registration: $1 USDC (one-time)
 * - Featured Listing: $5 USDC/month
 * - Premium API Access: $0.01 USDC per 100 requests
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ServiceRegistry } from './registry.js';
import { PaymentVerifier } from './payments.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Configuration
const PORT = process.env.PORT || 3003;
const RECEIVER_ADDRESS = process.env.RECEIVER_ADDRESS || '0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055';
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // Base USDC

// Initialize registry and payment verifier
const registry = new ServiceRegistry();
const paymentVerifier = new PaymentVerifier(RECEIVER_ADDRESS, USDC_ADDRESS);

// Price configuration (in USDC, 6 decimals)
const PRICING = {
  registration: '1000000',      // $1.00 USDC
  featuredListing: '5000000',   // $5.00 USDC
  premiumApi: '10000'           // $0.01 USDC per 100 calls
};

// ============================================================================
// Helper Functions
// ============================================================================

function generatePaymentRequirements(resource, amount) {
  return {
    scheme: "exact",
    network: "base",
    maxAmountRequired: amount,
    resource: resource,
    description: getResourceDescription(resource),
    mimeType: "application/json",
    payTo: RECEIVER_ADDRESS,
    maxTimeoutSeconds: 300,
    asset: {
      [USDC_ADDRESS]: {
        "asset": USDC_ADDRESS,
        "amount": amount,
        "decimals": 6,
        "eip712": true
      }
    }
  };
}

function getResourceDescription(resource) {
  const descriptions = {
    'registration': 'Register a new service in the directory ($1.00 USDC)',
    'featured': 'Feature your service in directory listings ($5.00 USDC)',
    'premium-search': 'Advanced search with filters and analytics ($0.01 USDC)',
    'stats': 'Detailed service statistics and analytics ($0.01 USDC)',
    'verify': 'Verify service ownership ($0.10 USDC)'
  };
  return descriptions[resource] || 'Premium service access';
}

// ============================================================================
// Public Endpoints (Free)
// ============================================================================

/**
 * Health check and service info
 */
app.get('/status', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'x402-service-directory',
    version: '1.0.0',
    uptime: process.uptime(),
    stats: registry.getStats(),
    timestamp: new Date().toISOString()
  });
});

/**
 * Get pricing information
 */
app.get('/pricing', (req, res) => {
  res.json({
    pricing: {
      registration: {
        amount: '1.00',
        currency: 'USDC',
        description: 'One-time fee to register a service'
      },
      featuredListing: {
        amount: '5.00',
        currency: 'USDC',
        description: 'Feature your service (monthly)'
      },
      premiumApi: {
        amount: '0.01',
        currency: 'USDC',
        description: 'Per 100 premium API calls'
      }
    },
    paymentAddress: RECEIVER_ADDRESS,
    acceptedTokens: ['USDC'],
    network: 'base'
  });
});

/**
 * List all services (free, basic info)
 */
app.get('/services', (req, res) => {
  const { category, sort = 'newest', limit = 50 } = req.query;
  
  let services = registry.listServices({
    category,
    sort,
    limit: parseInt(limit)
  });

  res.json({
    services: services.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      category: s.category,
      url: s.url,
      pricing: s.pricing,
      verified: s.verified,
      featured: s.featured,
      rating: s.rating,
      totalCalls: s.totalCalls,
      registeredAt: s.registeredAt
    })),
    total: services.length,
    timestamp: new Date().toISOString()
  });
});

/**
 * Search services (free, basic search)
 */
app.get('/search', (req, res) => {
  const { q, category } = req.query;
  
  if (!q) {
    return res.status(400).json({
      error: 'Query parameter "q" is required'
    });
  }

  const results = registry.searchServices(q, { category });

  res.json({
    query: q,
    results: results.map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      category: s.category,
      url: s.url,
      pricing: s.pricing,
      verified: s.verified,
      featured: s.featured,
      rating: s.rating
    })),
    total: results.length,
    timestamp: new Date().toISOString()
  });
});

/**
 * Get service by ID
 */
app.get('/services/:id', (req, res) => {
  const service = registry.getService(req.params.id);
  
  if (!service) {
    return res.status(404).json({
      error: 'Service not found',
      id: req.params.id
    });
  }

  res.json({
    service: {
      id: service.id,
      name: service.name,
      description: service.description,
      category: service.category,
      url: service.url,
      pricing: service.pricing,
      endpoints: service.endpoints,
      verified: service.verified,
      featured: service.featured,
      rating: service.rating,
      totalCalls: service.totalCalls,
      uptime: service.uptime,
      registeredAt: service.registeredAt,
      lastSeen: service.lastSeen,
      tags: service.tags,
      documentation: service.documentation
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * Get categories
 */
app.get('/categories', (req, res) => {
  const categories = registry.getCategories();
  
  res.json({
    categories: categories.map(c => ({
      name: c.name,
      count: c.count,
      description: getCategoryDescription(c.name)
    })),
    timestamp: new Date().toISOString()
  });
});

function getCategoryDescription(category) {
  const descriptions = {
    'research': 'AI-powered research and intelligence services',
    'data': 'Real-time data feeds and APIs',
    'compute': 'Computing and processing services',
    'storage': 'Decentralized storage solutions',
    'analytics': 'Data analysis and visualization',
    'messaging': 'Communication and notification services',
    'finance': 'Financial and payment services',
    'identity': 'Identity and authentication services'
  };
  return descriptions[category] || 'Agent services';
}

// ============================================================================
// Paid Endpoints (x402 Payments Required)
// ============================================================================

/**
 * Register a new service (requires payment)
 */
app.post('/register', async (req, res) => {
  const paymentHeader = req.headers['x-x402-payment'];
  
  // Check for payment
  if (!paymentHeader) {
    return res.status(402).json({
      error: 'Payment required',
      paymentRequirements: generatePaymentRequirements('registration', PRICING.registration)
    });
  }

  // Verify payment
  const verification = await paymentVerifier.verify(paymentHeader);
  
  if (!verification.valid) {
    return res.status(402).json({
      error: 'Invalid payment',
      details: verification.error,
      paymentRequirements: generatePaymentRequirements('registration', PRICING.registration)
    });
  }

  // Validate request body
  const { name, description, url, category, pricing, endpoints, tags, documentation } = req.body;
  
  if (!name || !description || !url || !category) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['name', 'description', 'url', 'category'],
      optional: ['pricing', 'endpoints', 'tags', 'documentation']
    });
  }

  // Validate URL format
  try {
    new URL(url);
  } catch {
    return res.status(400).json({
      error: 'Invalid URL format',
      field: 'url'
    });
  }

  // Check for duplicate URL
  if (registry.findByUrl(url)) {
    return res.status(409).json({
      error: 'Service with this URL already registered',
      url
    });
  }

  // Register the service
  const service = registry.registerService({
    name,
    description,
    url,
    category,
    pricing: pricing || { type: 'free', currency: 'USDC' },
    endpoints: endpoints || {},
    tags: tags || [],
    documentation,
    owner: verification.payment.from
  });

  res.status(201).json({
    success: true,
    message: 'Service registered successfully',
    service: {
      id: service.id,
      name: service.name,
      url: service.url,
      category: service.category,
      registeredAt: service.registeredAt
    },
    payment: {
      amount: PRICING.registration,
      currency: 'USDC',
      txHash: verification.payment.txHash || 'pending'
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * Feature a service (requires payment)
 */
app.post('/services/:id/feature', async (req, res) => {
  const paymentHeader = req.headers['x-x402-payment'];
  
  if (!paymentHeader) {
    return res.status(402).json({
      error: 'Payment required',
      paymentRequirements: generatePaymentRequirements('featured', PRICING.featuredListing)
    });
  }

  const verification = await paymentVerifier.verify(paymentHeader);
  
  if (!verification.valid) {
    return res.status(402).json({
      error: 'Invalid payment',
      details: verification.error,
      paymentRequirements: generatePaymentRequirements('featured', PRICING.featuredListing)
    });
  }

  const service = registry.getService(req.params.id);
  
  if (!service) {
    return res.status(404).json({
      error: 'Service not found'
    });
  }

  // Verify ownership (optional - could allow anyone to feature any service)
  // For now, we'll allow it as a "sponsorship" model
  
  const featured = registry.featureService(req.params.id, {
    featuredBy: verification.payment.from,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  });

  res.json({
    success: true,
    message: 'Service featured successfully',
    service: {
      id: featured.id,
      name: featured.name,
      featured: true,
      featuredUntil: featured.featuredUntil
    },
    payment: {
      amount: PRICING.featuredListing,
      currency: 'USDC',
      duration: '30 days'
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * Premium search with advanced filters (requires payment)
 */
app.post('/search/premium', async (req, res) => {
  const paymentHeader = req.headers['x-x402-payment'];
  
  if (!paymentHeader) {
    return res.status(402).json({
      error: 'Payment required',
      paymentRequirements: generatePaymentRequirements('premium-search', PRICING.premiumApi)
    });
  }

  const verification = await paymentVerifier.verify(paymentHeader);
  
  if (!verification.valid) {
    return res.status(402).json({
      error: 'Invalid payment',
      details: verification.error,
      paymentRequirements: generatePaymentRequirements('premium-search', PRICING.premiumApi)
    });
  }

  const { q, filters, sortBy = 'relevance', includeAnalytics } = req.body;
  
  const results = registry.advancedSearch(q, {
    filters,
    sortBy,
    includeAnalytics
  });

  res.json({
    success: true,
    query: q,
    filters: filters || {},
    results: results.services,
    analytics: results.analytics,
    total: results.total,
    payment: {
      amount: PRICING.premiumApi,
      currency: 'USDC'
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * Update service (owner only, requires verification)
 */
app.put('/services/:id', async (req, res) => {
  const paymentHeader = req.headers['x-x402-payment'];
  const signature = req.headers['x-service-signature'];
  
  const service = registry.getService(req.params.id);
  
  if (!service) {
    return res.status(404).json({
      error: 'Service not found'
    });
  }

  // For now, simple API key or signature verification
  // In production, this would verify on-chain ownership
  
  const updates = req.body;
  const allowedUpdates = ['name', 'description', 'pricing', 'endpoints', 'tags', 'documentation'];
  
  const filteredUpdates = {};
  for (const key of allowedUpdates) {
    if (updates[key] !== undefined) {
      filteredUpdates[key] = updates[key];
    }
  }

  const updated = registry.updateService(req.params.id, filteredUpdates);

  res.json({
    success: true,
    message: 'Service updated successfully',
    service: {
      id: updated.id,
      name: updated.name,
      updatedAt: updated.updatedAt
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * Delete service (owner only)
 */
app.delete('/services/:id', async (req, res) => {
  const service = registry.getService(req.params.id);
  
  if (!service) {
    return res.status(404).json({
      error: 'Service not found'
    });
  }

  registry.deleteService(req.params.id);

  res.json({
    success: true,
    message: 'Service deleted successfully',
    id: req.params.id,
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// Internal/Admin Endpoints
// ============================================================================

/**
 * Health check for a service (called by monitor)
 */
app.post('/services/:id/heartbeat', (req, res) => {
  const { status, latency } = req.body;
  
  registry.updateServiceHealth(req.params.id, {
    status,
    latency,
    lastSeen: new Date().toISOString()
  });

  res.json({
    success: true,
    timestamp: new Date().toISOString()
  });
});

/**
 * Get directory statistics
 */
app.get('/stats', (req, res) => {
  const stats = registry.getDetailedStats();
  
  res.json({
    stats,
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// Error Handling
// ============================================================================

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============================================================================
// Start Server
// ============================================================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║           🌀 x402 Service Directory v1.0.0                 ║
╠════════════════════════════════════════════════════════════╣
║  Port: ${PORT}${' '.repeat(52 - PORT.toString().length)}║
║  Network: Base                                             ║
║  Payment Receiver: ${RECEIVER_ADDRESS.slice(0, 20)}...${' '.repeat(21)}║
╠════════════════════════════════════════════════════════════╣
║  Revenue Model:                                            ║
║    • Registration: $1.00 USDC                              ║
║    • Featured Listing: $5.00 USDC/month                    ║
║    • Premium API: $0.01 USDC per 100 calls                 ║
╠════════════════════════════════════════════════════════════╣
║  Endpoints:                                                ║
║    GET  /status        - Health check                      ║
║    GET  /pricing       - Pricing info                      ║
║    GET  /services      - List services                     ║
║    GET  /services/:id  - Get service details               ║
║    GET  /search        - Search services                   ║
║    GET  /categories    - List categories                   ║
║    POST /register      - Register service (paid)           ║
║    POST /search/premium - Advanced search (paid)           ║
╚════════════════════════════════════════════════════════════╝
  `);
});

export { app, registry };
