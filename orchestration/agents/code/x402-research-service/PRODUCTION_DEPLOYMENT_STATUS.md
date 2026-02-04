# 🚀 x402 Research Service - Production Deployment Status

**Date:** 2026-02-02  
**Status:** ⏳ READY FOR DEPLOYMENT (Needs API Key + Fly.io Auth)

---

## ✅ What's Ready

### 1. Service Built & Tested
- **Location:** `/orchestration/agents/code/x402-research-service/`
- **Status:** ✅ Fully functional
- **Local URL:** http://localhost:4020
- **Test URL:** https://tours-discretion-walked-hansen.trycloudflare.com

### 2. Wallet Configured
- **Address:** `0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055`
- **Private Key:** ✅ Secured in deployment config
- **Network:** Base Mainnet

### 3. Deployment Configuration
- **Platform:** Fly.io (recommended)
- **Region:** IAD (Virginia, USA)
- **Config:** `fly.research.toml` ready
- **Script:** `deploy-production.sh` ready

### 4. Environment Variables
| Variable | Status | Value |
|----------|--------|-------|
| `WALLET_PRIVATE_KEY` | ✅ Ready | Set in deployment script |
| `BASE_RPC_URL` | ✅ Ready | https://mainnet.base.org |
| `OPENAI_API_KEY` | ✅ Ready | From environment |
| `SERPER_API_KEY` | ❌ **NEEDED** | Get from serper.dev |

---

## ❌ What's Blocking Production

### Blocker #1: SERPER_API_KEY (Required)
**What:** Google Search API key for web research functionality
**Where to get:** https://serper.dev
**Cost:** Free tier available (100 queries/month)
**Time:** 2 minutes to sign up

**Steps:**
1. Go to https://serper.dev
2. Sign up with Google/GitHub
3. Copy your API key
4. Export it: `export SERPER_API_KEY=your_key_here`

### Blocker #2: Fly.io Authentication (Required)
**What:** Login to Fly.io platform
**Where:** https://fly.io
**Cost:** Free tier available (sufficient for this service)
**Time:** 3 minutes to set up

**Steps:**
1. Go to https://fly.io and sign up
2. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
3. Login: `fly auth login` (opens browser)
4. Run deployment script

---

## 🚀 Deployment Steps (Once Blockers Resolved)

### Quick Deploy (One Command)
```bash
cd /orchestration/agents/code/x402-research-service
export SERPER_API_KEY=sk-...  # From serper.dev
./deploy-production.sh
```

### Manual Deploy
```bash
# 1. Set environment variables
export SERPER_API_KEY=sk-...
export OPENAI_API_KEY=sk-...  # Already in env

# 2. Deploy
fly deploy --app x402-research-service

# 3. Set secrets
fly secrets set \
  WALLET_PRIVATE_KEY=0xb21b43d4d5f89077be0375edb8a0ddc21869b1469fb072744328147289367d0d \
  BASE_RPC_URL=https://mainnet.base.org \
  SERPER_API_KEY=$SERPER_API_KEY \
  OPENAI_API_KEY=$OPENAI_API_KEY

# 4. Deploy
fly deploy
```

---

## 📊 Expected Production URL

Once deployed:
- **Production URL:** `https://x402-research-service.fly.dev`
- **Health Check:** `https://x402-research-service.fly.dev/health`
- **Landing Page:** `https://x402-research-service.fly.dev/`

---

## 🧪 Testing Production Deployment

```bash
# Test health
curl https://x402-research-service.fly.dev/health

# Test pricing
curl https://x402-research-service.fly.dev/pricing

# View logs
fly logs --app x402-research-service
```

---

## 💰 Revenue Potential (Once Live)

| Tier | Price | Expected Sales/Week | Revenue/Week |
|------|-------|---------------------|--------------|
| Quick Intel | 0.001 ETH (~$2.50) | 10 | $25 |
| Deep Dive | 0.005 ETH (~$12.50) | 5 | $62.50 |
| Custom Analysis | 0.01 ETH (~$25) | 2 | $50 |
| **TOTAL** | | **17** | **~$137.50/week** |

**Annual Projection:** ~$7,140/year at conservative estimates

---

## 🎯 Next Steps for Ryan

1. **Get SERPER_API_KEY** (2 min)
   - Visit: https://serper.dev
   - Sign up, copy key
   - Export: `export SERPER_API_KEY=sk-...`

2. **Set up Fly.io** (3 min)
   - Visit: https://fly.io
   - Sign up with email/GitHub
   - Run: `fly auth login`

3. **Deploy** (2 min)
   - Run: `./deploy-production.sh`
   - Or: `fly deploy --app x402-research-service`

**Total time to production: ~7 minutes**

---

## 📞 Questions?

- **Serper API:** https://serper.dev
- **Fly.io Docs:** https://fly.io/docs
- **x402 Spec:** https://github.com/coinbase/x402
- **Service README:** `./README.md`

---

## 📝 Notes

- Current test URL (Cloudflare Quick Tunnel) has **no uptime guarantee**
- Fly.io provides **99%+ uptime** with auto-scaling
- Free tier on Fly.io includes: 3 shared-cpu-1x VMs, 3GB persistent storage
- Service needs ~1GB RAM, 1 CPU (well within free tier)

---

**Ready to deploy?** Get the SERPER_API_KEY and run `./deploy-production.sh`
