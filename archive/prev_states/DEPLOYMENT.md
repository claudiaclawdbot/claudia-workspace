# x402 Services Deployment Guide

Complete deployment instructions for the x402 agent-to-agent payment ecosystem to permanent hosting platforms.

## Overview

This guide covers deployment of three x402-enabled services:

| Service | Port | Description | Pricing |
|---------|------|-------------|---------|
| Research Service | 4020 | AI-powered research reports | $0.10 USDC/report |
| Crypto Service | 3002 | Real-time crypto prices | $0.01-0.05 USDC |
| Gateway | 3003 | Service discovery & routing | 5% gateway fee |

## Prerequisites

- A [Fly.io](https://fly.io) account OR [Railway](https://railway.app) account
- [Docker](https://docker.com) installed locally (optional, for testing)
- Your wallet address: `0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055`

---

## Option 1: Fly.io Deployment

### 1. Install Fly CLI

```bash
# macOS/Linux
curl -L https://fly.io/install.sh | sh

# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex
```

### 2. Authenticate

```bash
fly auth login
```

### 3. Deploy Research Service

```bash
cd orchestration/agents/code/x402-research-service

# Copy the Fly config
cp ../../../x402-ecosystem/fly.research.toml fly.toml

# Create the app (first time only)
fly apps create x402-research-service

# Set secrets (replace with your actual values)
fly secrets set OPENROUTER_API_KEY=your_key_here
fly secrets set WALLET_PRIVATE_KEY=your_key_here

# Deploy
fly deploy

# Check status
fly status
fly logs
```

### 4. Deploy Crypto Service

```bash
cd orchestration/agents/code/x402-crypto-service

# Copy the Fly config
cp ../../../x402-ecosystem/fly.crypto.toml fly.toml

# Create the app
fly apps create x402-crypto-service

# Deploy
fly deploy

# Check status
fly status
fly logs
```

### 5. Deploy Gateway

```bash
cd x402-gateway

# Copy the Fly config
cp ../x402-ecosystem/fly.gateway.toml fly.toml

# Create the app
fly apps create x402-gateway

# Deploy
fly deploy

# Check status
fly status
fly logs
```

### 6. Get URLs

```bash
# Get public URLs for each service
fly apps open -a x402-research-service
fly apps open -a x402-crypto-service
fly apps open -a x402-gateway
```

---

## Option 2: Railway Deployment

### 1. Install Railway CLI

```bash
npm install -g @railway/cli
```

### 2. Authenticate

```bash
railway login
```

### 3. Deploy Research Service

```bash
cd orchestration/agents/code/x402-research-service

# Copy Railway config
cp ../../../x402-ecosystem/railway.research.json railway.json

# Copy Dockerfile (uses multi-stage build)
cp ../../../x402-ecosystem/Dockerfile.research Dockerfile

# Initialize project (first time)
railway init --name x402-research

# Add environment variables
railway variables --set OPENROUTER_API_KEY=your_key_here
railway variables --set WALLET_PRIVATE_KEY=your_key_here

# Deploy
railway up

# Get domain
railway domain
```

### 4. Deploy Crypto Service

```bash
cd orchestration/agents/code/x402-crypto-service

# Copy configs
cp ../../../x402-ecosystem/railway.crypto.json railway.json
cp ../../../x402-ecosystem/Dockerfile.crypto Dockerfile

# Initialize
railway init --name x402-crypto

# Deploy
railway up

# Get domain
railway domain
```

### 5. Deploy Gateway

```bash
cd x402-gateway

# Copy configs
cp ../x402-ecosystem/railway.gateway.json railway.json
cp ../x402-ecosystem/Dockerfile.gateway Dockerfile

# Initialize
railway init --name x402-gateway

# Deploy
railway up

# Get domain
railway domain
```

---

## Platform Comparison

| Feature | Fly.io | Railway |
|---------|--------|---------|
| **Free Tier** | $5/mo credit | $5/mo + 500 hours |
| **Pricing** | Pay per machine + bandwidth | Pay per resource usage |
| **Global CDN** | Yes (anycast) | Yes |
| **Custom Domains** | Free SSL | Custom domain support |
| **Auto-scaling** | Yes | Yes |
| **Sleep on idle** | Yes (configurable) | No (always on) |
| **Logs** | Real-time CLI | Dashboard + CLI |
| **Secrets** | fly secrets | Dashboard + CLI |

### Recommendations

- **Fly.io**: Best for services that can sleep (cost savings), global edge deployment
- **Railway**: Best for simpler deployment, always-on services, dashboard experience

---

## Testing Deployments

### Research Service

```bash
curl https://your-research-service.fly.dev/status

# Should return:
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "wallet": { "address": "0x1Bcc..." }
  }
}
```

### Crypto Service

```bash
curl https://your-crypto-service.fly.dev/status
curl https://your-crypto-service.fly.dev/coins
```

### Gateway

```bash
curl https://your-gateway.fly.dev/health
curl https://your-gateway.fly.dev/services
```

---

## Environment Variables

### Research Service

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 4020) |
| `NODE_ENV` | No | Environment (production/development) |
| `OPENROUTER_API_KEY` | Yes | API key for AI research |
| `WALLET_PRIVATE_KEY` | Yes | For blockchain interactions |
| `COINBASE_API_KEY` | No | For Coinbase SDK features |

### Crypto Service

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 3002) |
| `NODE_ENV` | No | Environment mode |
| `RECEIVER_ADDRESS` | Yes | Payment receiver address |

### Gateway

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 3003) |
| `NODE_ENV` | No | Environment mode |

---

## Updating Services

### Fly.io

```bash
cd <service-directory>
fly deploy
```

### Railway

```bash
cd <service-directory>
railway up
```

---

## Monitoring & Logs

### Fly.io

```bash
# Real-time logs
fly logs -a x402-research-service
fly logs -a x402-crypto-service
fly logs -a x402-gateway

# Metrics
fly status -a x402-research-service
fly vm status -a x402-research-service
```

### Railway

```bash
# CLI logs
railway logs

# Or use the Railway dashboard for:
# - Metrics
# - CPU/Memory usage
# - Deployment history
```

---

## Domain Configuration

### Fly.io Custom Domain

```bash
fly certs create your-domain.com -a x402-research-service
# Then add the DNS records shown
```

### Railway Custom Domain

1. Go to Railway dashboard
2. Select your service
3. Go to Settings → Domains
4. Add your custom domain
5. Follow DNS instructions

---

## Troubleshooting

### Build Failures

```bash
# Fly.io: Check build logs
fly deploy --build-only

# Railway: Check build logs in dashboard
railway logs --build
```

### Service Unhealthy

```bash
# Check if health endpoint responds
fly logs -a <app-name>

# SSH into machine
fly ssh console -a <app-name>

# Check if port is listening
fly ssh console -a <app-name> -C "netstat -tlnp"
```

### Memory Issues

For Fly.io, increase memory in `fly.toml`:
```toml
[[vm]]
memory_mb = 2048  # Increase from 1024
```

---

## Production Checklist

- [ ] All services deployed and responding
- [ ] Health checks passing
- [ ] Environment variables set
- [ ] Secrets configured (API keys, private keys)
- [ ] Custom domains configured (optional)
- [ ] Monitoring enabled
- [ ] SSL certificates active
- [ ] Load testing performed (optional)

---

## Next Steps

1. **Update service registry** - Add your deployed URLs to `services.json` in the gateway
2. **Test payments** - Send real x402 payments to verify flow
3. **Monitor revenue** - Track payment transactions to your wallet
4. **Scale up** - Increase machine count based on traffic

---

## Support

- **Fly.io Docs**: https://fly.io/docs/
- **Railway Docs**: https://docs.railway.app/
- **x402 Protocol**: https://x402.org

---

*Built for the agent-to-agent economy* 🤖💰
