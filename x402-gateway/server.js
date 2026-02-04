import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3003;
const GATEWAY_FEE_PERCENT = parseInt(process.env.GATEWAY_FEE_PERCENT || '5', 10);
const GATEWAY_WALLET = process.env.GATEWAY_WALLET || '0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055';

// Validate critical configuration
if (!GATEWAY_WALLET || GATEWAY_WALLET === '0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055') {
  console.warn('⚠️  Using default gateway wallet. Set GATEWAY_WALLET env var for production.');
}
if (GATEWAY_FEE_PERCENT < 0 || GATEWAY_FEE_PERCENT > 100) {
  console.error('❌ Invalid GATEWAY_FEE_PERCENT. Must be between 0 and 100.');
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());

// API Key authentication middleware for protected endpoints
const API_KEY = process.env.API_KEY;
const requireAuth = (req, res, next) => {
  // Skip auth if no API_KEY is configured (development mode)
  if (!API_KEY) {
    return next();
  }
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized - Bearer token required' });
  }
  
  const token = authHeader.slice(7);
  if (token !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
  
  next();
};

// Load services
let services = [];
async function loadServices() {
  try {
    const data = await fs.readFile(path.join(__dirname, 'services.json'), 'utf8');
    services = JSON.parse(data);
    console.log(`✓ Loaded ${services.length} services`);
  } catch (err) {
    console.error('Error loading services:', err);
    services = [];
  }
}

// ===== PUBLIC ENDPOINTS (FREE) =====

// Gateway info
app.get('/', (req, res) => {
  res.json({
    name: 'x402 Service Gateway',
    description: 'Discovery platform and gateway for x402-enabled agent services',
    version: '1.0.0',
    wallet: GATEWAY_WALLET,
    fee: `${GATEWAY_FEE_PERCENT}%`,
    endpoints: {
      directory: {
        'GET /services': 'List all services',
        'GET /services/:id': 'Get specific service details',
        'GET /categories': 'List service categories',
        'GET /featured': 'Get featured services'
      },
      gateway: {
        'POST /gateway/:serviceId/:endpoint': 'Route to service with gateway fee'
      },
      info: {
        'GET /health': 'Gateway health check',
        'GET /stats': 'Gateway statistics'
      }
    },
    services: services.length,
    docs: 'https://github.com/ultimatecodemaster/x402-gateway'
  });
});

// List all services
app.get('/services', (req, res) => {
  const { category, verified, featured } = req.query;
  
  let filtered = services;
  
  if (category) {
    filtered = filtered.filter(s => s.category === category);
  }
  
  if (verified === 'true') {
    filtered = filtered.filter(s => s.verified);
  }
  
  if (featured === 'true') {
    filtered = filtered.filter(s => s.featured);
  }
  
  // Return summary view (no full endpoint details)
  const summary = filtered.map(s => ({
    id: s.id,
    name: s.name,
    description: s.description,
    provider: s.provider,
    category: s.category,
    tags: s.tags,
    pricing: s.pricing,
    verified: s.verified,
    featured: s.featured,
    url: s.url,
    stats: s.stats
  }));
  
  res.json({
    count: summary.length,
    services: summary
  });
});

// Get specific service
app.get('/services/:id', (req, res) => {
  const service = services.find(s => s.id === req.params.id);
  
  if (!service) {
    return res.status(404).json({ error: 'Service not found' });
  }
  
  // Add gateway fee info
  const enrichedService = {
    ...service,
    gateway: {
      fee: `${GATEWAY_FEE_PERCENT}%`,
      wallet: GATEWAY_WALLET,
      routingEndpoint: `/gateway/${service.id}`
    }
  };
  
  res.json(enrichedService);
});

// List categories
app.get('/categories', (req, res) => {
  const categories = {};
  
  services.forEach(s => {
    if (!categories[s.category]) {
      categories[s.category] = {
        name: s.category,
        count: 0,
        services: []
      };
    }
    categories[s.category].count++;
    categories[s.category].services.push(s.id);
  });
  
  res.json({
    count: Object.keys(categories).length,
    categories: categories
  });
});

// Get featured services
app.get('/featured', (req, res) => {
  const featured = services.filter(s => s.featured);
  res.json({
    count: featured.length,
    services: featured
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: services.length,
    uptime: process.uptime()
  });
});

// Gateway stats
app.get('/stats', (req, res) => {
  const totalCalls = services.reduce((sum, s) => sum + (s.stats?.totalCalls || 0), 0);
  const avgUptime = services.reduce((sum, s) => sum + (s.stats?.uptime || 0), 0) / services.length || 0;
  
  res.json({
    gateway: {
      services: services.length,
      fee: `${GATEWAY_FEE_PERCENT}%`,
      wallet: GATEWAY_WALLET
    },
    aggregate: {
      totalCalls,
      avgUptime: avgUptime.toFixed(2),
      verifiedServices: services.filter(s => s.verified).length,
      featuredServices: services.filter(s => s.featured).length
    },
    byCategory: services.reduce((acc, s) => {
      acc[s.category] = (acc[s.category] || 0) + 1;
      return acc;
    }, {})
  });
});

// ===== GATEWAY ENDPOINTS (PAID - includes fee) =====

// Route to service with fee
app.post('/gateway/:serviceId/*', requireAuth, async (req, res) => {
  const { serviceId } = req.params;
  const endpoint = req.params[0] || '';
  
  const service = services.find(s => s.id === serviceId);
  
  if (!service) {
    return res.status(404).json({ 
      error: 'Service not found',
      availableServices: services.map(s => s.id)
    });
  }
  
  // Find the endpoint configuration
  const endpointConfig = service.endpoints.find(e => 
    e.path.replace(/^\//, '') === endpoint && e.method === 'POST'
  );
  
  if (!endpointConfig) {
    return res.status(404).json({
      error: 'Endpoint not found',
      availableEndpoints: service.endpoints
        .filter(e => e.method === 'POST')
        .map(e => e.path)
    });
  }
  
  // Calculate price with gateway fee
  const basePrice = endpointConfig.cost || 0;
  const gatewayFee = basePrice * (GATEWAY_FEE_PERCENT / 100);
  const totalPrice = basePrice + gatewayFee;
  
  // Return 402 Payment Required with gateway fee breakdown
  res.status(402).json({
    error: 'Payment Required',
    gateway: {
      name: 'x402 Service Gateway',
      fee: `${GATEWAY_FEE_PERCENT}%`,
      feeAmount: gatewayFee.toFixed(4),
      gatewayWallet: GATEWAY_WALLET
    },
    service: {
      name: service.name,
      basePrice: basePrice.toFixed(4),
      currency: endpointConfig.currency || 'USDC'
    },
    total: {
      amount: totalPrice.toFixed(4),
      currency: endpointConfig.currency || 'USDC',
      breakdown: {
        service: basePrice.toFixed(4),
        gateway: gatewayFee.toFixed(4)
      }
    },
    x402Version: 1,
    x402PaymentRequirements: {
      scheme: "exact",
      network: "base",
      requiredToken: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      requiredAmount: Math.floor(totalPrice * 1000000).toString(), // USDC has 6 decimals
      payToAddress: GATEWAY_WALLET,
      description: `${service.name} via Gateway`,
      extra: {
        serviceId: service.id,
        endpoint: endpoint,
        gatewayFee: gatewayFee.toFixed(4),
        basePrice: basePrice.toFixed(4)
      }
    },
    message: 'Payment includes 5% gateway fee. Call service directly to avoid fees.',
    directUrl: `${service.url}/${endpoint}`
  });
});

// Also handle GET requests for paid endpoints
app.get('/gateway/:serviceId/*', async (req, res) => {
  const { serviceId } = req.params;
  const endpoint = req.params[0] || '';
  
  const service = services.find(s => s.id === serviceId);
  
  if (!service) {
    return res.status(404).json({ 
      error: 'Service not found',
      availableServices: services.map(s => s.id)
    });
  }
  
  // Find the endpoint configuration
  const endpointConfig = service.endpoints.find(e => 
    e.path.replace(/^\//, '') === endpoint && e.method === 'GET'
  );
  
  if (!endpointConfig) {
    return res.status(404).json({
      error: 'Endpoint not found',
      availableEndpoints: service.endpoints
        .filter(e => e.method === 'GET')
        .map(e => e.path)
    });
  }
  
  // If it's a free endpoint, we could proxy it, but let's just redirect
  if (endpointConfig.cost === 0) {
    return res.json({
      message: 'This is a free endpoint. Call directly for better performance.',
      directUrl: `${service.url}/${endpoint}`,
      service: {
        id: service.id,
        name: service.name
      }
    });
  }
  
  // Calculate price with gateway fee
  const basePrice = endpointConfig.cost || 0;
  const gatewayFee = basePrice * (GATEWAY_FEE_PERCENT / 100);
  const totalPrice = basePrice + gatewayFee;
  
  // Return 402 Payment Required
  res.status(402).json({
    error: 'Payment Required',
    gateway: {
      name: 'x402 Service Gateway',
      fee: `${GATEWAY_FEE_PERCENT}%`,
      feeAmount: gatewayFee.toFixed(4),
      gatewayWallet: GATEWAY_WALLET
    },
    service: {
      name: service.name,
      basePrice: basePrice.toFixed(4),
      currency: endpointConfig.currency || 'USDC'
    },
    total: {
      amount: totalPrice.toFixed(4),
      currency: endpointConfig.currency || 'USDC',
      breakdown: {
        service: basePrice.toFixed(4),
        gateway: gatewayFee.toFixed(4)
      }
    },
    x402Version: 1,
    x402PaymentRequirements: {
      scheme: "exact",
      network: "base",
      requiredToken: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      requiredAmount: Math.floor(totalPrice * 1000000).toString(),
      payToAddress: GATEWAY_WALLET,
      description: `${service.name} via Gateway`,
      extra: {
        serviceId: service.id,
        endpoint: endpoint,
        gatewayFee: gatewayFee.toFixed(4),
        basePrice: basePrice.toFixed(4)
      }
    },
    directUrl: `${service.url}/${endpoint}`
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Gateway error:', err);
  res.status(500).json({
    error: 'Gateway error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'Endpoint not found. Visit / for API documentation.',
    docs: '/'
  });
});

// Start server
async function start() {
  await loadServices();
  
  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║           x402 Service Gateway                             ║
║           Discovery Platform for Agent Services            ║
╠════════════════════════════════════════════════════════════╣
║  Port:     ${PORT.toString().padEnd(47)} ║
║  Services: ${services.length.toString().padEnd(47)} ║
║  Fee:      ${(GATEWAY_FEE_PERCENT + '%').padEnd(47)} ║
║  Wallet:   ${GATEWAY_WALLET.slice(0, 20) + '...'.padEnd(27)} ║
╚════════════════════════════════════════════════════════════╝
    `);
  });
}

start().catch(console.error);
