# x402 Research Service - Quick Deploy Guide

## 🚀 Deploy in 5 Minutes

### Option 1: Railway (Easiest)

1. Fork the repo to your GitHub
2. Go to [railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your forked repo
5. Add environment variables (see below)
6. Deploy!

**One-Click Deploy:**
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

### Option 2: Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch
fly launch

# Set secrets
fly secrets set WALLET_PRIVATE_KEY=0x...
fly secrets set BASE_RPC_URL=https://mainnet.base.org
fly secrets set SERPER_API_KEY=sk-...
fly secrets set OPENAI_API_KEY=sk-...

# Deploy
fly deploy
```

### Option 3: Docker

```bash
# Build
docker build -t x402-research-service .

# Run
docker run -p 4020:4020 \
  -e WALLET_PRIVATE_KEY=0x... \
  -e BASE_RPC_URL=https://mainnet.base.org \
  -e SERPER_API_KEY=sk-... \
  -e OPENAI_API_KEY=sk-... \
  x402-research-service
```

### Option 4: Local Development

```bash
# Clone
git clone <repo>
cd x402-research-service

# Install
npm install

# Configure
cp .env.example .env
# Edit .env with your keys

# Build
npm run build

# Run
npm start

# Or dev mode
npm run dev
```

## 🔑 Required Environment Variables

| Variable | Description | How to Get |
|----------|-------------|------------|
| `WALLET_PRIVATE_KEY` | Service wallet private key | Create new wallet, fund with ETH on Base |
| `BASE_RPC_URL` | Base network RPC | https://mainnet.base.org or Alchemy/Infura |
| `SERPER_API_KEY` | Google Search API | [serper.dev](https://serper.dev) - free tier available |
| `OPENAI_API_KEY` | OpenAI API | [platform.openai.com](https://platform.openai.com) |

## 🧪 Testing Your Deployment

### Test 1: Health Check
```bash
curl https://your-service.fly.dev/status
```

Expected response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "wallet": {
      "address": "0x...",
      "balance": "0.05 ETH"
    }
  }
}
```

### Test 2: Get Pricing
```bash
curl https://your-service.fly.dev/pricing
```

### Test 3: Test Payment Flow (Node.js)
```javascript
const { createResearchClient } = require('./dist/client');

const client = createResearchClient(
  'https://your-service.fly.dev',
  '0xTEST_PRIVATE_KEY'
);

async function test() {
  // Test connection
  const status = await client.getStatus();
  console.log('Status:', status);
  
  // Test payment verification
  const valid = await client.testPayment('0.001');
  console.log('Payment test:', valid ? 'PASSED' : 'FAILED');
}

test();
```

## 📊 Monitoring

### Health Endpoint
```bash
curl https://your-service.fly.dev/status
```

### Logs (Fly.io)
```bash
fly logs
```

### Logs (Railway)
View in Railway dashboard or use CLI.

## 💰 Setting Up Your Wallet

1. **Create Wallet:**
```javascript
const { Wallet } = require('ethers');
const wallet = Wallet.createRandom();
console.log('Address:', wallet.address);
console.log('Private Key:', wallet.privateKey);
```

2. **Fund with ETH on Base:**
   - Bridge ETH from Ethereum mainnet to Base
   - Or buy directly on Base via Coinbase/onramps
   - Need ~0.01 ETH to start

3. **Save Private Key:**
   - Add to environment variables
   - Never commit to git!

## 🌐 Custom Domain (Optional)

### Fly.io
```bash
fly certs add api.yourdomain.com
# Update DNS to point to fly.io
```

### Railway
Add custom domain in Railway dashboard settings.

## 📈 Scaling

### Fly.io
```bash
# Scale to 2 machines
fly scale count 2

# Scale CPU/memory
fly scale vm shared-cpu-2x --memory 1024
```

### Railway
Scale horizontally in dashboard or via CLI.

## 🔒 Security Checklist

- [ ] Private key in environment variable, not code
- [ ] Rate limiting enabled (default: 30 req/min)
- [ ] HTTPS only (enforced by platforms)
- [ ] Nonce tracking prevents replay attacks
- [ ] 5-minute payment window expiry

## 🐛 Troubleshooting

### "Missing required environment variables"
Check all required vars are set in deployment platform.

### "Invalid payment signature"
Make sure client and server use same EIP-712 domain config.

### "Rate limited"
Default is 30 requests/minute. Increase in config if needed.

### "Twitter search failed"
Twitter API is optional. Service works without it for web/github search.

## 📞 Support

- GitHub Issues: [github.com/ultimatecodemaster/x402-research-service](https://github.com/ultimatecodemaster/x402-research-service)
- Email: claudia@clawd.io
- Discord: [Join CLAUDIA's server](https://discord.gg/claudia)

---

**Ready to deploy?** Start with Railway for the fastest setup, or Fly.io for more control.
