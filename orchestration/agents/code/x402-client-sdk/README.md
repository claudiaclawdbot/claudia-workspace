# @x402/client

Official x402 client SDK - Pay for agent services with one line of code.

[![npm version](https://badge.fury.io/js/@x402%2Fclient.svg)](https://www.npmjs.com/package/@x402/client)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Quick Start

```bash
npm install @x402/client
```

```typescript
import { X402Client } from '@x402/client';

const client = new X402Client({
  privateKey: process.env.PRIVATE_KEY,
  chain: 'base'
});

// One line to pay for research
const result = await client.quickPay(
  'https://api.x402-research.com/research',
  '0.001',
  { query: 'AI trends 2024', complexity: 'standard' }
);

console.log(result.data.summary);
```

## Features

- 🔑 **One-line payments** - `client.quickPay(url, amount, payload)`
- 🔒 **EIP-3009 compliant** - Secure authorization-based transfers
- 💰 **USDC support** - Pay with stablecoins on Base, Ethereum, Arbitrum
- 🔍 **Service discovery** - Find available x402 services
- 📊 **Wallet management** - Check balances, manage multiple wallets
- ⚡ **TypeScript** - Full type safety

## Installation

```bash
npm install @x402/client
# or
yarn add @x402/client
# or
pnpm add @x402/client
```

## Usage

### Basic Usage

```typescript
import { X402Client } from '@x402/client';

const client = new X402Client({
  privateKey: '0x...', // Your wallet private key
  chain: 'base'        // 'base' | 'ethereum' | 'arbitrum'
});

// Get wallet info
const wallet = await client.getWalletInfo();
console.log(wallet.address);  // 0x...
console.log(wallet.balance);  // 1.5 ETH, 100.0 USDC
```

### Pay for Services

```typescript
// Method 1: Full control
const result = await client.pay({
  serviceUrl: 'https://api.x402-research.com/research',
  amount: '0.001',
  payload: {
    query: 'Latest AI developments',
    complexity: 'standard',
    sources: ['twitter', 'github', 'web']
  }
});

if (result.success) {
  console.log('Research:', result.data);
} else {
  console.error('Payment failed:', result.error);
}

// Method 2: Quick pay (throws on error)
const research = await client.quickPay(
  'https://api.x402-research.com/research',
  '0.001',
  { query: 'Crypto market analysis' }
);
```

### Service Discovery

```typescript
import { ServiceDiscovery } from '@x402/client';

const discovery = new ServiceDiscovery();

// List all available services
const services = await discovery.listServices();
// [
//   {
//     id: 'research-v1',
//     name: 'x402 Research Service',
//     url: 'https://api.x402-research.com',
//     category: 'research',
//     pricing: { min: '0.001', max: '0.01', currency: 'ETH' }
//   },
//   ...
// ]

// Find by category
const researchServices = await discovery.findByCategory('research');
```

### Get Service Info

```typescript
// Check pricing before paying
const info = await client.getServiceInfo('https://api.x402-research.com');
console.log(info.pricing);
// [
//   { complexity: 'simple', basePrice: '0.001', description: '...' },
//   { complexity: 'standard', basePrice: '0.003', description: '...' },
//   { complexity: 'deep', basePrice: '0.01', description: '...' }
// ]
```

## Available Services

| Service | URL | Category | Price Range |
|---------|-----|----------|-------------|
| x402 Research | `https://tours-discretion-walked-hansen.trycloudflare.com` | Research | 0.001 - 0.01 ETH |
| x402 Crypto | `https://x402-crypto-claudia.loca.lt` | Data | 0.0001 - 0.001 ETH |

## Supported Chains

| Chain | Chain ID | USDC Address |
|-------|----------|--------------|
| Base | 8453 | `0x8335...02913` |
| Ethereum | 1 | `0xA0b8...7A8d0` |
| Arbitrum | 42161 | `0xaf88...5831` |

## API Reference

### X402Client

#### Constructor

```typescript
new X402Client(config: {
  privateKey: string;           // Required: Wallet private key
  chain?: 'base' | 'ethereum' | 'arbitrum';  // Default: 'base'
  facilitatorUrl?: string;      // Default: 'https://x402.org/facilitator'
})
```

#### Methods

| Method | Description |
|--------|-------------|
| `getAddress()` | Get wallet address |
| `getWalletInfo()` | Get address + balances |
| `getServiceInfo(url)` | Get service metadata |
| `createPayment(recipient, amount, expiresIn)` | Create payment authorization |
| `pay(request)` | Pay for service with payload |
| `quickPay(url, amount, payload?)` | Simple one-line payment |

### ServiceDiscovery

| Method | Description |
|--------|-------------|
| `listServices()` | List all registered services |
| `findByCategory(category)` | Filter by category |
| `getServiceDetails(id)` | Get specific service info |

## Error Handling

```typescript
try {
  const result = await client.pay({
    serviceUrl: 'https://api.example.com/service',
    amount: '0.001'
  });
  
  if (!result.success) {
    // Payment declined (402 response)
    console.error('Payment declined:', result.error);
  }
} catch (error) {
  // Network or other errors
  console.error('Request failed:', error.message);
}
```

## Environment Variables

```bash
# Recommended setup
export X402_PRIVATE_KEY="0x..."
export X402_CHAIN="base"
```

```typescript
const client = new X402Client({
  privateKey: process.env.X402_PRIVATE_KEY!,
  chain: (process.env.X402_CHAIN as any) || 'base'
});
```

## Examples

### Research Service

```typescript
const client = new X402Client({ privateKey: '0x...', chain: 'base' });

const report = await client.quickPay(
  'https://tours-discretion-walked-hansen.trycloudflare.com/research',
  '0.003',
  {
    query: 'DeFi protocol comparisons 2024',
    complexity: 'standard',
    sources: ['twitter', 'github', 'web'],
    maxResults: 20
  }
);

console.log(report.data.summary);
console.log(report.data.findings);
```

### Crypto Price Service

```typescript
const prices = await client.quickPay(
  'https://x402-crypto-claudia.loca.lt/prices',
  '0.0001',
  { symbols: ['BTC', 'ETH', 'SOL'] }
);

console.log(prices.data); // { BTC: 45000, ETH: 3000, SOL: 100 }
```

## Protocol

This SDK implements the [x402 Payment Protocol](https://x402.org):

1. **EIP-3009 Authorization** - Off-chain signatures, on-chain settlement
2. **402 Status Code** - HTTP 402 Payment Required for unpaid requests
3. **Exact Scheme** - Fixed-price payments with authorization

## Development

```bash
# Clone and setup
git clone https://github.com/claudia/x402-client-sdk
cd x402-client-sdk
npm install

# Build
npm run build

# Test
npm test
```

## License

MIT © Claudia x402 Ecosystem

## Support

- Documentation: https://x402.org/docs
- Issues: https://github.com/claudia/x402-client-sdk/issues
- Discord: https://discord.gg/x402

---

Built with ❤️ for the agent economy. Pay for compute, get results.