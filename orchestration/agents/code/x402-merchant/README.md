# x402 Merchant - Agent Intel as a Service

A working x402 payment endpoint that accepts crypto payments (USDC via EIP-3009) and provides research reports to agents who can't browse the web.

## 🚀 LIVE DEPLOYMENT

### Deploy to Render (Recommended)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/claudiaclawdbot/claudia-workspace)

**One-Click Deploy Steps:**
1. Click the button above
2. Create a free Render account (if needed)
3. The service will auto-deploy from the GitHub repo
4. Your API will be live at: `https://x402-merchant-agent-intel.onrender.com`

**Manual Deploy to Render:**
1. Go to [render.com](https://render.com) and create a free account
2. Click "New +" → "Web Service"
3. Connect your GitHub repo: `claudiaclawdbot/claudia-workspace`
4. Configure:
   - **Name:** `x402-merchant-agent-intel`
   - **Root Directory:** `orchestration/agents/code/x402-merchant`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment:** Node
   - **Plan:** Free
5. Add Environment Variable:
   - `MERCHANT_ADDRESS` = `0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055`
6. Click "Create Web Service"

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd orchestration/agents/code/x402-merchant
vercel --prod
```

### Deploy to Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
cd orchestration/agents/code/x402-merchant
railway login
railway init
railway up
```

## 📋 Overview

This service allows AI agents to purchase intelligence reports using crypto payments through the x402 protocol. Built for CLAUDIA's $1M revenue goal.

**Merchant Address:** `0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055`

**Live URL:** `https://x402-merchant-agent-intel.onrender.com` (after deployment)

## 💰 Pricing Tiers

| Tier | Price (USDC) | Description | Report Type |
|------|--------------|-------------|-------------|
| Basic | $25 | Quick summary of research topic | Summary |
| Deep | $125 | Full research report with analysis | Full Report |
| Custom | $250 | Multi-source analysis with raw data | Custom Analysis |

## 🔧 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `MERCHANT_ADDRESS` | Yes | `0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055` | Wallet receiving payments |
| `PORT` | No | `4020` | Server port |

## 🌐 Network Configuration

### Base Sepolia (Testnet)
- **Network ID:** `eip155:84532`
- **USDC Address:** `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- **Use for:** Testing and development

### Base Mainnet (Production)
- **Network ID:** `eip155:8453`
- **USDC Address:** `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- **Use for:** Live production payments

## 🚀 Quick Start (Local)

### 1. Install Dependencies
```bash
cd orchestration/agents/code/x402-merchant
npm install
```

### 2. Set Environment Variables
```bash
export MERCHANT_ADDRESS=0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055
export PORT=4020
```

### 3. Start Server
```bash
npm start
```

Server will start on `http://localhost:4020`

## 📡 API Endpoints

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "x402-merchant-agent-intel",
  "merchant": "0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055"
}
```

### GET /prices
Get all pricing tiers and supported networks.

**Response:**
```json
{
  "merchant": "0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055",
  "tiers": { ... },
  "supportedNetworks": [
    { "id": "eip155:84532", "name": "Base Sepolia" },
    { "id": "eip155:11155111", "name": "Sepolia" }
  ]
}
```

### GET /price
Get PaymentRequirements for a specific tier.

**Query Parameters:**
- `network` (optional): Network ID, default `eip155:84532`
- `tier` (optional): Tier ID, default `basic`

**Response:**
```json
{
  "x402Version": 2,
  "scheme": "exact",
  "network": "eip155:84532",
  "amount": "25000000",
  "asset": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  "payTo": "0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055",
  "maxTimeoutSeconds": 300,
  "description": "Basic Intel - Quick summary of research topic",
  "mimeType": "application/json",
  "extra": {
    "assetTransferMethod": "eip3009",
    "name": "USDC",
    "version": "2",
    "tier": "basic",
    "features": ["Quick summary", "Key points", "Source links"]
  }
}
```

### POST /pay
Process payment and receive intel report.

**Request Body:** x402 PaymentPayload
```json
{
  "x402Version": 2,
  "resource": {
    "url": "https://api.example.com/intel",
    "description": "Agent Intel: DeFi Trends 2025",
    "mimeType": "application/json"
  },
  "accepted": {
    "scheme": "exact",
    "network": "eip155:84532",
    "amount": "25000000",
    "asset": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    "payTo": "0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055",
    "maxTimeoutSeconds": 300,
    "extra": {
      "assetTransferMethod": "eip3009",
      "name": "USDC",
      "version": "2"
    }
  },
  "payload": {
    "signature": "0x...",
    "authorization": {
      "from": "0x...",
      "to": "0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055",
      "value": "25000000",
      "validAfter": "...",
      "validBefore": "...",
      "nonce": "0x..."
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "payment": {
    "verified": true,
    "amount": "25000000",
    "payer": "0x...",
    "payee": "0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055",
    "network": "eip155:84532",
    "timestamp": 1234567890,
    "nonce": "0x..."
  },
  "report": {
    "reportId": "intel-1234567890-abc123",
    "timestamp": "2025-02-02T18:00:00.000Z",
    "tier": "basic",
    "topic": "DeFi Trends 2025",
    "type": "quick_summary",
    "summary": "Quick intelligence summary on \"DeFi Trends 2025\"",
    "keyPoints": [...],
    "sources": [...],
    "confidenceScore": 0.75
  },
  "settlement": {
    "status": "pending_onchain",
    "message": "Payment authorized. Settlement can be executed by facilitator."
  }
}
```

### POST /verify
Verify a payment payload (for facilitators).

**Request Body:**
```json
{
  "paymentPayload": { ... },
  "paymentRequirements": { ... }
}
```

**Response:**
```json
{
  "valid": true,
  "checks": {
    "signature": true,
    "amount": true,
    "payee": true,
    "timing": true
  }
}
```

## 🧪 Testing

### 1. Test Health Check
```bash
curl https://your-deployed-url.com/health
```

### 2. Test Pricing
```bash
curl https://your-deployed-url.com/prices
curl "https://your-deployed-url.com/price?tier=deep&network=eip155:84532"
```

### 3. Test Payment (Requires signed EIP-3009 payload)
See `test-client.js` for a complete test example.

## 🔗 Switching to Mainnet

To switch from Base Sepolia (testnet) to Base Mainnet (production):

1. Update the network configuration in your client:
```javascript
const network = 'eip155:8453'; // Base Mainnet
```

2. The merchant server will automatically support mainnet once added to `SUPPORTED_NETWORKS`:

```javascript
const SUPPORTED_NETWORKS = {
  'eip155:8453': {
    name: 'Base Mainnet',
    chain: base,
    usdcAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    usdcDecimals: 6
  }
};
```

3. Ensure your client is using real USDC on Base Mainnet for payments.

## 📦 Files

- `server.js` - Main Express server
- `api/index.js` - Vercel serverless handler
- `Dockerfile` - Container configuration
- `render.yaml` - Render deployment blueprint
- `test-client.js` - Test client example

## 🔒 Security

- EIP-3009 signature verification
- Payment amount validation
- Timing checks (validAfter/validBefore)
- Payee address verification

## 📄 License

MIT - Built for CLAUDIA's Agent Economy
