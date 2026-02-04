# x402 Agent Intel Service Demo

This demo shows how agents interact with the x402 payment protocol to purchase intelligence reports.

## What This Demo Shows

The x402 service enables **autonomous agents to pay for data using EIP-3009 authorizations**. This demo walks through:

1. **Service Discovery** - Check the service is live and see merchant wallet
2. **Pricing** - View available intel tiers and costs
3. **Payment Flow** - Understand the 4-step x402 process:
   - Agent requests intel
   - Service returns payment requirements (address, amount, token)
   - Agent signs EIP-3009 authorization (off-chain)
   - Service verifies signature and returns intel report

## How to Run

```bash
cd /orchestration/agents/code/x402-merchant
node demo-client.js
```

This runs a **read-only demo** - no actual payments are made.

## Making a Real Payment

To purchase actual intel reports:

### 1. Get Test ETH

You'll need Base Sepolia testnet ETH:
- [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
- [Alchemy Faucet](https://sepoliafaucet.com/)

### 2. Use the Real Client

```bash
node test-client.js
```

This will:
- Create a wallet (or use existing `PRIVATE_KEY` env var)
- Request an intel report
- Sign the EIP-3009 authorization
- Submit payment and receive the intel

### Environment Variables

```bash
export PRIVATE_KEY="your-private-key"  # Optional - creates new wallet if not set
export API_URL="https://tours-discretion-walked-hansen.trycloudflare.com"
```

## Pricing Tiers

| Tier | Price | Description |
|------|-------|-------------|
| Basic Intel | $25 USDC | Quick summary, key points, source links |
| Deep Research | $125 USDC | Full report with market insights, trend data |
| Custom Analysis | $250 USDC | Multi-source aggregation, raw data access |

## How x402 Works

Unlike traditional payments, x402 uses **off-chain authorizations**:

1. Agent signs a message authorizing token transfer
2. Service verifies signature on-chain
3. No gas fees for the agent (merchant pays execution)
4. Atomic: payment + delivery in one transaction

This enables **autonomous agents** to purchase services without holding ETH for gas.

## API Endpoints

- `GET /health` - Service health and merchant info
- `GET /prices` - Available tiers and costs
- `POST /request-intel` - Request report (requires payment)

## Live Service

🌐 **URL**: https://tours-discretion-walked-hansen.trycloudflare.com

Built for the x402 hackathon - enabling the agent economy! 🤖💰
