# x402 Client SDK - Quick Start Guide

Get up and running with x402 payments in 5 minutes.

## 1. Install

```bash
npm install @x402/client
```

## 2. Get a Wallet

You need an Ethereum wallet with some ETH on Base network.

```bash
# Generate a new wallet (save the output!)
node -e "console.log(require('ethers').Wallet.createRandom())"
```

Or use an existing private key.

## 3. Fund Your Wallet

Send 0.01-0.1 ETH to your wallet address on Base:
- Bridge from Ethereum: [bridge.base.org](https://bridge.base.org)
- Buy directly on Base using Coinbase, Rainbow, etc.

## 4. Make Your First Payment

```typescript
import { X402Client } from '@x402/client';

const client = new X402Client({
  privateKey: '0x...', // Your private key
  chain: 'base'
});

// Pay for research - one line!
const result = await client.quickPay(
  'https://tours-discretion-walked-hansen.trycloudflare.com/research',
  '0.001',
  { 
    query: 'What are the latest AI agent frameworks?',
    complexity: 'simple',
    sources: ['twitter', 'web']
  }
);

console.log(result.data.summary);
```

## 5. Try Different Services

```typescript
// Research Service
const research = await client.quickPay(
  'https://tours-discretion-walked-hansen.trycloudflare.com/research',
  '0.001',
  { query: 'DeFi trends 2024', complexity: 'standard' }
);

// Crypto Prices
const prices = await client.quickPay(
  'https://x402-crypto-claudia.loca.lt/prices',
  '0.0001',
  { symbols: ['BTC', 'ETH', 'SOL'] }
);
```

## 6. Check Your Balance

```typescript
const wallet = await client.getWalletInfo();
console.log(wallet.balance); // "1.5 ETH, 100.0 USDC"
```

## Full Example

```typescript
import { X402Client, ServiceDiscovery } from '@x402/client';

async function main() {
  // Initialize
  const client = new X402Client({
    privateKey: process.env.PRIVATE_KEY!,
    chain: 'base'
  });

  // Discover services
  const discovery = new ServiceDiscovery();
  const services = await discovery.listServices();
  console.log('Available services:', services.length);

  // Pay for research
  const report = await client.quickPay(
    'https://tours-discretion-walked-hansen.trycloudflare.com/research',
    '0.001',
    { query: 'Agent economy trends', complexity: 'simple' }
  );

  console.log('Research complete!');
  console.log(report.data.summary);
}

main().catch(console.error);
```

## Environment Setup

```bash
# .env file
PRIVATE_KEY=0x...
X402_CHAIN=base
```

```typescript
import dotenv from 'dotenv';
dotenv.config();

const client = new X402Client({
  privateKey: process.env.PRIVATE_KEY!,
  chain: process.env.X402_CHAIN as any || 'base'
});
```

## Troubleshooting

### "Insufficient funds"
- Fund your wallet with ETH on Base network
- Check balance: `await client.getWalletInfo()`

### "Invalid payment"
- Make sure you're using the correct chain ('base')
- Verify the service URL is correct

### "Service unavailable"
- Check if the service is running: `await client.getServiceInfo(url)`
- Try the status endpoint: `GET {service-url}/status`

## Next Steps

- Read the [full documentation](https://github.com/claudia/x402-client-sdk/blob/main/README.md)
- Check out [examples](./examples/)
- Build your own x402 service

## Support

- GitHub Issues: https://github.com/claudia/x402-client-sdk/issues
- Discord: https://discord.gg/x402