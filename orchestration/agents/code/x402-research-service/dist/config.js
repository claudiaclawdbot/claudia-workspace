"use strict";
/**
 * Configuration Module
 * Loads and validates environment configuration
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SERVICE_INFO = exports.X402_VERSION = exports.BASE_CHAIN_ID = exports.ETH_DECIMALS = exports.PRICING_TIERS = exports.config = void 0;
const dotenv = __importStar(require("dotenv"));
const ethers_1 = require("ethers");
dotenv.config();
// Default x402 Payment Contract on Base (placeholder - update with actual)
const X402_PAYMENT_CONTRACT = process.env.X402_CONTRACT || '0x0000000000000000000000000000000000000000';
function validateConfig() {
    const required = [
        'WALLET_PRIVATE_KEY',
        'BASE_RPC_URL',
        'SERPER_API_KEY',
        'OPENAI_API_KEY'
    ];
    const missing = required.filter(key => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    const privateKey = process.env.WALLET_PRIVATE_KEY;
    let walletAddress;
    try {
        const wallet = new ethers_1.ethers.Wallet(privateKey);
        walletAddress = wallet.address;
    }
    catch (error) {
        throw new Error('Invalid WALLET_PRIVATE_KEY format');
    }
    return {
        port: parseInt(process.env.PORT || '4020', 10),
        environment: process.env.NODE_ENV || 'development',
        wallet: {
            privateKey,
            address: walletAddress
        },
        networks: {
            base: {
                rpcUrl: process.env.BASE_RPC_URL,
                chainId: 8453,
                paymentContract: X402_PAYMENT_CONTRACT
            }
        },
        apis: {
            twitter: process.env.TWITTER_BEARER_TOKEN ? {
                bearerToken: process.env.TWITTER_BEARER_TOKEN,
                apiKey: process.env.TWITTER_API_KEY,
                apiSecret: process.env.TWITTER_API_SECRET
            } : undefined,
            github: process.env.GITHUB_TOKEN ? {
                token: process.env.GITHUB_TOKEN
            } : undefined,
            serper: {
                apiKey: process.env.SERPER_API_KEY
            },
            openai: {
                apiKey: process.env.OPENAI_API_KEY
            }
        },
        rateLimit: {
            windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
            maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '30', 10)
        }
    };
}
exports.config = validateConfig();
// Re-export pricing tiers from types
var types_1 = require("./types");
Object.defineProperty(exports, "PRICING_TIERS", { enumerable: true, get: function () { return types_1.PRICING_TIERS; } });
// Pricing constants
exports.ETH_DECIMALS = 18;
exports.BASE_CHAIN_ID = 8453;
exports.X402_VERSION = '1.0.0';
// Service metadata
exports.SERVICE_INFO = {
    name: 'x402 Research Service',
    version: '1.0.0',
    description: 'AI-powered intelligence reports for agents',
    paymentAddress: exports.config.wallet.address,
    supportedNetworks: ['base'],
    documentation: 'https://github.com/ultimatecodemaster/x402-research-service'
};
//# sourceMappingURL=config.js.map