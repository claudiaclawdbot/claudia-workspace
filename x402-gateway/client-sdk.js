/**
 * x402 Gateway Client SDK
 * 
 * Easy-to-use client for discovering and consuming x402-enabled services
 * through the x402 Service Gateway.
 * 
 * @example
 * const client = new X402GatewayClient();
 * 
 * // Discover services
 * const services = await client.discover();
 * 
 * // Use a service (handles payment automatically)
 * const report = await client.call('claudia-research', 'research', {
 *   topic: 'AI agents'
 * });
 */

class X402GatewayClient {
  constructor(options = {}) {
    this.gatewayUrl = options.gatewayUrl || 'https://x402-gateway-claudia.loca.lt';
    this.wallet = options.wallet; // Wallet instance for signing payments
    this.defaultNetwork = options.network || 'base';
  }

  /**
   * Discover all available services
   * @param {Object} filters - Optional filters (category, verified, featured)
   * @returns {Promise<Array>} List of services
   */
  async discover(filters = {}) {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.verified) params.append('verified', 'true');
    if (filters.featured) params.append('featured', 'true');
    
    const url = `${this.gatewayUrl}/services?${params}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Discovery failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.services;
  }

  /**
   * Get details for a specific service
   * @param {string} serviceId - Service identifier
   * @returns {Promise<Object>} Service details
   */
  async getService(serviceId) {
    const response = await fetch(`${this.gatewayUrl}/services/${serviceId}`);
    
    if (!response.ok) {
      throw new Error(`Service not found: ${serviceId}`);
    }
    
    return response.json();
  }

  /**
   * List service categories
   * @returns {Promise<Object>} Categories with counts
   */
  async getCategories() {
    const response = await fetch(`${this.gatewayUrl}/categories`);
    return response.json();
  }

  /**
   * Get featured services
   * @returns {Promise<Array>} Featured services
   */
  async getFeatured() {
    const response = await fetch(`${this.gatewayUrl}/featured`);
    const data = await response.json();
    return data.services;
  }

  /**
   * Call a service endpoint through the gateway
   * This will handle the x402 payment flow automatically if a wallet is provided
   * 
   * @param {string} serviceId - Service identifier
   * @param {string} endpoint - Endpoint path (e.g., 'research')
   * @param {Object} params - Request parameters
   * @param {Object} options - Call options
   * @returns {Promise<Object>} Service response
   */
  async call(serviceId, endpoint, params = {}, options = {}) {
    const url = `${this.gatewayUrl}/gateway/${serviceId}/${endpoint}`;
    
    // First request - may return 402
    const initialResponse = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    
    // If successful, return data
    if (initialResponse.ok) {
      return initialResponse.json();
    }
    
    // If 402, handle payment
    if (initialResponse.status === 402) {
      const paymentReq = await initialResponse.json();
      
      // If no wallet provided, return payment requirements
      if (!this.wallet) {
        return {
          requiresPayment: true,
          ...paymentReq
        };
      }
      
      // Otherwise, process payment and retry
      return this._handlePaymentAndRetry(url, params, paymentReq);
    }
    
    // Other errors
    throw new Error(`Service call failed: ${initialResponse.statusText}`);
  }

  /**
   * Get service pricing including gateway fees
   * @param {string} serviceId - Service identifier
   * @param {string} endpoint - Endpoint path
   * @returns {Promise<Object>} Pricing breakdown
   */
  async getPricing(serviceId, endpoint) {
    const service = await this.getService(serviceId);
    const endpointConfig = service.endpoints.find(e => 
      e.path === `/${endpoint}` || e.path === endpoint
    );
    
    if (!endpointConfig) {
      throw new Error(`Endpoint not found: ${endpoint}`);
    }
    
    const basePrice = endpointConfig.cost || 0;
    const gatewayFee = basePrice * 0.05; // 5% gateway fee
    
    return {
      service: basePrice,
      gatewayFee: gatewayFee,
      total: basePrice + gatewayFee,
      currency: endpointConfig.currency || 'USDC',
      breakdown: {
        base: basePrice,
        fee: gatewayFee,
        feePercent: '5%'
      }
    };
  }

  /**
   * Check if a service is available
   * @param {string} serviceId - Service identifier
   * @returns {Promise<boolean>} Availability status
   */
  async isAvailable(serviceId) {
    try {
      const service = await this.getService(serviceId);
      return service.stats?.uptime > 0;
    } catch {
      return false;
    }
  }

  /**
   * Search services by keyword
   * @param {string} query - Search query
   * @returns {Promise<Array>} Matching services
   */
  async search(query) {
    const services = await this.discover();
    const lowerQuery = query.toLowerCase();
    
    return services.filter(s => 
      s.name.toLowerCase().includes(lowerQuery) ||
      s.description.toLowerCase().includes(lowerQuery) ||
      s.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Compare pricing across similar services
   * @param {string} category - Category to compare
   * @returns {Promise<Array>} Services sorted by price
   */
  async comparePricing(category) {
    const services = await this.discover({ category });
    
    return services.map(s => {
      const avgPrice = s.endpoints
        ?.filter(e => e.cost > 0)
        ?.reduce((sum, e) => sum + e.cost, 0) / 
        (s.endpoints?.filter(e => e.cost > 0).length || 1);
      
      return {
        id: s.id,
        name: s.name,
        avgPrice: avgPrice || 0,
        currency: s.pricing?.currency,
        verified: s.verified
      };
    }).sort((a, b) => a.avgPrice - b.avgPrice);
  }

  /**
   * Internal: Handle payment and retry request
   * @private
   */
  async _handlePaymentAndRetry(url, params, paymentReq) {
    // This would integrate with the wallet to sign and send payment
    // For now, return payment requirements
    console.log('Payment required:', paymentReq.x402PaymentRequirements);
    
    // TODO: Implement actual payment signing when wallet integration is ready
    return {
      requiresPayment: true,
      paymentRequirements: paymentReq.x402PaymentRequirements,
      message: 'Payment signing not yet implemented in this SDK version'
    };
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = X402GatewayClient;
}

if (typeof window !== 'undefined') {
  window.X402GatewayClient = X402GatewayClient;
}

export default X402GatewayClient;
