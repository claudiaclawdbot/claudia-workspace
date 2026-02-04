"use strict";
/**
 * x402 Research Service Client SDK
 * Easy integration for agents wanting to purchase research
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.X402ResearchClient = void 0;
exports.createResearchClient = createResearchClient;
const ethers_1 = require("ethers");
// EIP-712 Domain for x402
const getX402Domain = (chainId, verifyingContract) => ({
    name: 'x402 Payment Protocol',
    version: '1',
    chainId,
    verifyingContract
});
const X402_TYPES = {
    Payment: [
        { name: 'sender', type: 'address' },
        { name: 'receiver', type: 'address' },
        { name: 'amount', type: 'uint256' },
        { name: 'token', type: 'address' },
        { name: 'chainId', type: 'uint256' },
        { name: 'nonce', type: 'bytes32' },
        { name: 'timestamp', type: 'uint256' },
        { name: 'metadata', type: 'bytes' }
    ]
};
class X402ResearchClient {
    serviceUrl;
    wallet;
    timeout;
    serviceInfo;
    constructor(config) {
        this.serviceUrl = config.serviceUrl.replace(/\/$/, '');
        this.wallet = config.wallet;
        this.timeout = config.timeout || 30000;
    }
    /**
     * Get service information and pricing
     */
    async getInfo() {
        const response = await fetch(`${this.serviceUrl}/`);
        const data = await response.json();
        if (!data.success || !data.data) {
            throw new Error(data.error?.message || 'Failed to get service info');
        }
        this.serviceInfo = data.data;
        return data.data;
    }
    /**
     * Get current pricing tiers
     */
    async getPricing() {
        const response = await fetch(`${this.serviceUrl}/pricing`);
        const data = await response.json();
        if (!data.success || !data.data) {
            throw new Error(data.error?.message || 'Failed to get pricing');
        }
        return data.data;
    }
    /**
     * Perform research with automatic payment
     */
    async research(request) {
        // Get pricing if we don't have it cached
        if (!this.serviceInfo) {
            await this.getInfo();
        }
        // Find pricing tier
        const tier = this.serviceInfo?.pricing.find(t => t.complexity === request.complexity);
        if (!tier) {
            throw new Error(`Unknown complexity tier: ${request.complexity}`);
        }
        // Create payment payload
        const paymentAddress = this.serviceInfo?.paymentAddress;
        if (!paymentAddress) {
            throw new Error('Service payment address not available');
        }
        const payload = {
            sender: this.wallet.address,
            receiver: paymentAddress,
            amount: ethers_1.ethers.parseEther(tier.basePrice).toString(),
            token: '0x0000000000000000000000000000000000000000', // ETH
            chainId: 8453, // Base
            nonce: ethers_1.ethers.hexlify(ethers_1.ethers.randomBytes(32)),
            timestamp: Math.floor(Date.now() / 1000),
            metadata: {
                query: request.query,
                complexity: request.complexity
            }
        };
        // Sign payment
        const domain = getX402Domain(8453, '0x0000000000000000000000000000000000000000');
        const message = {
            ...payload,
            metadata: ethers_1.ethers.toUtf8Bytes(JSON.stringify(payload.metadata))
        };
        const signature = await this.wallet.signTypedData(domain, X402_TYPES, message);
        // Make request with payment headers
        const headers = {
            'Content-Type': 'application/json',
            'x-x402-version': '1.0.0',
            'x-x402-network': 'base',
            'x-x402-chain-id': '8453',
            'x-x402-scheme': 'eip712',
            'x-x402-payload': Buffer.from(JSON.stringify(payload)).toString('base64'),
            'x-x402-signature': signature,
            'x-x402-timestamp': payload.timestamp.toString()
        };
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        try {
            const response = await fetch(`${this.serviceUrl}/research`, {
                method: 'POST',
                headers,
                body: JSON.stringify(request),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            const data = await response.json();
            if (!data.success) {
                throw new Error(data.error?.message || 'Research request failed');
            }
            if (!data.data) {
                throw new Error('No data returned');
            }
            return data.data;
        }
        catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error('Request timed out');
            }
            throw error;
        }
    }
    /**
     * Test payment verification without doing research
     */
    async testPayment(amount) {
        const pricing = await this.getPricing();
        const payload = {
            sender: this.wallet.address,
            receiver: pricing.paymentAddress,
            amount: ethers_1.ethers.parseEther(amount).toString(),
            token: '0x0000000000000000000000000000000000000000',
            chainId: 8453,
            nonce: ethers_1.ethers.hexlify(ethers_1.ethers.randomBytes(32)),
            timestamp: Math.floor(Date.now() / 1000),
            metadata: {}
        };
        const domain = getX402Domain(8453, '0x0000000000000000000000000000000000000000');
        const message = {
            ...payload,
            metadata: ethers_1.ethers.toUtf8Bytes(JSON.stringify(payload.metadata))
        };
        const signature = await this.wallet.signTypedData(domain, X402_TYPES, message);
        const response = await fetch(`${this.serviceUrl}/verify-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-x402-version': '1.0.0',
                'x-x402-network': 'base',
                'x-x402-chain-id': '8453',
                'x-x402-scheme': 'eip712',
                'x-x402-payload': Buffer.from(JSON.stringify(payload)).toString('base64'),
                'x-x402-signature': signature,
                'x-x402-timestamp': payload.timestamp.toString()
            },
            body: JSON.stringify({ expectedAmount: amount })
        });
        const data = await response.json();
        return data.success && data.data?.verified === true;
    }
    /**
     * Get service status
     */
    async getStatus() {
        const response = await fetch(`${this.serviceUrl}/status`);
        const data = await response.json();
        if (!data.success || !data.data) {
            throw new Error(data.error?.message || 'Failed to get status');
        }
        return data.data;
    }
}
exports.X402ResearchClient = X402ResearchClient;
// Export factory function for convenience
function createResearchClient(serviceUrl, privateKey, timeout) {
    const wallet = new ethers_1.Wallet(privateKey);
    return new X402ResearchClient({ serviceUrl, wallet, timeout });
}
// Re-export types
__exportStar(require("./types"), exports);
//# sourceMappingURL=client.js.map