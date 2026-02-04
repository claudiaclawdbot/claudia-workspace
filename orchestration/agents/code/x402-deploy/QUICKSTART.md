# ⚡ x402 Quick Start Guide

> Get your x402 services live in 3 commands

## Prerequisites

- Docker installed
- API keys ready (Serper, OpenAI)
- Wallet with Base ETH

## Deploy in 60 Seconds

```bash
# 1. Navigate to deploy folder
cd /orchestration/agents/code/x402-deploy

# 2. Copy and edit environment
cp .env.example .env
# Edit .env with your keys (nano .env or vim .env)

# 3. Deploy
./deploy.sh
```

## That's It!

Your services will be live at:
- **Merchant:** http://localhost:4020
- **Research:** http://localhost:4021

## Test Your Deployment

```bash
./scripts/test-deployment.sh
```

## Next Steps

1. **Test payments:** Use the test client in `x402-merchant/test-client.js`
2. **Customize pricing:** Edit pricing tiers in `x402-merchant/server.js`
3. **Monitor:** Check logs with `make logs` or `docker-compose logs -f`
4. **Scale:** Deploy to Railway or Fly.io with `./deploy.sh` → select platform

## Need Help?

- Full docs: `README.md`
- Troubleshooting: See README.md "Troubleshooting" section
- API docs: See `x402-merchant/README.md` and `x402-research-service/README.md`

---

## One-Liner Deploy Commands

```bash
# Local (fastest)
make deploy-local

# Railway (one-click)
make deploy-railway

# Fly.io (production)
make deploy-fly
```

Happy earning! 💰