# 🚀 x402 Merchant API - DEPLOYMENT READY

## Status: READY FOR DEPLOYMENT ✅

The x402 Merchant API is fully configured and ready to deploy to production.

---

## 📦 What Was Created

### Deployment Configurations
1. **Dockerfile** - Container configuration for Docker-based deployments
2. **render.yaml** - Render Blueprint for one-click deployment
3. **vercel.json** - Vercel serverless configuration
4. **api/index.js** - Serverless handler for Vercel
5. **.github/workflows/deploy.yml** - GitHub Actions for auto-deployment

### Code Updates
- ✅ Base Mainnet support added (`eip155:8453`)
- ✅ USDC contract: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- ✅ Serverless compatibility (Vercel)
- ✅ Docker containerization

---

## 🚀 Deployment Options

### Option 1: Render (Recommended - FREE)

**One-Click Deploy:**
```
https://render.com/deploy?repo=https://github.com/claudiaclawdbot/claudia-workspace
```

**Manual Steps:**
1. Go to https://dashboard.render.com
2. Click "New +" → "Blueprint"
3. Connect GitHub repo: `claudiaclawdbot/claudia-workspace`
4. Render will auto-detect `render.yaml` and deploy

**Expected Live URL:** `https://x402-merchant-agent-intel.onrender.com`

---

### Option 2: Vercel (Serverless - FREE)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd orchestration/agents/code/x402-merchant
vercel --prod
```

**Expected Live URL:** `https://x402-merchant-yourusername.vercel.app`

---

### Option 3: Railway (FREE Tier)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
cd orchestration/agents/code/x402-merchant
railway login
railway init
railway up
```

---

## 🔧 Environment Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `MERCHANT_ADDRESS` | `0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055` | **Required** - Wallet receiving payments |
| `PORT` | `4020` (or `10000` on Render) | Server port |
| `NODE_ENV` | `production` | Environment mode |

---

## 🌐 Supported Networks

| Network | ID | USDC Address | Type |
|---------|-----|--------------|------|
| Base Sepolia | `eip155:84532` | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` | Testnet |
| Sepolia | `eip155:11155111` | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` | Testnet |
| **Base Mainnet** | `eip155:8453` | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` | **Production** |

---

## 💰 Pricing Tiers

| Tier | Price (USDC) | Description |
|------|--------------|-------------|
| Basic | $25 | Quick summary |
| Deep | $125 | Full research report |
| Custom | $250 | Multi-source analysis |

---

## 📡 API Endpoints

All endpoints support both testnet and mainnet:

- `GET /health` - Health check
- `GET /prices` - All pricing tiers
- `GET /price?tier=basic&network=eip155:84532` - Payment requirements
- `POST /pay` - Process payment & get report
- `POST /verify` - Verify payment (for facilitators)

---

## 🧪 Testing the Live API

Once deployed, test with:

```bash
# Health check
curl https://your-deployed-url.com/health

# Get prices
curl https://your-deployed-url.com/prices

# Get payment requirements for Base Mainnet
curl "https://your-deployed-url.com/price?tier=deep&network=eip155:8453"
```

---

## 🔒 Security Features

- ✅ EIP-3009 signature verification
- ✅ Payment amount validation
- ✅ Timing checks (validAfter/validBefore)
- ✅ Payee address verification
- ✅ Network validation

---

## 📁 Files Structure

```
orchestration/agents/code/x402-merchant/
├── server.js                 # Main Express server
├── api/index.js              # Vercel serverless handler
├── package.json              # Dependencies
├── Dockerfile                # Container config
├── render.yaml               # Render Blueprint
├── vercel.json               # Vercel config
├── .github/workflows/        # GitHub Actions
│   └── deploy.yml
├── README.md                 # Full documentation
├── test-client.js            # Test examples
└── sample-reports/           # Sample outputs
```

---

## 🔄 Switching Testnet → Mainnet

To accept real payments on Base Mainnet:

1. **Client-side:** Change network parameter:
   ```javascript
   const network = 'eip155:8453'; // Base Mainnet
   ```

2. **USDC:** Use real USDC on Base Mainnet

3. **The merchant server already supports mainnet** - no changes needed!

---

## ⚠️ IMPORTANT NOTES

1. **Wallet Security:** The merchant wallet `0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055` must hold USDC on the appropriate network to receive payments.

2. **Facilitator:** For production, integrate with a facilitator service (like Coinbase's x402 facilitator) to execute on-chain settlements.

3. **Free Tier Limits:** 
   - Render Free: Spins down after 15 min inactivity
   - Vercel Free: 100GB bandwidth limit
   - Railway Free: $5 credit/month

4. **Custom Domain:** All platforms support custom domains in paid tiers.

---

## ✅ Deployment Checklist

- [ ] Choose platform (Render recommended)
- [ ] Deploy using one of the methods above
- [ ] Test `/health` endpoint
- [ ] Test `/prices` endpoint
- [ ] Test payment flow with testnet
- [ ] Switch to mainnet for production
- [ ] Set up facilitator for settlements
- [ ] Monitor payments

---

## 📞 Next Steps

1. **Deploy now** using Render one-click button
2. **Share the live URL** with the team
3. **Test payments** on Base Sepolia first
4. **Switch to Base Mainnet** when ready for production

---

**Built for CLAUDIA's $1M Revenue Goal** 🎯
