import fetch, { Response } from 'node-fetch';
import { Service, ServiceDetails } from './types.js';
import { getDirectoryUrl } from './config.js';

const FETCH_TIMEOUT = 5000; // 5 second timeout

async function fetchWithTimeout(url: string, options: Parameters<typeof fetch>[1] = {}): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeout);
    return response;
  } catch (error) {
    clearTimeout(timeout);
    throw error;
  }
}

// Fallback to known services if directory is unavailable
const KNOWN_SERVICES: Service[] = [
  {
    id: 'claudia-research',
    name: 'Claudia Research Service',
    description: 'Deep-dive research reports on any topic. Perfect for agents that need comprehensive intelligence without burning API credits.',
    url: 'https://tours-discretion-walked-hansen.trycloudflare.com',
    price: {
      amount: '100000',
      token: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      decimals: 6,
    },
    category: 'Research',
    tags: ['research', 'intelligence', 'ai', 'reports'],
    featured: true,
    createdAt: '2026-02-01',
  },
  {
    id: 'claudia-crypto',
    name: 'Claudia Crypto Price Service',
    description: 'Real-time cryptocurrency price data. Fast, reliable, and 90% cheaper than CoinGecko Pro.',
    url: 'https://x402-crypto-claudia.loca.lt',
    price: {
      amount: '10000',
      token: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      decimals: 6,
    },
    category: 'Finance',
    tags: ['crypto', 'prices', 'trading', 'bitcoin', 'ethereum'],
    featured: true,
    createdAt: '2026-02-01',
  },
];

export async function listServices(options?: {
  category?: string;
  featured?: boolean;
  search?: string;
}): Promise<Service[]> {
  // TODO: Implement directory fetch when directory service is live
  // For now, use known services
  return filterKnownServices(KNOWN_SERVICES, options);
}

function filterKnownServices(services: Service[], options?: {
  category?: string;
  featured?: boolean;
  search?: string;
}): Service[] {
  let filtered = services;

  if (options?.category) {
    filtered = filtered.filter(s => 
      s.category.toLowerCase() === options.category!.toLowerCase()
    );
  }

  if (options?.featured) {
    filtered = filtered.filter(s => s.featured);
  }

  if (options?.search) {
    const search = options.search.toLowerCase();
    filtered = filtered.filter(s => 
      s.name.toLowerCase().includes(search) ||
      s.description.toLowerCase().includes(search) ||
      s.tags.some(t => t.toLowerCase().includes(search))
    );
  }

  return filtered;
}

export async function getService(id: string): Promise<ServiceDetails | null> {
  // TODO: Implement directory fetch when directory service is live
  const known = KNOWN_SERVICES.find(s => s.id === id);
  if (known) {
    return { ...known, endpoints: inferEndpoints(known) };
  }
  return null;
}

function inferEndpoints(service: Service): Array<{ path: string; method: string; description: string; price?: string }> {
  if (service.id === 'claudia-research') {
    return [
      { path: '/', method: 'GET', description: 'Service info & documentation', price: 'FREE' },
      { path: '/research', method: 'POST', description: 'Generate research report', price: '$0.10 USDC' },
    ];
  }
  
  if (service.id === 'claudia-crypto') {
    return [
      { path: '/status', method: 'GET', description: 'Health check', price: 'FREE' },
      { path: '/coins', method: 'GET', description: 'List supported coins', price: 'FREE' },
      { path: '/price/:coin', method: 'GET', description: 'Single coin price', price: '$0.01 USDC' },
      { path: '/prices', method: 'POST', description: 'Multiple coins', price: '$0.05 USDC' },
      { path: '/prices/all', method: 'GET', description: 'All supported coins', price: '$0.05 USDC' },
    ];
  }

  return [];
}

export async function getServiceByUrl(url: string): Promise<Service | null> {
  const services = await listServices();
  return services.find(s => s.url === url) || null;
}

export function getCategories(): string[] {
  const categories = new Set(KNOWN_SERVICES.map(s => s.category));
  return Array.from(categories).sort();
}

export function formatPrice(service: Service): string {
  const amount = Number(service.price.amount) / Math.pow(10, service.price.decimals);
  const tokenSymbol = service.price.token === '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' ? 'USDC' : 'ETH';
  return `$${amount.toFixed(amount < 0.1 ? 4 : 2)} ${tokenSymbol}`;
}
