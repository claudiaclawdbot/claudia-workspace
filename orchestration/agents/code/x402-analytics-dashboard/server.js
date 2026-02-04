/**
 * x402 Analytics Dashboard
 * 
 * Revenue-generating analytics service for the x402 ecosystem.
 * Provides transaction tracking, revenue analytics, and service performance metrics.
 * 
 * Revenue Model:
 * - Basic Metrics (Free): Transaction counts, basic revenue totals, 24h window
 * - Premium Analytics ($0.05 USDC): 30-day history, trending services, revenue breakdown
 * - Enterprise Reports ($0.50 USDC): Custom date ranges, export data, competitor analysis
 * - Real-time WebSocket ($0.10 USDC): Live transaction stream
 * 
 * @version 1.0.0
 * @author Claudia
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AnalyticsStore } from './store.js';
import { PaymentVerifier } from './payments.js';
import { RevenueTracker } from './revenue.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Configuration
const PORT = process.env.PORT || 3004;
const RECEIVER_ADDRESS = process.env.RECEIVER_ADDRESS || '0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055';
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // Base USDC

// Initialize components
const store = new AnalyticsStore();
const paymentVerifier = new PaymentVerifier(RECEIVER_ADDRESS, USDC_ADDRESS);
const revenueTracker = new RevenueTracker(store);

// Pricing configuration (USDC with 6 decimals)
const PRICING = {
  premiumAnalytics: '50000',     // $0.05 USDC
  enterpriseReport: '500000',    // $0.50 USDC  
  realtimeStream: '100000',      // $0.10 USDC
  competitorAnalysis: '250000'   // $0.25 USDC
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
    'premium-analytics': 'Premium analytics with 30-day history and trending data ($0.05 USDC)',
    'enterprise-report': 'Enterprise report with custom date ranges and export ($0.50 USDC)',
    'realtime-stream': 'Real-time transaction stream access ($0.10 USDC)',
    'competitor-analysis': 'Competitor service analysis and market insights ($0.25 USDC)'
  };
  return descriptions[resource] || 'Premium analytics access';
}

// ============================================================================
// Public Endpoints (Free Tier)
// ============================================================================

/**
 * Health check and service info
 */
app.get('/status', (req, res) => {
  const stats = store.getGlobalStats();
  
  res.json({
    status: 'healthy',
    service: 'x402-analytics-dashboard',
    version: '1.0.0',
    uptime: process.uptime(),
    transactionsTracked: stats.totalTransactions,
    servicesTracked: stats.totalServices,
    revenueTracked: stats.totalRevenue,
    timestamp: new Date().toISOString()
  });
});

/**
 * Get pricing information
 */
app.get('/pricing', (req, res) => {
  res.json({
    tiers: {
      free: {
        name: 'Basic',
        price: '0',
        features: [
          '24-hour transaction history',
          'Basic revenue totals',
          'Top 5 services by volume',
          'Health status overview'
        ]
      },
      premium: {
        name: 'Premium',
        price: '0.05',
        currency: 'USDC',
        per: 'request',
        features: [
          '30-day transaction history',
          'Trending services analysis',
          'Revenue breakdown by category',
          'Hourly volume charts',
          'Service performance scores'
        ]
      },
      enterprise: {
        name: 'Enterprise',
        price: '0.50',
        currency: 'USDC',
        per: 'report',
        features: [
          'Custom date range queries',
          'Data export (JSON/CSV)',
          'Competitor analysis',
          'Revenue forecasting',
          'API access for integrations'
        ]
      },
      realtime: {
        name: 'Real-time Stream',
        price: '0.10',
        currency: 'USDC',
        per: 'session',
        features: [
          'Live transaction feed',
          'Real-time revenue tracking',
          'Instant service alerts',
          'WebSocket connection'
        ]
      }
    },
    paymentAddress: RECEIVER_ADDRESS,
    acceptedTokens: ['USDC'],
    network: 'base'
  });
});

/**
 * Global dashboard metrics (free, 24h window)
 */
app.get('/dashboard', (req, res) => {
  const hours = Math.min(parseInt(req.query.hours) || 24, 24); // Max 24h for free
  
  const metrics = store.getDashboardMetrics({ hours });
  
  res.json({
    tier: 'free',
    window: `${hours}h`,
    summary: {
      totalTransactions: metrics.totalTransactions,
      totalRevenue: metrics.totalRevenue,
      totalServices: metrics.totalServices,
      avgTransactionValue: metrics.avgTransactionValue,
      successRate: metrics.successRate
    },
    topServices: metrics.topServices.slice(0, 5),
    recentActivity: metrics.recentActivity.slice(0, 10),
    hourlyVolume: metrics.hourlyVolume,
    timestamp: new Date().toISOString()
  });
});

/**
 * Get basic service metrics (free, limited history)
 */
app.get('/services/:serviceId/metrics', (req, res) => {
  const { serviceId } = req.params;
  const hours = Math.min(parseInt(req.query.hours) || 24, 24);
  
  const metrics = store.getServiceMetrics(serviceId, { hours });
  
  if (!metrics) {
    return res.status(404).json({
      error: 'Service not found or no data available',
      serviceId
    });
  }
  
  res.json({
    tier: 'free',
    window: `${hours}h`,
    serviceId,
    metrics: {
      transactionCount: metrics.transactionCount,
      revenue: metrics.revenue,
      avgTransactionValue: metrics.avgTransactionValue,
      successRate: metrics.successRate,
      uptime: metrics.uptime
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * List all tracked services (basic info, free)
 */
app.get('/services', (req, res) => {
  const services = store.listServices();
  
  res.json({
    services: services.map(s => ({
      id: s.id,
      name: s.name,
      category: s.category,
      totalTransactions: s.totalTransactions,
      totalRevenue: s.totalRevenue,
      lastActive: s.lastActive,
      health: s.health
    })),
    total: services.length,
    timestamp: new Date().toISOString()
  });
});

/**
 * Get category breakdown (free)
 */
app.get('/categories', (req, res) => {
  const categories = store.getCategoryBreakdown();
  
  res.json({
    categories: categories.map(c => ({
      name: c.name,
      serviceCount: c.serviceCount,
      transactionVolume: c.transactionVolume,
      revenue: c.revenue,
      avgPrice: c.avgPrice
    })),
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// Premium Endpoints (Paid via x402)
// ============================================================================

/**
 * Premium analytics with 30-day history and trending
 */
app.post('/analytics/premium', async (req, res) => {
  const paymentHeader = req.headers['x-x402-payment'];
  
  if (!paymentHeader) {
    return res.status(402).json({
      error: 'Payment required',
      paymentRequirements: generatePaymentRequirements('premium-analytics', PRICING.premiumAnalytics)
    });
  }
  
  const verification = await paymentVerifier.verify(paymentHeader);
  
  if (!verification.valid) {
    return res.status(402).json({
      error: 'Invalid payment',
      details: verification.error,
      paymentRequirements: generatePaymentRequirements('premium-analytics', PRICING.premiumAnalytics)
    });
  }
  
  // Record this payment as revenue
  revenueTracker.recordPayment({
    type: 'premium-analytics',
    amount: PRICING.premiumAnalytics,
    from: verification.payment.from,
    timestamp: new Date().toISOString()
  });
  
  const { days = 30, serviceId, category } = req.body;
  const daysClamped = Math.min(parseInt(days), 90); // Max 90 days
  
  const analytics = store.getPremiumAnalytics({
    days: daysClamped,
    serviceId,
    category
  });
  
  res.json({
    tier: 'premium',
    window: `${daysClamped}d`,
    summary: analytics.summary,
    trending: analytics.trending,
    revenueBreakdown: analytics.revenueBreakdown,
    hourlyVolume: analytics.hourlyVolume,
    topPerformers: analytics.topPerformers,
    growthMetrics: analytics.growthMetrics,
    payment: {
      amount: PRICING.premiumAnalytics,
      currency: 'USDC',
      txHash: verification.payment.txHash || 'pending'
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * Enterprise report with custom date ranges and export
 */
app.post('/analytics/enterprise', async (req, res) => {
  const paymentHeader = req.headers['x-x402-payment'];
  
  if (!paymentHeader) {
    return res.status(402).json({
      error: 'Payment required',
      paymentRequirements: generatePaymentRequirements('enterprise-report', PRICING.enterpriseReport)
    });
  }
  
  const verification = await paymentVerifier.verify(paymentHeader);
  
  if (!verification.valid) {
    return res.status(402).json({
      error: 'Invalid payment',
      details: verification.error,
      paymentRequirements: generatePaymentRequirements('enterprise-report', PRICING.enterpriseReport)
    });
  }
  
  revenueTracker.recordPayment({
    type: 'enterprise-report',
    amount: PRICING.enterpriseReport,
    from: verification.payment.from,
    timestamp: new Date().toISOString()
  });
  
  const { 
    startDate, 
    endDate, 
    serviceIds = [], 
    categories = [],
    exportFormat = 'json',
    includeForecast = false 
  } = req.body;
  
  if (!startDate || !endDate) {
    return res.status(400).json({
      error: 'startDate and endDate are required',
      format: 'ISO 8601 date string'
    });
  }
  
  const report = store.generateEnterpriseReport({
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    serviceIds,
    categories,
    includeForecast
  });
  
  const response = {
    tier: 'enterprise',
    period: { startDate, endDate },
    summary: report.summary,
    dailyBreakdown: report.dailyBreakdown,
    servicePerformance: report.servicePerformance,
    categoryAnalysis: report.categoryAnalysis,
    forecasts: report.forecasts,
    insights: report.insights,
    payment: {
      amount: PRICING.enterpriseReport,
      currency: 'USDC',
      txHash: verification.payment.txHash || 'pending'
    },
    timestamp: new Date().toISOString()
  };
  
  if (exportFormat === 'csv') {
    const csv = generateCSV(report);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="x402-analytics-report.csv"');
    return res.send(csv);
  }
  
  res.json(response);
});

/**
 * Competitor analysis (paid feature)
 */
app.post('/analytics/competitors', async (req, res) => {
  const paymentHeader = req.headers['x-x402-payment'];
  
  if (!paymentHeader) {
    return res.status(402).json({
      error: 'Payment required',
      paymentRequirements: generatePaymentRequirements('competitor-analysis', PRICING.competitorAnalysis)
    });
  }
  
  const verification = await paymentVerifier.verify(paymentHeader);
  
  if (!verification.valid) {
    return res.status(402).json({
      error: 'Invalid payment',
      details: verification.error,
      paymentRequirements: generatePaymentRequirements('competitor-analysis', PRICING.competitorAnalysis)
    });
  }
  
  revenueTracker.recordPayment({
    type: 'competitor-analysis',
    amount: PRICING.competitorAnalysis,
    from: verification.payment.from,
    timestamp: new Date().toISOString()
  });
  
  const { category, serviceId, metric = 'revenue' } = req.body;
  
  const analysis = store.getCompetitorAnalysis({
    category,
    serviceId,
    metric
  });
  
  res.json({
    tier: 'premium',
    analysis: {
      targetService: serviceId,
      category,
      competitors: analysis.competitors,
      marketPosition: analysis.marketPosition,
      priceComparison: analysis.priceComparison,
      volumeComparison: analysis.volumeComparison,
      recommendations: analysis.recommendations
    },
    payment: {
      amount: PRICING.competitorAnalysis,
      currency: 'USDC'
    },
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// Data Ingestion Endpoints (Called by x402 services)
// ============================================================================

/**
 * Record a transaction (called by x402 services)
 */
app.post('/ingest/transaction', (req, res) => {
  const { 
    serviceId, 
    serviceName,
    category,
    amount, 
    currency,
    status,
    timestamp,
    metadata = {}
  } = req.body;
  
  if (!serviceId || !amount || !status) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['serviceId', 'amount', 'status'],
      optional: ['serviceName', 'category', 'currency', 'timestamp', 'metadata']
    });
  }
  
  const transaction = store.recordTransaction({
    serviceId,
    serviceName,
    category,
    amount,
    currency: currency || 'USDC',
    status,
    timestamp: timestamp || new Date().toISOString(),
    metadata
  });
  
  res.status(201).json({
    success: true,
    transactionId: transaction.id,
    recordedAt: transaction.recordedAt
  });
});

/**
 * Batch ingest transactions
 */
app.post('/ingest/batch', (req, res) => {
  const { transactions } = req.body;
  
  if (!Array.isArray(transactions)) {
    return res.status(400).json({
      error: 'transactions must be an array'
    });
  }
  
  const results = transactions.map(tx => {
    try {
      return store.recordTransaction({
        ...tx,
        timestamp: tx.timestamp || new Date().toISOString()
      });
    } catch (err) {
      return { error: err.message, tx };
    }
  });
  
  res.json({
    success: true,
    recorded: results.filter(r => !r.error).length,
    failed: results.filter(r => r.error).length,
    results
  });
});

/**
 * Update service health/status
 */
app.post('/ingest/health/:serviceId', (req, res) => {
  const { serviceId } = req.params;
  const { status, latency, uptime } = req.body;
  
  store.updateServiceHealth(serviceId, {
    status,
    latency,
    uptime,
    lastCheck: new Date().toISOString()
  });
  
  res.json({
    success: true,
    serviceId,
    recordedAt: new Date().toISOString()
  });
});

// ============================================================================
// Revenue Tracking Endpoints
// ============================================================================

/**
 * Get analytics service revenue (public)
 */
app.get('/revenue', (req, res) => {
  const revenue = revenueTracker.getRevenue();
  
  res.json({
    revenue: {
      total: revenue.total,
      byTier: revenue.byTier,
      byDay: revenue.byDay.slice(-30), // Last 30 days
      thisMonth: revenue.thisMonth,
      lastMonth: revenue.lastMonth
    },
    timestamp: new Date().toISOString()
  });
});

/**
 * Get leaderboard (top contributing services)
 */
app.get('/leaderboard', (req, res) => {
  const { metric = 'revenue', limit = 10 } = req.query;
  
  const leaderboard = store.getLeaderboard({
    metric,
    limit: parseInt(limit)
  });
  
  res.json({
    metric,
    leaderboard,
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// Helper Functions
// ============================================================================

function generateCSV(report) {
  const headers = ['Date', 'Transactions', 'Revenue', 'Services', 'Avg Value'];
  const rows = report.dailyBreakdown.map(day => [
    day.date,
    day.transactions,
    day.revenue,
    day.activeServices,
    day.avgTransactionValue
  ]);
  
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

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
║         📊 x402 Analytics Dashboard v1.0.0                 ║
╠════════════════════════════════════════════════════════════╣
║  Port: ${PORT}${' '.repeat(52 - PORT.toString().length)}║
║  Network: Base                                             ║
║  Payment Receiver: ${RECEIVER_ADDRESS.slice(0, 20)}...${' '.repeat(21)}║
╠════════════════════════════════════════════════════════════╣
║  Revenue Model:                                            ║
║    • Basic Metrics (Free)                                  ║
║    • Premium Analytics: $0.05 USDC                         ║
║    • Enterprise Reports: $0.50 USDC                        ║
║    • Real-time Stream: $0.10 USDC                          ║
║    • Competitor Analysis: $0.25 USDC                       ║
╠════════════════════════════════════════════════════════════╣
║  Endpoints:                                                ║
║    GET  /status        - Health check                      ║
║    GET  /pricing       - Pricing tiers                     ║
║    GET  /dashboard     - Free dashboard                    ║
║    GET  /services      - List tracked services             ║
║    GET  /categories    - Category breakdown                ║
║    GET  /revenue       - Service revenue                   ║
║    GET  /leaderboard   - Top services                      ║
║    POST /analytics/premium   - Premium data (paid)         ║
║    POST /analytics/enterprise - Enterprise reports (paid)  ║
║    POST /ingest/transaction  - Record transaction          ║
╚════════════════════════════════════════════════════════════╝
  `);
});

export { app, store, revenueTracker };
