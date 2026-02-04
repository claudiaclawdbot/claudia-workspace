"use strict";
/**
 * x402 Payment Verification Module
 * Handles payment header parsing, signature verification, and settlement
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentVerifier = void 0;
const ethers_1 = require("ethers");
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
// EIP-712 Domain for x402
const X402_DOMAIN = {
    name: 'x402 Payment Protocol',
    version: '1',
    chainId: config_1.BASE_CHAIN_ID,
    verifyingContract: config_1.config.networks.base.paymentContract
};
// EIP-712 Types for x402 payment
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
class PaymentVerifier {
    provider;
    wallet;
    processedNonces = new Set();
    constructor() {
        this.provider = new ethers_1.ethers.JsonRpcProvider(config_1.config.networks.base.rpcUrl);
        this.wallet = new ethers_1.ethers.Wallet(config_1.config.wallet.privateKey, this.provider);
    }
    /**
     * Parse and validate x402 payment headers
     */
    parsePaymentHeader(headers) {
        try {
            const payloadBase64 = headers['x-x402-payload'];
            if (!payloadBase64) {
                logger_1.logger.warn('Missing x-x402-payload header');
                return null;
            }
            const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
            const payload = JSON.parse(payloadJson);
            // Validate required fields
            if (!payload.sender || !payload.receiver || !payload.amount || !payload.token) {
                logger_1.logger.warn('Invalid payload structure');
                return null;
            }
            // Validate chain ID
            if (payload.chainId !== config_1.BASE_CHAIN_ID) {
                logger_1.logger.warn(`Invalid chain ID: ${payload.chainId}, expected: ${config_1.BASE_CHAIN_ID}`);
                return null;
            }
            // Validate receiver is our address
            if (payload.receiver.toLowerCase() !== config_1.config.wallet.address.toLowerCase()) {
                logger_1.logger.warn(`Invalid receiver: ${payload.receiver}`);
                return null;
            }
            // Check timestamp (5 minute window)
            const now = Math.floor(Date.now() / 1000);
            if (Math.abs(now - payload.timestamp) > 300) {
                logger_1.logger.warn('Payment timestamp expired');
                return null;
            }
            return payload;
        }
        catch (error) {
            logger_1.logger.error('Failed to parse payment header:', error);
            return null;
        }
    }
    /**
     * Verify payment signature
     */
    async verifySignature(payload, signature) {
        if (!signature)
            return false;
        try {
            // Reconstruct the message hash using EIP-712
            const message = {
                sender: payload.sender,
                receiver: payload.receiver,
                amount: payload.amount,
                token: payload.token,
                chainId: payload.chainId,
                nonce: payload.nonce,
                timestamp: payload.timestamp,
                metadata: ethers_1.ethers.toUtf8Bytes(JSON.stringify(payload.metadata || {}))
            };
            const recoveredAddress = ethers_1.ethers.verifyTypedData(X402_DOMAIN, X402_TYPES, message, signature);
            const valid = recoveredAddress.toLowerCase() === payload.sender.toLowerCase();
            if (!valid) {
                logger_1.logger.warn(`Signature verification failed. Recovered: ${recoveredAddress}, Expected: ${payload.sender}`);
            }
            return valid;
        }
        catch (error) {
            logger_1.logger.error('Signature verification error:', error);
            return false;
        }
    }
    /**
     * Check for replay attacks (nonce already used)
     */
    isNonceUsed(nonce) {
        return this.processedNonces.has(nonce);
    }
    /**
     * Mark nonce as used
     */
    markNonceUsed(nonce) {
        this.processedNonces.add(nonce);
        // Keep set size manageable (keep last 10000)
        if (this.processedNonces.size > 10000) {
            const iterator = this.processedNonces.values();
            for (let i = 0; i < 1000; i++) {
                const value = iterator.next().value;
                if (value)
                    this.processedNonces.delete(value);
            }
        }
    }
    /**
     * Verify token is supported (ETH/wETH/USDC on Base)
     */
    isSupportedToken(tokenAddress) {
        const supportedTokens = [
            '0x0000000000000000000000000000000000000000', // ETH
            '0x4200000000000000000000000000000000000006', // wETH on Base
            '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
        ].map(t => t.toLowerCase());
        return supportedTokens.includes(tokenAddress.toLowerCase());
    }
    /**
     * Verify payment amount matches expected price
     */
    verifyAmount(amount, expectedEth) {
        try {
            const paymentWei = BigInt(amount);
            const expectedWei = ethers_1.ethers.parseEther(expectedEth);
            // Allow 1% tolerance for fees/rounding
            const tolerance = expectedWei / 100n;
            const diff = paymentWei > expectedWei ? paymentWei - expectedWei : expectedWei - paymentWei;
            return diff <= tolerance;
        }
        catch (error) {
            logger_1.logger.error('Amount verification error:', error);
            return false;
        }
    }
    /**
     * Full payment verification flow
     */
    async verifyPayment(headers, expectedAmount) {
        // Parse payload
        const payload = this.parsePaymentHeader(headers);
        if (!payload) {
            return { valid: false, error: 'Invalid or missing payment headers' };
        }
        // Check nonce
        if (this.isNonceUsed(payload.nonce)) {
            return { valid: false, error: 'Payment nonce already used (replay attack)' };
        }
        // Verify signature
        const signature = headers['x-x402-signature'];
        if (!signature) {
            return { valid: false, error: 'Missing payment signature' };
        }
        const signatureValid = await this.verifySignature(payload, signature);
        if (!signatureValid) {
            return { valid: false, error: 'Invalid payment signature' };
        }
        // Verify token
        if (!this.isSupportedToken(payload.token)) {
            return { valid: false, error: 'Unsupported payment token' };
        }
        // Verify amount
        if (!this.verifyAmount(payload.amount, expectedAmount)) {
            return { valid: false, error: `Payment amount mismatch. Expected: ${expectedAmount} ETH` };
        }
        // Mark nonce as used
        this.markNonceUsed(payload.nonce);
        logger_1.logger.info(`Payment verified: ${payload.sender} -> ${ethers_1.ethers.formatEther(payload.amount)} ETH`);
        return { valid: true, payload };
    }
    /**
     * Settle payment on-chain (for non-ETH tokens or contract-based settlement)
     * For simple ETH transfers, we verify the tx exists on-chain
     */
    async settlePayment(payload, txHash) {
        try {
            // Wait for transaction receipt
            const receipt = await this.provider.waitForTransaction(txHash, 1, 60000);
            if (!receipt) {
                throw new Error('Transaction not found');
            }
            const settlement = {
                txHash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed,
                effectiveGasPrice: BigInt(0), // Not available in ethers v6 receipt, using 0
                status: receipt.status === 1 ? 'success' : 'failed'
            };
            logger_1.logger.info(`Payment settled: ${txHash} (block ${receipt.blockNumber})`);
            return settlement;
        }
        catch (error) {
            logger_1.logger.error('Settlement failed:', error);
            throw error;
        }
    }
    /**
     * Get wallet balance
     */
    async getBalance() {
        const balance = await this.provider.getBalance(config_1.config.wallet.address);
        return ethers_1.ethers.formatEther(balance);
    }
    /**
     * Get service wallet address
     */
    getServiceAddress() {
        return config_1.config.wallet.address;
    }
}
exports.paymentVerifier = new PaymentVerifier();
//# sourceMappingURL=x402.js.map