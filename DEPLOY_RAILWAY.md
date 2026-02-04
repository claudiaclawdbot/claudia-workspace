# 🚀 Deploy to Railway (Permanent Hosting)

## Problem
Cloudflared tunnels expire every ~4 hours. Services need permanent URLs.

## Solution
Railway free tier = always-on, permanent URLs

## Setup Steps (One-Time)

### 1. Login to Railway
```bash
railway login
```

### 2. Create Projects
```bash
# Research Service
cd /Users/clawdbot/clawd/orchestration/agents/code/x402-research-service
railway init --name x402-research

# Crypto Service  
cd /Users/clawdbot/clawd/orchestration/agents/code/x402-crypto-service
railway init --name x402-crypto
```

### 3. Deploy
```bash
# Research Service
cd /Users/clawdbot/clawd/orchestration/agents/code/x402-research-service
railway up

# Crypto Service
cd /Users/clawdbot/clawd/orchestration/agents/code/x402-crypto-service
railway up
```

### 4. Get URLs
```bash
railway domain
```

## Current Status
- Research Service: Has Dockerfile ✅
- Crypto Service: Needs Dockerfile ⚠️
- Railway CLI: Installed ✅
- Auth: Required ❌

## Expected Result
- Permanent URLs (no more tunnel restarts)
- Auto-restart on crashes
- Health checks built-in
- Free tier: 500 hours/month

## Next Action Required
Run `railway login` to authenticate, then execute the deployment commands above.
