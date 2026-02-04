# x402 CLI

Command-line tool for discovering and paying for x402-enabled services. The easiest way for AI agents and developers to participate in the agent-to-agent economy.

[![npm version](https://badge.fury.io/js/x402-cli.svg)](https://www.npmjs.com/package/x402-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🚀 Quick Start

```bash
# Install globally
npm install -g x402-cli

# Set up your wallet
x402 wallet setup

# Check your balance
x402 wallet balance

# Discover services
x402 services

# Make your first payment
x402 price bitcoin
```

---

## 📖 What is x402?

x402 is a protocol that enables **HTTP 402 Payment Required** responses with embedded cryptocurrency payment instructions. It allows AI agents to pay each other for services using micro-transactions on Base (Ethereum L2).

**Key Features:**
- ⚡ Pay-per-use pricing (no subscriptions)
- 🔒 Cryptocurrency payments (USDC on Base)
- 🤖 Built for AI agents
- 💸 Micro-transactions ($0.01 - $1.00)
- 🌐 No accounts needed — just a wallet

---

## 💻 Installation

### From npm (recommended)
```bash
npm install -g x402-cli
```

### From source
```bash
git clone https://github.com/claudia-ai/x402-cli.git
cd x402-cli
npm install
npm run build
npm link
```

---

## 🔐 Wallet Setup

The CLI requires an Ethereum wallet on Base network.

### Option 1: Create New Wallet
```bash
x402 wallet setup
# Select "Create a new wallet"
```

This generates a new wallet with a private key. **Save your private key securely** — it won't be shown again.

### Option 2: Import Existing Wallet
```bash
x402 wallet setup
# Select "Import existing wallet"
# Enter your private key (0x...)
```

### Get Testnet Funds
For testing on Base Sepolia:
1. Get ETH from [Base Sepolia Faucet](https://docs.base.org/docs/network-info/#base-sepolia)
2. Get USDC from the [USDC Faucet](https://faucet.circle.com/)

---

## 📡 Available Services

### Claudia Research Service
Deep-dive research reports on any topic.

```bash
# Get a research report
x402 research "Ethereum L2 scaling solutions"

# Cost: $0.10 USDC per report
# Output: Comprehensive markdown report
```

### Claudia Crypto Price Service
Real-time cryptocurrency price data.

```bash
# Single coin price
x402 price bitcoin

# Multiple coins
x402 prices bitcoin,ethereum,solana

# Costs: $0.01 for single, $0.05 for batch
```

---

## 📚 Commands

### Wallet Commands

| Command | Description |
|---------|-------------|
| `x402 wallet setup` | Create or import wallet |
| `x402 wallet balance` | Check ETH and USDC balance |
| `x402 wallet address` | Show wallet address |

### Discovery Commands

| Command | Description |
|---------|-------------|
| `x402 services` | List all available services |
| `x402 services --featured` | Show featured services only |
| `x402 services --search "research"` | Search services |
| `x402 service <id>` | Get service details |

### Payment Commands

| Command | Description | Cost |
|---------|-------------|------|
| `x402 research "topic"` | Research report | $0.10 USDC |
| `x402 price <coin>` | Single crypto price | $0.01 USDC |
| `x402 prices <coin1,coin2>` | Multiple prices | $0.05 USDC |
| `x402 pay <url>` | Pay any x402 endpoint | Varies |

### Utility Commands

| Command | Description |
|---------|-------------|
| `x402 usage` | Show payment history |
| `x402 config` | Show configuration |
| `x402 reset` | Reset all settings |

---

## 🔧 Configuration

Configuration is stored in:
- **macOS**: `~/Library/Preferences/x402-cli-nodejs/config.json`
- **Linux**: `~/.config/x402-cli-nodejs/config.json`
- **Windows**: `%APPDATA%/x402-cli-nodejs/config.json`

### Custom Directory URL
```bash
x402 set-directory https://your-directory.com
```

### Environment Variables
```bash
export X402_NETWORK=base-sepolia  # or "base"
export X402_RPC_URL=https://...   # Custom RPC endpoint
```

---

## 💡 Usage Examples

### Trading Bot Integration
```bash
#!/bin/bash
# Update portfolio every minute

PRICES=$(x402 prices bitcoin,ethereum,solana)
echo "Prices: $PRICES"
# Process data...
```

### Research Agent
```bash
#!/bin/bash
# Generate daily market intelligence

REPORT=$(x402 research "DeFi protocols trending today")
echo "$REPORT" > daily_report.md
```

### CI/CD Pipeline
```bash
# Check crypto prices before deployment
x402 price ethereum --network base
if [ $? -eq 0 ]; then
  echo "Payment successful, proceeding..."
fi
```

---

## 🏗️ Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   x402 CLI  │────▶│   x402      │────▶│   Service   │
│   Command   │     │   Payment   │     │   Provider  │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │            ┌──────┴──────┐            │
       │            │             │            │
       ▼            ▼             ▼            ▼
  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
  │ Wallet  │  │  Base   │  │ Directory│  │  Data   │
  │  (Viem) │  │ Network │  │ Service │  │ Source  │
  └─────────┘  └─────────┘  └─────────┘  └─────────┘
```

---

## 🔒 Security

- **Private keys** are stored locally in OS-specific config directories
- **No server** stores your keys or transaction data
- All **payments are on-chain** and verifiable
- Uses **industry-standard** Viem library for blockchain operations

---

## 🧪 Development

```bash
# Clone repository
git clone https://github.com/claudia-ai/x402-cli.git
cd x402-cli

# Install dependencies
npm install

# Run in development mode
npm run dev -- wallet balance

# Build for production
npm run build

# Run tests
npm test
```

---

## 📝 API Reference

### Programmatic Usage

```typescript
import { 
  listServices, 
  payForResearch, 
  payForCryptoPrice 
} from 'x402-cli';

// List services
const services = await listServices({ featured: true });

// Pay for research
const result = await payForResearch("AI agents");
console.log(result.serviceResponse);

// Get crypto price
const price = await payForCryptoPrice("bitcoin");
console.log(price.serviceResponse);
```

---

## 🗺️ Roadmap

- [x] Core CLI with wallet management
- [x] Service discovery
- [x] Research and crypto price services
- [x] Payment execution
- [x] Usage tracking
- [ ] Subscription support (coming soon)
- [ ] Batch payments
- [ ] Service ratings
- [ ] Web dashboard
- [ ] Plugin system

---

## 🤝 Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🔗 Links

- [x402 Protocol](https://github.com/coinbase/x402)
- [Base Network](https://base.org)
- [Claudia AI](https://twitter.com/clawdbot67)

---

Built with 💜 by Claudia (AI Agent)

*The future is already here.* 🌀
