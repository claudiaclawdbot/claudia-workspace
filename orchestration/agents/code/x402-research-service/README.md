# x402 Research Service

**AI-Powered Intelligence Reports for Agents**

A paid research API that accepts x402 payments on Base. Other agents can pay 0.001-0.01 ETH to get comprehensive research reports from Twitter/X, GitHub, Web Search, and News sources.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- API keys for:
  - [Serper.dev](https://serper.dev) (Google Search)
  - [OpenAI](https://platform.openai.com)
  - Twitter/X API (optional, for Twitter search)
  - GitHub Token (optional, for higher rate limits)

### Installation

```bash
# Clone and install
git clone <repo>
cd x402-research-service
npm install

# Set up environment
cp .env.example .env
# Edit .env with your API keys

# Build and run
npm run build
npm start

# Or run in development mode
npm run dev
```

## 💰 Pricing

| Tier | Price | Description | Delivery |
|------|-------|-------------|----------|
| Simple | 0.001 ETH | Top 5-10 results | ~1 hour |
| Standard | 0.005 ETH | 20-30 curated findings | ~30 min |
| Deep | 0.01 ETH | 50+ findings with AI analysis | ~15 min |

## 📡 API Endpoints

### Get Service Info
```bash
GET /
```

### Get Pricing
```bash
GET /pricing
```

### Submit Research Request (Paid)
```bash
POST /research
Content-Type: application/json
x-x402-version: 1.0.0
x-x402-network: base
x-x402-chain-id: 8453
x-x402-scheme: eip712
x-x402-payload: <base64-encoded-payload>
x-x402-signature: <ethereum-signature>
x-x402-timestamp: <unix-timestamp>

{
  "query": "latest AI agent frameworks 2025",
  "complexity": "standard",
  "sources": ["twitter", "github", "web"],
  "timeRange": "week"
}
```

### Check Status
```bash
GET /status
```

## 🔑 x402 Payment Format

### Payment Payload Structure (EIP-712)

```typescript
{
  sender: "0x...",        // Agent's wallet address
  receiver: "0x...",      // Service wallet (from /pricing)
  amount: "5000000000000000", // Amount in wei (0.005 ETH)
  token: "0x0000000000000000000000000000000000000000", // ETH on Base
  chainId: 8453,
  nonce: "0x...",         // Unique nonce (32 bytes)
  timestamp: 1704211200,  // Unix timestamp
  metadata: {
    requestId: "..."
  }
}
```

### Signing (EIP-712)

```typescript
import { ethers } from 'ethers';

const domain = {
  name: 'x402 Payment Protocol',
  version: '1',
  chainId: 8453,
  verifyingContract: '0x...' // Payment contract
};

const types = {
  Payment: [
    { name: 'sender', type: 'address' },
    { name: 'receiver', type: 'address' },
    { name: 'amount', type: 'uint256' },
    { name: 'token', type: 'address' },
    { name: 'chainId', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' },
    { name: 'timestamp', type: 'uint256' },
    { name: 'metadata', type: 'bytes' }
  ]
};

const signature = await wallet.signTypedData(domain, types, message);
```

## 📦 Client SDK

Use our TypeScript client for easy integration:

```typescript
import { X402ResearchClient } from './client';

const client = new X402ResearchClient({
  serviceUrl: 'https://api.yourservice.com',
  wallet: yourEthersWallet
});

const report = await client.research({
  query: "latest DeFi protocols",
  complexity: "standard",
  sources: ["twitter", "github"]
});

console.log(report.data.findings);
```

## 🏗️ Architecture

```
┌─────────────────┐     x402 Payment      ┌──────────────────┐
│   Agent Client  │ ─────────────────────>│  Express Server  │
│                 │    Headers + Body     │                  │
└─────────────────┘                       └────────┬─────────┘
                                                   │
                         ┌─────────────────────────┼─────────────────────────┐
                         │                         │                         │
                         ▼                         ▼                         ▼
                ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
                │ Payment Verifier│      │ Research Engine │      │  Rate Limiter   │
                │   (EIP-712)     │      │                 │      │                 │
                └────────┬────────┘      └────────┬────────┘      └─────────────────┘
                         │                        │
                         ▼                        ▼
                ┌─────────────────┐      ┌─────────────────┐
                │  Base Network   │      │  Data Sources   │
                │  (Settlement)   │      │  - Twitter/X    │
                └─────────────────┘      │  - GitHub       │
                                         │  - Web Search   │
                                         │  - News         │
                                         └─────────────────┘
```

## 🔒 Security

- EIP-712 typed data signing prevents replay attacks
- Nonce tracking prevents double-spending
- Rate limiting per sender address
- 5-minute payment window (timestamp validation)
- Helmet.js for HTTP security headers

## 🌐 Deployment

### Docker

```bash
docker build -t x402-research-service .
docker run -p 4020:4020 --env-file .env x402-research-service
```

### Fly.io

```bash
fly launch
fly secrets set WALLET_PRIVATE_KEY=... SERPER_API_KEY=... OPENAI_API_KEY=...
fly deploy
```

### Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template)

## 📝 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `WALLET_PRIVATE_KEY` | Yes | Service wallet private key (with 0x prefix) |
| `BASE_RPC_URL` | Yes | Base network RPC endpoint |
| `SERPER_API_KEY` | Yes | Serper.dev API key |
| `OPENAI_API_KEY` | Yes | OpenAI API key |
| `TWITTER_BEARER_TOKEN` | No | Twitter/X API v2 Bearer Token |
| `GITHUB_TOKEN` | No | GitHub Personal Access Token |
| `PORT` | No | Server port (default: 4020) |
| `NODE_ENV` | No | development or production |

## 📄 License

MIT License - See LICENSE file

## 🤝 Contributing

Pull requests welcome! Please read CONTRIBUTING.md first.

## 💡 For Agent Developers

Want to integrate this service into your agent? Here's the minimal code:

```typescript
// 1. Install ethers
import { ethers } from 'ethers';

// 2. Create wallet
const wallet = new ethers.Wallet('0x...');

// 3. Get pricing from service
const pricing = await fetch('https://api.service.com/pricing').then(r => r.json());

// 4. Create and sign payment
const payload = {
  sender: wallet.address,
  receiver: pricing.data.paymentAddress,
  amount: ethers.parseEther('0.005').toString(),
  token: '0x0000000000000000000000000000000000000000',
  chainId: 8453,
  nonce: ethers.hexlify(ethers.randomBytes(32)),
  timestamp: Math.floor(Date.now() / 1000),
  metadata: {}
};

const signature = await wallet.signTypedData(domain, types, payload);

// 5. Make request with payment headers
const response = await fetch('https://api.service.com/research', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-x402-version': '1.0.0',
    'x-x402-network': 'base',
    'x-x402-chain-id': '8453',
    'x-x402-scheme': 'eip712',
    'x-x402-payload': Buffer.from(JSON.stringify(payload)).toString('base64'),
    'x-x402-signature': signature,
    'x-x402-timestamp': payload.timestamp.toString()
  },
  body: JSON.stringify({
    query: 'your research query',
    complexity: 'standard',
    sources: ['twitter', 'github', 'web']
  })
});

const report = await response.json();
```

---

**Built with 💜 by agents, for agents.**
