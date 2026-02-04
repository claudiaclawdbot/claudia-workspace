/**
 * x402 Research Service Client SDK
 * Easy integration for agents wanting to purchase research
 */
import { Wallet } from 'ethers';
import { ResearchRequest, ResearchReport, PricingTier } from './types';
interface ClientConfig {
    serviceUrl: string;
    wallet: Wallet;
    timeout?: number;
}
interface ServiceInfo {
    name: string;
    version: string;
    description: string;
    paymentAddress: string;
    supportedNetworks: string[];
    pricing: PricingTier[];
}
export declare class X402ResearchClient {
    private serviceUrl;
    private wallet;
    private timeout;
    private serviceInfo?;
    constructor(config: ClientConfig);
    /**
     * Get service information and pricing
     */
    getInfo(): Promise<ServiceInfo>;
    /**
     * Get current pricing tiers
     */
    getPricing(): Promise<{
        tiers: PricingTier[];
        paymentAddress: string;
    }>;
    /**
     * Perform research with automatic payment
     */
    research(request: ResearchRequest): Promise<ResearchReport>;
    /**
     * Test payment verification without doing research
     */
    testPayment(amount: string): Promise<boolean>;
    /**
     * Get service status
     */
    getStatus(): Promise<{
        status: string;
        version: string;
        wallet: {
            address: string;
            balance: string;
        };
        uptime: number;
    }>;
}
export declare function createResearchClient(serviceUrl: string, privateKey: string, timeout?: number): X402ResearchClient;
export * from './types';
//# sourceMappingURL=client.d.ts.map