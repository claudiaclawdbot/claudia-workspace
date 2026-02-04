/**
 * Express Server - Main API Entry Point
 * x402 Research Service for Agent Payments
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { z } from 'zod';
import { ethers } from 'ethers';
import { RateLimiterMemory } from 'rate-limiter-flexible';

import { config, SERVICE_INFO } from './config';
import { PRICING_TIERS } from './types';
import { logger } from './utils/logger';
import { paymentVerifier } from './payment/x402';
import { researchEngine } from './engine/research';
import {
  ResearchRequest,
  ResearchComplexity,
  ResearchReport,
  ApiResponse,
  ApiError,
  X402Payload,
  PricingTier
} from './types';

// Initialize Express app
const app = express();

// Rate limiter
const rateLimiter = new RateLimiterMemory({
  keyPrefix: 'x402_research',
  points: config.rateLimit.maxRequests,
  duration: config.rateLimit.windowMs / 1000
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: '*', // Allow all origins (agents can call from anywhere)
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'x-x402-*']
}));
app.use(express.json({ limit: '1mb' }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.debug(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Rate limiting middleware
const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Use IP or sender address from x402 header as key
    const key = req.headers['x-x402-payload'] 
      ? JSON.parse(Buffer.from(req.headers['x-x402-payload'] as string, 'base64').toString()).sender
      : req.ip;
    
    await rateLimiter.consume(key as string);
    next();
  } catch (rejRes) {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests. Please slow down.'
      }
    } as ApiResponse<never>);
  }
};

// Error handling middleware
const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  } as ApiResponse<never>);
};

// Validation schemas
const ResearchRequestSchema = z.object({
  query: z.string().min(1).max(500),
  complexity: z.enum(['simple', 'standard', 'deep']),
  sources: z.array(z.enum(['twitter', 'github', 'web', 'news', 'all'])).min(1),
  maxResults: z.number().int().min(1).max(100).optional(),
  timeRange: z.enum(['day', 'week', 'month', 'year', 'all']).optional(),
  filters: z.object({
    includeReplies: z.boolean().optional(),
    verifiedOnly: z.boolean().optional(),
    minFollowers: z.number().int().optional(),
    language: z.string().optional(),
    excludeDomains: z.array(z.string()).optional()
  }).optional()
});

// Routes

/**
 * GET / - Service info and documentation
 */
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      ...SERVICE_INFO,
      pricing: PRICING_TIERS,
      endpoints: {
        info: 'GET /',
        pricing: 'GET /pricing',
        research: 'POST /research (requires x402 payment)',
        status: 'GET /status'
      }
    }
  } as ApiResponse<typeof SERVICE_INFO>);
});

/**
 * GET /pricing - Get pricing tiers
 */
app.get('/pricing', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      tiers: PRICING_TIERS,
      paymentAddress: config.wallet.address,
      network: 'base',
      chainId: 8453
    }
  });
});

/**
 * GET /status - Service health check
 */
app.get('/status', async (req: Request, res: Response) => {
  try {
    const balance = await paymentVerifier.getBalance();
    res.json({
      success: true,
      data: {
        status: 'healthy',
        version: SERVICE_INFO.version,
        wallet: {
          address: config.wallet.address,
          balance: `${balance} ETH`
        },
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Service temporarily unavailable'
      }
    });
  }
});

/**
 * POST /research - Main research endpoint (requires x402 payment)
 */
app.post('/research', rateLimitMiddleware, async (req: Request, res: Response) => {
  const startTime = Date.now();

  try {
    // Validate request body
    const validation = ResearchRequestSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'Invalid research request',
          details: validation.error.errors
        }
      } as ApiResponse<never>);
    }

    const researchRequest: ResearchRequest = validation.data;

    // Get expected price for complexity
    const tier = PRICING_TIERS.find(t => t.complexity === researchRequest.complexity);
    if (!tier) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_COMPLEXITY',
          message: 'Invalid complexity tier'
        }
      });
    }

    // Verify x402 payment
    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === 'string') {
        headers[key] = value;
      }
    }
    const paymentResult = await paymentVerifier.verifyPayment(headers, tier.basePrice);
    if (!paymentResult.valid) {
      return res.status(402).json({
        success: false,
        error: {
          code: 'PAYMENT_REQUIRED',
          message: paymentResult.error || 'Payment verification failed',
          details: {
            expectedAmount: tier.basePrice,
            currency: 'ETH',
            network: 'base',
            recipient: config.wallet.address
          }
        }
      } as ApiResponse<never>);
    }

    // Payment verified - do the research!
    logger.info(`Research request from ${paymentResult.payload?.sender}: "${researchRequest.query}"`);

    const { findings, sources, metrics } = await researchEngine.research(researchRequest);

    // Generate report
    const report: ResearchReport = {
      id: `rpt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      query: researchRequest.query,
      complexity: researchRequest.complexity,
      price: tier.basePrice,
      createdAt: new Date().toISOString(),
      data: {
        summary: generateSummary(findings, researchRequest.query),
        findings,
        sources,
        metrics
      },
      metadata: {
        paymentTx: 'pending', // Would be populated if on-chain settlement
        processingTime: Date.now() - startTime,
        version: SERVICE_INFO.version
      }
    };

    logger.info(`Research completed: ${report.id} (${findings.length} findings)`);

    res.json({
      success: true,
      data: report
    });

  } catch (error) {
    logger.error('Research endpoint error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'RESEARCH_FAILED',
        message: error instanceof Error ? error.message : 'Research failed'
      }
    } as ApiResponse<never>);
  }
});

/**
 * POST /verify-payment - Verify a payment without doing research (for testing)
 */
app.post('/verify-payment', rateLimitMiddleware, async (req: Request, res: Response) => {
  try {
    const { expectedAmount } = req.body;
    if (!expectedAmount) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_AMOUNT', message: 'expectedAmount is required' }
      });
    }

    const headers: Record<string, string> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === 'string') {
        headers[key] = value;
      }
    }
    const result = await paymentVerifier.verifyPayment(headers, expectedAmount);
    
    res.json({
      success: result.valid,
      data: result.valid ? {
        verified: true,
        sender: result.payload?.sender,
        amount: result.payload?.amount 
          ? ethers.formatEther(result.payload.amount) 
          : undefined,
        timestamp: result.payload?.timestamp
      } : undefined,
      error: result.error ? { code: 'VERIFICATION_FAILED', message: result.error } : undefined
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: 'ERROR', message: String(error) }
    });
  }
});

// Apply error handler
app.use(errorHandler);

// Helper function to generate summary
function generateSummary(findings: any[], query: string): string {
  const types = new Set(findings.map(f => f.type));
  const typeList = Array.from(types).join(', ');
  
  if (findings.length === 0) {
    return `No results found for "${query}". Try broadening your search or checking different sources.`;
  }

  const topFinding = findings[0];
  return `Found ${findings.length} relevant items from ${typeList} sources for "${query}". ` +
         `Top result: ${topFinding.title}${topFinding.author ? ` by ${topFinding.author}` : ''}. ` +
         `Confidence score based on source diversity and relevance.`;
}

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`🚀 x402 Research Service running on port ${PORT}`);
  logger.info(`💰 Payment address: ${config.wallet.address}`);
  const tierInfo = PRICING_TIERS.map((t: PricingTier) => `${t.complexity}=${t.basePrice}ETH`).join(', ');
  logger.info(`📊 Pricing tiers: ${tierInfo}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

export default app;
