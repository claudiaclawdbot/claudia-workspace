/**
 * Service Registry
 * 
 * Manages the in-memory storage of registered services.
 * In production, this would use a database (PostgreSQL, Redis, etc.)
 */

import crypto from 'crypto';

export class ServiceRegistry {
  constructor() {
    // In-memory storage (use database in production)
    this.services = new Map();
    this.categories = new Map();
    
    // Pre-populate with known x402 services
    this.seedKnownServices();
  }

  /**
   * Seed with known x402 services from the ecosystem
   */
  seedKnownServices() {
    const knownServices = [
      {
        id: 'x402-research-v1',
        name: 'x402 Research Service',
        description: 'AI-powered research and intelligence reports. Twitter, GitHub, Web sources.',
        category: 'research',
        url: 'https://geek-minor-orders-tony.trycloudflare.com',
        pricing: {
          type: 'tiered',
          currency: 'ETH',
          tiers: [
            { name: 'Simple', price: '0.001', description: '5-10 results' },
            { name: 'Standard', price: '0.005', description: '20-30 results' },
            { name: 'Deep', price: '0.01', description: '50+ results with analysis' }
          ]
        },
        endpoints: {
          status: '/status',
          pricing: '/pricing',
          research: '/research'
        },
        tags: ['research', 'ai', 'intelligence', 'twitter', 'github'],
        verified: true,
        featured: true,
        registeredAt: new Date('2026-02-01').toISOString()
      },
      {
        id: 'x402-crypto-v1',
        name: 'x402 Crypto Price Service',
        description: 'Real-time cryptocurrency prices and market data from CoinGecko.',
        category: 'data',
        url: 'https://x402-crypto-claudia.loca.lt',
        pricing: {
          type: 'per_request',
          currency: 'USDC',
          rates: [
            { endpoint: '/price/:coin', price: '0.01', description: 'Single coin price' },
            { endpoint: '/prices', price: '0.05', description: 'Batch prices' },
            { endpoint: '/prices/all', price: '0.05', description: 'All coins' }
          ]
        },
        endpoints: {
          status: '/status',
          coins: '/coins',
          price: '/price/:coin',
          prices: '/prices',
          allPrices: '/prices/all'
        },
        tags: ['crypto', 'prices', 'market-data', 'bitcoin', 'ethereum'],
        verified: true,
        featured: true,
        registeredAt: new Date('2026-02-01').toISOString()
      },
      {
        id: 'x402-directory-v1',
        name: 'x402 Service Directory',
        description: 'Discovery and registry service for x402-enabled agent services.',
        category: 'directory',
        url: process.env.SELF_URL || 'http://localhost:3003',
        pricing: {
          type: 'mixed',
          currency: 'USDC',
          free: ['list', 'search', 'view'],
          paid: [
            { action: 'register', price: '1.00' },
            { action: 'feature', price: '5.00' },
            { action: 'premium-search', price: '0.01' }
          ]
        },
        endpoints: {
          status: '/status',
          pricing: '/pricing',
          services: '/services',
          search: '/search',
          register: '/register'
        },
        tags: ['directory', 'discovery', 'registry', 'x402'],
        verified: true,
        featured: true,
        registeredAt: new Date('2026-02-02').toISOString()
      },
      {
        id: 'agent-intelligence-suite-v1',
        name: 'Agent Intelligence Suite',
        description: 'Bundled research + crypto intelligence service. Combines deep research capabilities with real-time cryptocurrency market data. Built for autonomous agents.',
        category: 'bundle',
        url: 'https://intelligence-suite-claudia.loca.lt',
        pricing: {
          type: 'tiered',
          currency: 'USDC',
          tiers: [
            { name: 'Basic', price: '0.05', description: 'Research + single coin price' },
            { name: 'Pro', price: '0.15', description: 'Deep research + batch prices + analysis' },
            { name: 'Enterprise', price: 'custom', description: 'Custom integration and support' }
          ]
        },
        endpoints: {
          status: '/status',
          pricing: '/pricing',
          compare: '/compare',
          basic: '/intelligence/basic',
          pro: '/intelligence/pro',
          enterprise: '/intelligence/enterprise'
        },
        documentation: 'https://github.com/claudia/x402-intelligence-suite',
        agentCard: 'https://geek-minor-orders-tony.trycloudflare.com/.well-known/agent-card.json',
        tags: ['bundle', 'research', 'crypto', 'intelligence', 'trading', 'agents'],
        capabilities: {
          a2a: true,
          x402: true,
          erc8004: 'pending'
        },
        verified: true,
        featured: true,
        registeredAt: new Date('2026-02-02').toISOString()
      }
    ];

    for (const service of knownServices) {
      this.services.set(service.id, {
        ...service,
        rating: 5.0,
        totalCalls: 0,
        uptime: 100,
        lastSeen: new Date().toISOString(),
        owner: '0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055'
      });
      this.updateCategoryCount(service.category);
    }
  }

  /**
   * Register a new service
   */
  registerService(serviceData) {
    const id = `svc-${crypto.randomBytes(8).toString('hex')}`;
    
    const service = {
      id,
      name: serviceData.name,
      description: serviceData.description,
      url: serviceData.url,
      category: serviceData.category.toLowerCase(),
      pricing: serviceData.pricing,
      endpoints: serviceData.endpoints || {},
      tags: serviceData.tags || [],
      documentation: serviceData.documentation || null,
      verified: false,
      featured: false,
      rating: 0,
      totalCalls: 0,
      uptime: 100,
      registeredAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      featuredUntil: null,
      featuredBy: null,
      owner: serviceData.owner
    };

    this.services.set(id, service);
    this.updateCategoryCount(service.category);

    return service;
  }

  /**
   * Get a service by ID
   */
  getService(id) {
    return this.services.get(id);
  }

  /**
   * Find service by URL
   */
  findByUrl(url) {
    for (const service of this.services.values()) {
      if (service.url === url) {
        return service;
      }
    }
    return null;
  }

  /**
   * List services with filtering and sorting
   */
  listServices(options = {}) {
    let services = Array.from(this.services.values());

    // Filter by category
    if (options.category) {
      services = services.filter(s => 
        s.category === options.category.toLowerCase()
      );
    }

    // Sort
    switch (options.sort) {
      case 'newest':
        services.sort((a, b) => new Date(b.registeredAt) - new Date(a.registeredAt));
        break;
      case 'oldest':
        services.sort((a, b) => new Date(a.registeredAt) - new Date(b.registeredAt));
        break;
      case 'rating':
        services.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
        services.sort((a, b) => b.totalCalls - a.totalCalls);
        break;
      case 'name':
        services.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Default: featured first, then by rating
        services.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return b.rating - a.rating;
        });
    }

    // Limit results
    if (options.limit) {
      services = services.slice(0, options.limit);
    }

    return services;
  }

  /**
   * Basic search
   */
  searchServices(query, options = {}) {
    const q = query.toLowerCase();
    let results = [];

    for (const service of this.services.values()) {
      let score = 0;

      // Check name
      if (service.name.toLowerCase().includes(q)) {
        score += 10;
        if (service.name.toLowerCase() === q) score += 5;
      }

      // Check description
      if (service.description.toLowerCase().includes(q)) {
        score += 5;
      }

      // Check tags
      for (const tag of service.tags) {
        if (tag.toLowerCase().includes(q)) {
          score += 3;
        }
      }

      // Check category
      if (service.category === q) {
        score += 8;
      }

      // Check endpoints
      for (const endpoint of Object.values(service.endpoints)) {
        if (endpoint.toLowerCase().includes(q)) {
          score += 2;
        }
      }

      if (score > 0) {
        results.push({ service, score });
      }
    }

    // Filter by category if specified
    if (options.category) {
      results = results.filter(r => 
        r.service.category === options.category.toLowerCase()
      );
    }

    // Sort by relevance score
    results.sort((a, b) => b.score - a.score);

    return results.map(r => r.service);
  }

  /**
   * Advanced search with filters and analytics
   */
  advancedSearch(query, options = {}) {
    let services = this.searchServices(query);

    // Apply filters
    if (options.filters) {
      const { verified, featured, minRating, category, priceRange } = options.filters;

      if (verified !== undefined) {
        services = services.filter(s => s.verified === verified);
      }

      if (featured !== undefined) {
        services = services.filter(s => s.featured === featured);
      }

      if (minRating !== undefined) {
        services = services.filter(s => s.rating >= minRating);
      }

      if (category) {
        services = services.filter(s => s.category === category.toLowerCase());
      }

      if (priceRange) {
        services = services.filter(s => {
          // Price filtering logic based on service pricing model
          return true; // Simplified
        });
      }
    }

    // Generate analytics
    const analytics = options.includeAnalytics ? {
      categoryDistribution: this.getCategoryDistribution(services),
      averageRating: this.calculateAverageRating(services),
      priceDistribution: this.getPriceDistribution(services),
      totalServices: services.length,
      verifiedCount: services.filter(s => s.verified).length,
      featuredCount: services.filter(s => s.featured).length
    } : null;

    return {
      services: services.map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
        category: s.category,
        url: s.url,
        pricing: s.pricing,
        verified: s.verified,
        featured: s.featured,
        rating: s.rating,
        totalCalls: s.totalCalls,
        matchScore: this.calculateMatchScore(s, query)
      })),
      analytics,
      total: services.length
    };
  }

  /**
   * Calculate match score for analytics
   */
  calculateMatchScore(service, query) {
    const q = query.toLowerCase();
    let score = 0;
    
    if (service.name.toLowerCase().includes(q)) score += 0.4;
    if (service.description.toLowerCase().includes(q)) score += 0.3;
    if (service.category === q) score += 0.2;
    
    return Math.min(1, score);
  }

  /**
   * Update a service
   */
  updateService(id, updates) {
    const service = this.services.get(id);
    if (!service) return null;

    const allowedFields = ['name', 'description', 'pricing', 'endpoints', 'tags', 'documentation'];
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        service[field] = updates[field];
      }
    }

    service.updatedAt = new Date().toISOString();
    this.services.set(id, service);

    return service;
  }

  /**
   * Feature a service
   */
  featureService(id, options) {
    const service = this.services.get(id);
    if (!service) return null;

    service.featured = true;
    service.featuredUntil = options.expiresAt.toISOString();
    service.featuredBy = options.featuredBy;
    
    this.services.set(id, service);
    return service;
  }

  /**
   * Delete a service
   */
  deleteService(id) {
    const service = this.services.get(id);
    if (!service) return false;

    this.services.delete(id);
    this.updateCategoryCount(service.category, -1);
    return true;
  }

  /**
   * Update service health status
   */
  updateServiceHealth(id, health) {
    const service = this.services.get(id);
    if (!service) return null;

    service.lastSeen = health.lastSeen;
    if (health.status === 'healthy') {
      service.uptime = Math.min(100, service.uptime + 0.1);
    } else {
      service.uptime = Math.max(0, service.uptime - 1);
    }

    this.services.set(id, service);
    return service;
  }

  /**
   * Get categories with counts
   */
  getCategories() {
    return Array.from(this.categories.entries()).map(([name, count]) => ({
      name,
      count
    }));
  }

  /**
   * Update category count
   */
  updateCategoryCount(category, delta = 1) {
    const current = this.categories.get(category) || 0;
    this.categories.set(category, current + delta);
  }

  /**
   * Get basic stats
   */
  getStats() {
    const services = Array.from(this.services.values());
    return {
      totalServices: services.length,
      totalCategories: this.categories.size,
      verifiedServices: services.filter(s => s.verified).length,
      featuredServices: services.filter(s => s.featured).length,
      avgUptime: services.reduce((acc, s) => acc + s.uptime, 0) / services.length
    };
  }

  /**
   * Get detailed stats
   */
  getDetailedStats() {
    const services = Array.from(this.services.values());
    
    return {
      overview: {
        totalServices: services.length,
        totalCategories: this.categories.size,
        verifiedServices: services.filter(s => s.verified).length,
        featuredServices: services.filter(s => s.featured).length,
        newThisWeek: services.filter(s => {
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return new Date(s.registeredAt) > weekAgo;
        }).length
      },
      categories: this.getCategoryDistribution(services),
      pricing: {
        freeServices: services.filter(s => s.pricing?.type === 'free').length,
        paidServices: services.filter(s => s.pricing?.type !== 'free').length,
        averagePrice: this.calculateAveragePrice(services)
      },
      quality: {
        averageRating: this.calculateAverageRating(services),
        averageUptime: services.reduce((acc, s) => acc + s.uptime, 0) / services.length
      },
      activity: {
        totalCalls: services.reduce((acc, s) => acc + s.totalCalls, 0),
        mostActive: services
          .sort((a, b) => b.totalCalls - a.totalCalls)
          .slice(0, 5)
          .map(s => ({ id: s.id, name: s.name, calls: s.totalCalls }))
      }
    };
  }

  /**
   * Get category distribution
   */
  getCategoryDistribution(services) {
    const distribution = {};
    for (const service of services) {
      distribution[service.category] = (distribution[service.category] || 0) + 1;
    }
    return distribution;
  }

  /**
   * Calculate average rating
   */
  calculateAverageRating(services) {
    if (services.length === 0) return 0;
    const rated = services.filter(s => s.rating > 0);
    if (rated.length === 0) return 0;
    return rated.reduce((acc, s) => acc + s.rating, 0) / rated.length;
  }

  /**
   * Get price distribution
   */
  getPriceDistribution(services) {
    const distribution = {
      free: 0,
      under_1: 0,
      under_5: 0,
      under_10: 0,
      over_10: 0
    };

    for (const service of services) {
      if (service.pricing?.type === 'free') {
        distribution.free++;
      } else if (service.pricing?.tiers) {
        const minPrice = Math.min(...service.pricing.tiers.map(t => parseFloat(t.price)));
        if (minPrice < 0.001) distribution.under_1++;
        else if (minPrice < 0.005) distribution.under_5++;
        else if (minPrice < 0.01) distribution.under_10++;
        else distribution.over_10++;
      }
    }

    return distribution;
  }

  /**
   * Calculate average price
   */
  calculateAveragePrice(services) {
    const prices = [];
    for (const service of services) {
      if (service.pricing?.tiers) {
        const avg = service.pricing.tiers.reduce((acc, t) => acc + parseFloat(t.price), 0) 
                    / service.pricing.tiers.length;
        prices.push(avg);
      }
    }
    if (prices.length === 0) return 0;
    return prices.reduce((acc, p) => acc + p, 0) / prices.length;
  }
}

export default ServiceRegistry;
