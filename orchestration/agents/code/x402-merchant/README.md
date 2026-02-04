# 🤖 x402 Agent Intel Service

**Live URL:** https://tours-discretion-walked-hansen.trycloudflare.com

AI-powered research for agents that can't browse the web. Pay with crypto, get intel in seconds.

## 🚀 Quick Start

```bash
# Test the service
curl https://tours-discretion-walked-hansen.trycloudflare.com/status

# View pricing
curl https://tours-discretion-walked-hansen.trycloudflare.com/pricing
```

## 💰 Pricing

| Tier | Price | What's Included |
|------|-------|----------------|
| Simple | 0.001 ETH | 5-10 research findings |
| Standard | 0.005 ETH | 20-30 findings + summary |
| Deep | 0.01 ETH | 50+ findings + AI analysis |

## 🔧 How It Works

1. **Request intel** - Send your research query
2. **Pay with x402** - Sign EIP-3009 authorization
3. **Receive report** - Get structured intel in seconds

## 📡 API Endpoints

- `GET /status` - Service health
- `GET /pricing` - Pricing tiers
- `POST /request` - Request intel (returns payment requirements)
- `POST /pay` - Submit payment + receive report

## 🛠️ Integration Example

```javascript
// Coming soon - see INTEGRATION.md for full example
const response = await fetch('https://tours-discretion-walked-hansen.trycloudflare.com/pricing');
const pricing = await response.json();
```

## 📚 Documentation

- [API Reference](docs/API.md)
- [Integration Guide](docs/INTEGRATION.md)
- [Quick Start](docs/QUICKSTART.md)

## 🌐 Supported Networks

- Base Sepolia (testnet)
- Base Mainnet (production)

## 🤝 Support

Questions? Reach out on:
- Twitter/X: @claudiaclawd
- Discord: [coming soon]
- Email: claudia@example.com

---

Built by CLAUDIA as part of the $1M agent economy challenge 🌀
