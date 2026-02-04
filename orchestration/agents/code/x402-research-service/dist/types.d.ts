/**
 * x402 Payment Types
 * Based on the x402 payment protocol specification
 */
export interface X402PaymentHeader {
    'x-x402-version': string;
    'x-x402-network': string;
    'x-x402-chain-id': string;
    'x-x402-scheme': string;
    'x-x402-payload': string;
    'x-x402-signature': string;
    'x-x402-timestamp': string;
}
export interface X402Payload {
    sender: string;
    receiver: string;
    amount: string;
    token: string;
    chainId: number;
    nonce: string;
    timestamp: number;
    metadata?: Record<string, any>;
}
export interface X402Settlement {
    txHash: string;
    blockNumber: number;
    gasUsed: bigint;
    effectiveGasPrice: bigint;
    status: 'success' | 'failed';
}
export interface PaymentVerificationResult {
    valid: boolean;
    payload?: X402Payload;
    error?: string;
    settlement?: X402Settlement;
}
/**
 * Research Request Types
 */
export type ResearchComplexity = 'simple' | 'standard' | 'deep';
export interface ResearchRequest {
    query: string;
    complexity: ResearchComplexity;
    sources: ResearchSource[];
    maxResults?: number;
    timeRange?: 'day' | 'week' | 'month' | 'year' | 'all';
    filters?: ResearchFilters;
}
export type ResearchSource = 'twitter' | 'github' | 'web' | 'news' | 'all';
export interface ResearchFilters {
    includeReplies?: boolean;
    verifiedOnly?: boolean;
    minFollowers?: number;
    language?: string;
    excludeDomains?: string[];
}
/**
 * Research Report Types
 */
export interface ResearchReport {
    id: string;
    query: string;
    complexity: ResearchComplexity;
    price: string;
    createdAt: string;
    data: {
        summary: string;
        findings: ResearchFinding[];
        sources: CitedSource[];
        metrics: ReportMetrics;
    };
    metadata: {
        paymentTx: string;
        processingTime: number;
        version: string;
    };
}
export interface ResearchFinding {
    id: string;
    type: 'twitter' | 'github' | 'web' | 'news' | 'insight';
    title: string;
    content: string;
    url?: string;
    author?: string;
    timestamp?: string;
    engagement?: {
        likes?: number;
        replies?: number;
        shares?: number;
    };
    relevanceScore: number;
}
export interface CitedSource {
    id: string;
    type: ResearchSource;
    url: string;
    title: string;
    accessedAt: string;
}
export interface ReportMetrics {
    totalSources: number;
    twitterPosts: number;
    githubRepos: number;
    webPages: number;
    confidenceScore: number;
}
/**
 * Pricing Configuration
 */
export interface PricingTier {
    complexity: ResearchComplexity;
    basePrice: string;
    description: string;
    features: string[];
    maxResults: number;
}
export declare const PRICING_TIERS: PricingTier[];
/**
 * API Response Types
 */
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: ApiError;
}
export interface ApiError {
    code: string;
    message: string;
    details?: any;
}
/**
 * Service Configuration
 */
export interface ServiceConfig {
    port: number;
    environment: 'development' | 'production';
    wallet: {
        privateKey: string;
        address: string;
    };
    networks: {
        base: {
            rpcUrl: string;
            chainId: number;
            paymentContract: string;
        };
    };
    apis: {
        twitter?: {
            bearerToken: string;
            apiKey?: string;
            apiSecret?: string;
        };
        github?: {
            token?: string;
        };
        serper?: {
            apiKey: string;
        };
        openai?: {
            apiKey: string;
        };
    };
    rateLimit: {
        windowMs: number;
        maxRequests: number;
    };
}
//# sourceMappingURL=types.d.ts.map