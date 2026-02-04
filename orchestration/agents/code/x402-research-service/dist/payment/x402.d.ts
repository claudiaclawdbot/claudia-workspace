/**
 * x402 Payment Verification Module
 * Handles payment header parsing, signature verification, and settlement
 */
import { X402Payload, PaymentVerificationResult, X402Settlement } from '../types';
declare class PaymentVerifier {
    private provider;
    private wallet;
    private processedNonces;
    constructor();
    /**
     * Parse and validate x402 payment headers
     */
    parsePaymentHeader(headers: Record<string, string>): X402Payload | null;
    /**
     * Verify payment signature
     */
    verifySignature(payload: X402Payload, signature: string | undefined): Promise<boolean>;
    /**
     * Check for replay attacks (nonce already used)
     */
    isNonceUsed(nonce: string): boolean;
    /**
     * Mark nonce as used
     */
    markNonceUsed(nonce: string): void;
    /**
     * Verify token is supported (ETH/wETH/USDC on Base)
     */
    isSupportedToken(tokenAddress: string): boolean;
    /**
     * Verify payment amount matches expected price
     */
    verifyAmount(amount: string, expectedEth: string): boolean;
    /**
     * Full payment verification flow
     */
    verifyPayment(headers: Record<string, string>, expectedAmount: string): Promise<PaymentVerificationResult>;
    /**
     * Settle payment on-chain (for non-ETH tokens or contract-based settlement)
     * For simple ETH transfers, we verify the tx exists on-chain
     */
    settlePayment(payload: X402Payload, txHash: string): Promise<X402Settlement>;
    /**
     * Get wallet balance
     */
    getBalance(): Promise<string>;
    /**
     * Get service wallet address
     */
    getServiceAddress(): string;
}
export declare const paymentVerifier: PaymentVerifier;
export {};
//# sourceMappingURL=x402.d.ts.map