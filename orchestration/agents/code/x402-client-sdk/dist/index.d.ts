/**
 * x402 Client SDK
 * Official client for paying for agent services using x402 protocol
 *
 * @example
 * ```typescript
 * import { X402Client } from '@x402/client';
 *
 * const client = new X402Client({
 *   privateKey: process.env.PRIVATE_KEY,
 *   chain: 'base'
 * });
 *
 * // Pay for research
 * const result = await client.pay({
 *   serviceUrl: 'https://api.x402-research.com/research',
 *   amount: '0.001',
 *   payload: { query: 'AI trends 2024', complexity: 'standard' }
 * });
 * ```
 */
export declare const SUPPORTED_CHAINS: {
    readonly base: {
        readonly id: 8453;
        readonly name: "Base";
        readonly rpcUrl: "https://mainnet.base.org";
        readonly usdcAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
    };
    readonly ethereum: {
        readonly id: 1;
        readonly name: "Ethereum";
        readonly rpcUrl: "https://eth.llamarpc.com";
        readonly usdcAddress: "0xA0b86a33E6441b8a46a59DE4c4C5E8F5a6a7A8d0";
    };
    readonly arbitrum: {
        readonly id: 42161;
        readonly name: "Arbitrum";
        readonly rpcUrl: "https://arb1.arbitrum.io/rpc";
        readonly usdcAddress: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
    };
};
export type Chain = keyof typeof SUPPORTED_CHAINS;
export interface X402ClientConfig {
    privateKey: string;
    chain?: Chain;
    facilitatorUrl?: string;
}
export interface PaymentRequest {
    serviceUrl: string;
    amount: string;
    payload?: Record<string, any>;
    expiresIn?: number;
}
export interface PaymentResult {
    success: boolean;
    data?: any;
    error?: string;
    payment: {
        proof: string;
        amount: string;
        token: string;
        recipient?: string;
        expiresAt: number;
    };
}
export interface ServiceInfo {
    name: string;
    version: string;
    description: string;
    pricing: Array<{
        complexity: string;
        basePrice: string;
        description: string;
    }>;
    endpoints: Record<string, string>;
}
export interface WalletInfo {
    address: string;
    balance: string;
    chain: Chain;
}
/**
 * X402 Client - Main SDK class for paying for agent services
 */
export declare class X402Client {
    private wallet;
    private chain;
    private chainConfig;
    private facilitatorUrl;
    constructor(config: X402ClientConfig);
    /**
     * Get wallet address
     */
    getAddress(): string;
    /**
     * Get wallet info including balance
     */
    getWalletInfo(): Promise<WalletInfo>;
    /**
     * Get service info and pricing
     */
    getServiceInfo(serviceUrl: string): Promise<ServiceInfo>;
    /**
     * Create a payment authorization (EIP-3009)
     */
    createPayment(recipient: string, amount: string, expiresIn?: number): Promise<{
        proof: string;
        expiresAt: number;
    }>;
    /**
     * Pay for a service and get the result
     * This is the main method - one line to pay for any x402 service
     */
    pay(request: PaymentRequest): Promise<PaymentResult>;
    /**
     * Quick pay - Simplest possible API
     * Just provide URL and amount, get result
     */
    quickPay(serviceUrl: string, amount: string, payload?: Record<string, any>): Promise<any>;
}
/**
 * Service Discovery - Find available x402 services
 */
export declare class ServiceDiscovery {
    private registryUrl;
    constructor(registryUrl?: string);
    /**
     * List all registered services
     */
    listServices(): Promise<Array<{
        id: string;
        name: string;
        url: string;
        category: string;
        description: string;
        pricing: {
            min: string;
            max: string;
            currency: string;
        };
    }>>;
    /**
     * Find services by category
     */
    findByCategory(category: string): Promise<any[]>;
    /**
     * Get service details
     */
    getServiceDetails(serviceId: string): Promise<any>;
}
export default X402Client;
//# sourceMappingURL=index.d.ts.map