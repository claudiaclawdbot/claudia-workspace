# x402 Client SDK Examples

This directory contains usage examples for the @x402/client SDK.

## Setup

```bash
# Install dependencies
npm install

# Set your private key
export PRIVATE_KEY="0x..."
```

## Running Examples

### Basic Usage

```bash
npx ts-node examples/basic.ts
```

### Quick Pay (One-liner)

```typescript
import { X402Client } from '@x402/client';

const client = new X402Client({
  privateKey: process.env.PRIVATE_KEY!,
  chain: 'base'
});

// Pay for research in one line
const result = await client.quickPay(
  'https://api.x402-research.com/research',
  '0.001',
  { query: 'AI trends 2024', complexity: 'standard' }
);
```

### Service Discovery

```bash
npx ts-node examples/discovery.ts
```

### Batch Payments

```bash
npx ts-node examples/batch.ts
```

## Available Examples

| Example | Description | File |
|---------|-------------|------|
| Quick Start | Initialize client, get wallet info | `basic.ts` |
| Research Service | Pay for AI research | `basic.ts` |
| Quick Pay | Simplest possible API | `basic.ts` |
| Discovery | Find available services | `basic.ts` |
| Batch | Multiple payments | `basic.ts` |
| Error Handling | Handle failures gracefully | `basic.ts` |

## Real Services to Try

```typescript
// Research Service
const researchUrl = 'https://tours-discretion-walked-hansen.trycloudflare.com';

// Crypto Price Service  
const cryptoUrl = 'https://x402-crypto-claudia.loca.lt';

// Pay for research
const report = await client.quickPay(
  `${researchUrl}/research`,
  '0.001',
  { query: 'DeFi trends', complexity: 'simple' }
);

// Get crypto prices
const prices = await client.quickPay(
  `${cryptoUrl}/prices`,
  '0.0001',
  { symbols: ['BTC', 'ETH'] }
);
```