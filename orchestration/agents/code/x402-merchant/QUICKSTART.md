# x402 Agent Intel Service - Quickstart Guide

Get your first intel report in under 5 minutes.

## Prerequisites

- Node.js 18+ installed
- A wallet with Base Sepolia USDC
- Some Base Sepolia ETH for gas (faucet: https://www.coinbase.com/faucets/base-ethereum-faucet)

## Step 1: Install the SDK

```bash
npm install @x402/agent-sdk ethers
```

## Step 2: Get Test USDC on Base Sepolia

1. Visit the [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-faucet)
2. Request ETH for gas
3. Get test USDC from the [Circle Faucet](https://faucet.circle.com/)

## Step 3: Create Your First Request

Create a file `first-report.js`:

```javascript
import { X402AgentClient } from '@x402/agent-sdk';
import { Wallet } from 'ethers';

// Initialize with your private key (use .env in production!)
const wallet = new Wallet(process.env.PRIVATE_KEY);

const client = new X402AgentClient({
  wallet,
  network: 'base-sepolia',
  serviceUrl: 'https://api.x402.io'
});

async function getIntelReport() {
  try {
    // 1. Check available tiers
    const tiers = await client.getPrices();
    console.log('Available tiers:', tiers);

    // 2. Get payment requirements for basic tier
    const paymentReq = await client.getPrice('basic');
    console.log('Payment required:', paymentReq.price, paymentReq.currency);

    // 3. Create and sign payment authorization
    const authorization = await client.createAuthorization({
      amount: paymentReq.price,
      token: paymentReq.tokenAddress,
      recipient: paymentReq.recipient
    });

    // 4. Submit payment and get report
    const response = await client.pay({
      paymentPayload: authorization,
      tier: 'basic',
      query: 'What are the top 3 trends in AI agent development?'
    });

    console.log('Transaction:', response.txHash);
    console.log('Report:', response.report.content);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

getIntelReport();
```

## Step 4: Run It

```bash
export PRIVATE_KEY="your_private_key_here"
node first-report.js
```

## Expected Output

```
Available tiers: { basic: {...}, pro: {...}, enterprise: {...} }
Payment required: 1.00 USDC
Transaction: 0xabc123...
Report: Based on current market analysis, the top 3 trends in AI agent development are:
1. Autonomous DeFi agents for yield optimization
2. Multi-agent collaboration frameworks
3. On-chain reputation systems for agents
```

## Next Steps

- Try different tiers: Change `'basic'` to `'pro'` or `'enterprise'`
- Explore the [Integration Guide](./INTEGRATION.md) for agent developers
- Check the [API Reference](./API.md) for all endpoints

## Troubleshooting

### "Insufficient balance"
- Get more test USDC from the Circle faucet
- Ensure you have Base Sepolia ETH for gas

### "Invalid signature"
- Check your wallet has the correct network (Base Sepolia = chainId 84532)
- Verify your private key is correct

### "Payment required (402)"
- The authorization amount doesn't match the tier price
- Ensure you're using the correct token address from `/price` endpoint

## Support

- Discord: https://discord.gg/x402
- GitHub Issues: https://github.com/x402/agent-intel/issues
