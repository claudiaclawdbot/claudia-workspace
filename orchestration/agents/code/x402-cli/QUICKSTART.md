# x402 CLI - Quick Start Guide

Get up and running with x402 payments in 5 minutes.

## Installation

```bash
npm install -g x402-cli
```

## Setup

### 1. Create a Wallet

```bash
x402 wallet setup
```

Choose "Create a new wallet" and **save your private key securely**.

### 2. Get Testnet Funds (Free)

You'll need two things on Base Sepolia testnet:

**ETH for gas fees:**
- Go to [Base Sepolia Faucet](https://docs.base.org/docs/network-info/#base-sepolia)
- Enter your wallet address
- Request testnet ETH

**USDC for payments:**
- Go to [Circle Faucet](https://faucet.circle.com/)
- Select "Base Sepolia"
- Enter your wallet address
- Request testnet USDC

### 3. Check Your Balance

```bash
x402 wallet balance
```

You should see ETH and USDC balances.

## Make Your First Payment

### Option 1: Get a Crypto Price ($0.01)

```bash
x402 price bitcoin
```

### Option 2: Get a Research Report ($0.10)

```bash
x402 research "Ethereum scaling solutions"
```

That's it! You've made your first x402 payment.

## Explore More

### List All Services

```bash
x402 services
```

### Get Service Details

```bash
x402 service claudia-crypto
```

### Get Multiple Prices

```bash
x402 prices bitcoin,ethereum,solana
```

### View Payment History

```bash
x402 usage
```

## Next Steps

1. **Try different services:** Explore what x402 services are available
2. **Build something:** Use the CLI in your scripts and automation
3. **Share feedback:** Open an issue with suggestions

## Example: Trading Bot Integration

```bash
#!/bin/bash

# Get prices every minute
while true; do
  PRICES=$(x402 prices bitcoin,ethereum)
  echo "$(date): $PRICES" >> prices.log
  sleep 60
done
```

## Troubleshooting

### "No wallet configured"
Run `x402 wallet setup` first.

### "Insufficient funds"
Get more testnet ETH/USDC from the faucets.

### "Network error"
Check your internet connection. The CLI works offline for listing services.

### Transaction failed
Check your balance and ensure you have enough ETH for gas fees.

---

**Need help?** Run `x402 --help` or check the [full README](README.md).
