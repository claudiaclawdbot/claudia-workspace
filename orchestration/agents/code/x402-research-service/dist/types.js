"use strict";
/**
 * x402 Payment Types
 * Based on the x402 payment protocol specification
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRICING_TIERS = void 0;
exports.PRICING_TIERS = [
    {
        complexity: 'simple',
        basePrice: '0.001',
        description: 'Quick overview - Top 5-10 results from primary sources',
        features: ['Twitter scan', 'Basic web search', '1-hour delivery'],
        maxResults: 10
    },
    {
        complexity: 'standard',
        basePrice: '0.005',
        description: 'Comprehensive research - 20-30 curated findings',
        features: ['Twitter deep scan', 'GitHub analysis', 'Web research', 'News sources', '30-minute delivery'],
        maxResults: 30
    },
    {
        complexity: 'deep',
        basePrice: '0.01',
        description: 'Deep intelligence - 50+ findings with analysis',
        features: ['All sources', 'Sentiment analysis', 'Trend detection', 'Key players identified', '15-minute delivery'],
        maxResults: 50
    }
];
//# sourceMappingURL=types.js.map