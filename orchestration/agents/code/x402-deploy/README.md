# x402 Deploy 🚀

> **One-command deployment for CLAUDIA's x402 revenue-generating services**

Deploy the **x402-merchant** (payment endpoint) and **x402-research-service** (full research engine) to production in under 5 minutes.

---

## 📋 Prerequisites

| Tool | Purpose | Install |
|------|---------|---------|
| Docker + Docker Compose | Local deployment | [Get Docker](https://docs.docker.com/get-docker/) |
| Git | Clone repos | [Get Git](https://git-scm.com/downloads) |
| Railway CLI (optional) | Deploy to Railway | `npm install -g @railway/cli` |
| Fly CLI (optional) | Deploy to Fly.io | `curl -L https://fly.io/install.sh \| sh` |

**API Keys Required:**
- [Serper.dev](https://serper.dev) - Web search API
- [OpenAI](https://platform.openai.com) - AI insights
- [Twitter Developer](https://developer.twitter.com) (optional) - Social data

---

## ⚡ Quick Start (5 Minutes)

```bash
# 1. Navigate to deploy directory
cd /orchestration/agents/code/x402-deploy

# 2. Run setup
./scripts/setup.sh

# 3. Edit .env with your keys
nano .env  # or use your favorite editor

# 4. Deploy everything
./deploy.sh
```

That's it! Your services will be live and accepting payments.

---

## 🎯 Deployment Options

### Option 1: Local Docker (Development)

```bash
# Deploy both services locally
./deploy.sh both docker

# Or deploy individually
./deploy.sh merchant docker
./deploy.sh research docker
```

**URLs:**
- Merchant: http://localhost:4020
- Research: http://localhost:4021

### Option 2: Railway (One-Click)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/x402-merchant)

```bash
# Deploy via CLI
./deploy.sh both railway
```

### Option 3: Fly.io (Recommended for Production)

```bash
# Deploy to Fly.io
./deploy.sh both fly

# Or individually with auto-scaling
./deploy.sh merchant fly
./deploy.sh research fly
```

---

## 🔧 Environment Configuration

Copy `.env.example` to `.env` and fill in:

```bash
# Required for Merchant
MERCHANT_ADDRESS=0xYourWalletAddress

# Required for Research Service
WALLET_PRIVATE_KEY=0xYourPrivateKey
BASE_RPC_URL=https://mainnet.base.org
SERPER_API_KEY=your_serper_key
OPENAI_API_KEY=your_openai_key

# Optional (for enhanced features)
TWITTER_BEARER_TOKEN=your_twitter_token
GITHUB_TOKEN=your_github_token
```

### Testnet vs Mainnet

**Testnet (for development):**
```bash
BASE_RPC_URL=https://sepolia.base.org
MERCHANT_ADDRESS=0xYourTestWallet
WALLET_PRIVATE_KEY=0xYourTestPrivateKey
```

Get test funds:
- USDC: https://faucet.circle.com
- ETH: https://www.coinbase.com/faucets/base-sepolia-faucet

**Mainnet (for production):**
```bash
BASE_RPC_URL=https://mainnet.base.org
MERCHANT_ADDRESS=0xYourRealWallet
WALLET_PRIVATE_KEY=0xYourRealPrivateKey
```

---

## 📊 Service Endpoints

### x402-Merchant (Payment Gateway)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/price` | GET | Get pricing tiers |
| `/pay` | POST | Process x402 payment |

**Pricing Tiers:**
- Basic: $25 (Quick summary)
- Deep: $125 (Full report)
- Custom: $250 (Multi-source analysis)

### x402-Research-Service (Research Engine)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/status` | GET | Service status |
| `/pricing` | GET | Research pricing |
| `/research` | POST | Submit research request |
| `/report/:id` | GET | Get report by ID |

**Research Complexity:**
- Simple: $0.10 (Quick lookup)
- Standard: $0.50 (Standard research)
- Deep: $2.00 (Comprehensive analysis)

---

## 🧪 Testing Your Deployment

```bash
# Run automated tests
./scripts/test-deployment.sh

# Test merchant manually
curl http://localhost:4020/health
curl http://localhost:4020/price

# Test research service manually
curl http://localhost:4021/status
curl http://localhost:4021/pricing
```

---

## 📁 Project Structure

```
x402-deploy/
├── deploy.sh                 # Main deployment script
├── docker-compose.yml        # Local development stack
├── .env.example             # Environment template
├── railway.json             # Railway configuration
├── fly.merchant.toml        # Fly.io config (merchant)
├── fly.research.toml        # Fly.io config (research)
├── .railway/
│   └── config.json          # Railway service definitions
├── scripts/
│   ├── setup.sh             # First-time setup
│   └── test-deployment.sh   # Post-deploy tests
└── README.md                # This file
```

---

## 🚨 Troubleshooting

### "Missing environment variables"
```bash
# Check your .env file
cat .env | grep -v '^#' | grep '='

# Ensure it's loaded
source .env
```

### "Docker permission denied"
```bash
# Add user to docker group
sudo usermod -aG docker $USER
# Log out and back in
```

### "Port already in use"
```bash
# Find and kill process
lsof -ti:4020 | xargs kill -9
lsof -ti:4021 | xargs kill -9
```

### "Fly.io/Railway auth failed"
```bash
# Re-authenticate
fly auth login
railway login
```

---

## 💰 Revenue Tracking

After deployment, track your earnings:

```bash
# View logs
docker-compose logs -f merchant
docker-compose logs -f research

# Check payments received
# Merchant payments go to: MERCHANT_ADDRESS
# Research payments go to: Service wallet
```

---

## 🔒 Security Best Practices

1. **Never commit `.env`** - It's in `.gitignore` for a reason
2. **Use separate wallets** - One for merchant, one for service
3. **Enable 2FA** on all API key accounts
4. **Rotate keys regularly** - Especially if exposed
5. **Monitor logs** - Watch for suspicious activity

---

## 🆘 Getting Help

- **Documentation**: See `/x402-merchant/README.md` and `/x402-research-service/README.md`
- **x402 Protocol**: https://x402.org
- **Issues**: Check the main agent logs in `orchestration/logs/`

---

## 🎉 Success!

Your x402 services are now live and ready to generate revenue. Agents can now pay for intel!

```
╔══════════════════════════════════════════════════════════╗
║     CLAUDIA's $1M Revenue Journey Continues! 💰          ║
║                                                          ║
║  Merchant:  https://your-merchant-url.com                ║
║  Research:  https://your-research-url.com                ║
╚══════════════════════════════════════════════════════════╝
```