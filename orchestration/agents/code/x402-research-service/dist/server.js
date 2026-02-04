"use strict";
/**
 * Express Server - Main API Entry Point
 * x402 Research Service for Agent Payments
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const zod_1 = require("zod");
const ethers_1 = require("ethers");
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
const config_1 = require("./config");
const types_1 = require("./types");
const logger_1 = require("./utils/logger");
const x402_1 = require("./payment/x402");
const research_1 = require("./engine/research");
// Initialize Express app
const app = (0, express_1.default)();
// Rate limiter
const rateLimiter = new rate_limiter_flexible_1.RateLimiterMemory({
    keyPrefix: 'x402_research',
    points: config_1.config.rateLimit.maxRequests,
    duration: config_1.config.rateLimit.windowMs / 1000
});
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: '*', // Allow all origins (agents can call from anywhere)
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'x-x402-*']
}));
app.use(express_1.default.json({ limit: '1mb' }));
// Request logging
app.use((req, res, next) => {
    logger_1.logger.debug(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
    next();
});
// Rate limiting middleware
const rateLimitMiddleware = async (req, res, next) => {
    try {
        // Use IP or sender address from x402 header as key
        const key = req.headers['x-x402-payload']
            ? JSON.parse(Buffer.from(req.headers['x-x402-payload'], 'base64').toString()).sender
            : req.ip;
        await rateLimiter.consume(key);
        next();
    }
    catch (rejRes) {
        res.status(429).json({
            success: false,
            error: {
                code: 'RATE_LIMITED',
                message: 'Too many requests. Please slow down.'
            }
        });
    }
};
// Error handling middleware
const errorHandler = (err, req, res, next) => {
    logger_1.logger.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: 'An unexpected error occurred'
        }
    });
};
// Validation schemas
const ResearchRequestSchema = zod_1.z.object({
    query: zod_1.z.string().min(1).max(500),
    complexity: zod_1.z.enum(['simple', 'standard', 'deep']),
    sources: zod_1.z.array(zod_1.z.enum(['twitter', 'github', 'web', 'news', 'all'])).min(1),
    maxResults: zod_1.z.number().int().min(1).max(100).optional(),
    timeRange: zod_1.z.enum(['day', 'week', 'month', 'year', 'all']).optional(),
    filters: zod_1.z.object({
        includeReplies: zod_1.z.boolean().optional(),
        verifiedOnly: zod_1.z.boolean().optional(),
        minFollowers: zod_1.z.number().int().optional(),
        language: zod_1.z.string().optional(),
        excludeDomains: zod_1.z.array(zod_1.z.string()).optional()
    }).optional()
});
// Routes
/**
 * GET / - Service info and documentation
 */
app.get('/', (req, res) => {
    res.json({
        success: true,
        data: {
            ...config_1.SERVICE_INFO,
            pricing: types_1.PRICING_TIERS,
            endpoints: {
                info: 'GET /',
                pricing: 'GET /pricing',
                research: 'POST /research (requires x402 payment)',
                status: 'GET /status'
            }
        }
    });
});
/**
 * GET /pricing - Get pricing tiers
 */
app.get('/pricing', (req, res) => {
    res.json({
        success: true,
        data: {
            tiers: types_1.PRICING_TIERS,
            paymentAddress: config_1.config.wallet.address,
            network: 'base',
            chainId: 8453
        }
    });
});
/**
 * GET /status - Service health check
 */
app.get('/status', async (req, res) => {
    try {
        const balance = await x402_1.paymentVerifier.getBalance();
        res.json({
            success: true,
            data: {
                status: 'healthy',
                version: config_1.SERVICE_INFO.version,
                wallet: {
                    address: config_1.config.wallet.address,
                    balance: `${balance} ETH`
                },
                uptime: process.uptime(),
                timestamp: new Date().toISOString()
            }
        });
    }
    catch (error) {
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
app.post('/research', rateLimitMiddleware, async (req, res) => {
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
            });
        }
        const researchRequest = validation.data;
        // Get expected price for complexity
        const tier = types_1.PRICING_TIERS.find(t => t.complexity === researchRequest.complexity);
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
        const headers = {};
        for (const [key, value] of Object.entries(req.headers)) {
            if (typeof value === 'string') {
                headers[key] = value;
            }
        }
        const paymentResult = await x402_1.paymentVerifier.verifyPayment(headers, tier.basePrice);
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
                        recipient: config_1.config.wallet.address
                    }
                }
            });
        }
        // Payment verified - do the research!
        logger_1.logger.info(`Research request from ${paymentResult.payload?.sender}: "${researchRequest.query}"`);
        const { findings, sources, metrics } = await research_1.researchEngine.research(researchRequest);
        // Generate report
        const report = {
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
                version: config_1.SERVICE_INFO.version
            }
        };
        logger_1.logger.info(`Research completed: ${report.id} (${findings.length} findings)`);
        res.json({
            success: true,
            data: report
        });
    }
    catch (error) {
        logger_1.logger.error('Research endpoint error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'RESEARCH_FAILED',
                message: error instanceof Error ? error.message : 'Research failed'
            }
        });
    }
});
/**
 * POST /verify-payment - Verify a payment without doing research (for testing)
 */
app.post('/verify-payment', rateLimitMiddleware, async (req, res) => {
    try {
        const { expectedAmount } = req.body;
        if (!expectedAmount) {
            return res.status(400).json({
                success: false,
                error: { code: 'MISSING_AMOUNT', message: 'expectedAmount is required' }
            });
        }
        const headers = {};
        for (const [key, value] of Object.entries(req.headers)) {
            if (typeof value === 'string') {
                headers[key] = value;
            }
        }
        const result = await x402_1.paymentVerifier.verifyPayment(headers, expectedAmount);
        res.json({
            success: result.valid,
            data: result.valid ? {
                verified: true,
                sender: result.payload?.sender,
                amount: result.payload?.amount
                    ? ethers_1.ethers.formatEther(result.payload.amount)
                    : undefined,
                timestamp: result.payload?.timestamp
            } : undefined,
            error: result.error ? { code: 'VERIFICATION_FAILED', message: result.error } : undefined
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: { code: 'ERROR', message: String(error) }
        });
    }
});
// Apply error handler
app.use(errorHandler);
// Helper function to generate summary
function generateSummary(findings, query) {
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
const PORT = config_1.config.port;
app.listen(PORT, () => {
    logger_1.logger.info(`🚀 x402 Research Service running on port ${PORT}`);
    logger_1.logger.info(`💰 Payment address: ${config_1.config.wallet.address}`);
    const tierInfo = types_1.PRICING_TIERS.map((t) => `${t.complexity}=${t.basePrice}ETH`).join(', ');
    logger_1.logger.info(`📊 Pricing tiers: ${tierInfo}`);
});
// Graceful shutdown
process.on('SIGTERM', () => {
    logger_1.logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
});
process.on('SIGINT', () => {
    logger_1.logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
});
exports.default = app;
//# sourceMappingURL=server.js.map