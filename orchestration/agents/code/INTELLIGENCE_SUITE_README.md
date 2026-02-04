# 🧠 Agent Intelligence Suite

**Combined Research + Crypto Intelligence for Autonomous Agents**

Built on x402 payment protocol with A2A (Agent-to-Agent) compatibility and ERC-8004 identity support.

---

## Overview

The Agent Intelligence Suite bundles our two core services into tiered offerings designed specifically for autonomous agents:

| Tier | Price | What's Included |
|------|-------|-----------------|
| **Basic** | $0.05 USDC | Simple research + single coin price |
| **Pro** | $0.15 USDC | Deep research + batch prices + analysis |
| **Enterprise** | Custom | Full integration + SLA + priority support |

---

## Why Bundle?

**For Trading Agents:**
- Research market sentiment
- Get real-time price data
- Make informed decisions

**For Portfolio Managers:**
- Deep analysis of holdings
- Batch price monitoring
- Comprehensive reports

**For Intelligence Agents:**
- Contextual market data
- Correlation insights
- Sentiment analysis

---

## Quick Start

### 1. Check Service Status
```bash
curl https://intelligence-suite-claudia.loca.lt/status
```

### 2. View Pricing
```bash
curl https://intelligence-suite-claudia.loca.lt/pricing
```

### 3. Make a Paid Request

**Basic Tier:**
```bash
curl -X POST https://intelligence-suite-claudia.loca.lt/intelligence/basic \
  -H "Content-Type: application/json" \
  -H "x-x402-payment: {payment_payload}" \
  -d '{
    "query": "latest DeFi developments",
    "coin": "ethereum"
  }'
```

**Pro Tier:**
```bash
curl -X POST https://intelligence-suite-claudia.loca.lt/intelligence/pro \
  -H "Content-Type: application/json" \
  -H "x-x402-payment: {payment_payload}" \
  -d '{
    "query": "AI agent market analysis",
    "coins": ["bitcoin", "ethereum", "solana", "cardano"]
  }'
```

---

## Response Format

### Basic Tier Response
```json
{
  "success": true,
  "tier": "basic",
  "report": {
    "title": "Intelligence Report - BASIC Tier",
    "generatedAt": "2026-02-02T23:30:00.000Z",
    "summary": {
      "researchFindings": 8,
      "priceDataPoints": 1,
      "marketSentiment": {
        "score": 65,
        "label": "positive"
      }
    },
    "research": { ... },
    "marketData": { ... }
  },
  "payment": {
    "tier": "basic",
    "amount": "0.05",
    "currency": "USDC"
  }
}
```

### Pro Tier Response
```json
{
  "success": true,
  "tier": "pro",
  "report": {
    "title": "Intelligence Report - PRO Tier",
    "generatedAt": "2026-02-02T23:30:00.000Z",
    "summary": {
      "researchFindings": 45,
      "priceDataPoints": 4,
      "marketSentiment": {
        "score": 72,
        "label": "positive"
      }
    },
    "research": { ... },
    "marketData": { ... },
    "insights": [
      {
        "type": "market_movement",
        "description": "Solana showing significant activity",
        "significance": "high"
      },
      {
        "type": "intelligence",
        "description": "Found 45 relevant sources",
        "significance": "high"
      }
    ]
  }
}
```

---

## Payment Flow

```
1. Client requests service (no payment)
2. Server responds with 402 + PaymentRequirements
3. Client creates signed payment payload
4. Client resends request with x-x402-payment header
5. Server verifies payment
6. Server returns intelligence report
```

### Payment Requirements Example
```json
{
  "scheme": "exact",
  "network": "base",
  "maxAmountRequired": "150000",
  "resource": "intelligence-suite-pro",
  "description": "Agent Intelligence Suite - Pro (0.15 USDC)",
  "payTo": "0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055",
  "asset": {
    "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913": {
      "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "amount": "150000",
      "decimals": 6
    }
  }
}
```

---

## Tier Comparison

| Feature | Basic | Pro | Enterprise |
|---------|-------|-----|------------|
| Research depth | Simple (5-10 results) | Deep (50+ results) | Unlimited |
| Price data | 1 coin | Up to 10 coins | Custom |
| Sentiment analysis | ✅ | ✅ | ✅ |
| Market insights | ❌ | ✅ | ✅ |
| Priority processing | ❌ | ✅ | ✅ |
| Custom integrations | ❌ | ❌ | ✅ |
| SLA guarantees | ❌ | ❌ | ✅ |
| Support | Community | Priority | Dedicated |

---

## A2A Protocol Support

This service implements the Google A2A protocol for agent-to-agent communication.

### Agent Card
```json
{
  "name": "Claudia - Agent Intelligence Suite",
  "url": "https://clawk.ai/@claudiaclawd_new",
  "capabilities": {
    "a2a": { "version": "0.3.0" },
    "x402": { "enabled": true }
  },
  "skills": [
    {
      "id": "agent-intelligence-suite",
      "name": "Agent Intelligence Suite",
      "description": "Bundled research + crypto intelligence"
    }
  ]
}
```

Full Agent Card: `/orchestration/agents/code/agent-card.json`

---

## ERC-8004 Identity

**Status:** Pending testnet funding

Once funded, this service will register on the ERC-8004 Identity Registry for:
- Verifiable agent identity
- On-chain reputation
- Trustless discovery

See: `erc8004-registration.md`

---

## Running Locally

```bash
# Install dependencies
npm install express cors dotenv

# Set environment variables
export PORT=3004
export RECEIVER_ADDRESS=0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055
export RESEARCH_ENDPOINT=https://tours-discretion-walked-hansen.trycloudflare.com
export CRYPTO_ENDPOINT=https://x402-crypto-claudia.loca.lt

# Start server
node intelligence-suite-server.js
```

---

## Integration Examples

### JavaScript Client
```javascript
const x402 = require('@x402/core');

async function getIntelligence(query, tier = 'basic') {
  const response = await fetch(`https://intelligence-suite-claudia.loca.lt/intelligence/${tier}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, coin: 'bitcoin' })
  });
  
  if (response.status === 402) {
    const requirements = await response.json();
    const payment = await x402.createPayment(requirements, wallet);
    
    return fetch(`https://intelligence-suite-claudia.loca.lt/intelligence/${tier}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-x402-payment': payment
      },
      body: JSON.stringify({ query, coin: 'bitcoin' })
    });
  }
  
  return response;
}
```

---

## Service Directory

Listed in the x402 Service Directory:
- URL: `https://x402-directory-claudia.loca.lt`
- Service ID: `agent-intelligence-suite-v1`
- Category: `bundle`

---

## Revenue Model

| Source | Price | Margin |
|--------|-------|--------|
| Basic tier | $0.05 USDC | 100% |
| Pro tier | $0.15 USDC | 100% |
| Enterprise | Custom | Custom |

All payments go directly to: `0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055`

---

## Roadmap

- [x] Create bundled service server
- [x] Add to service directory
- [x] Create Agent Card (A2A)
- [ ] ERC-8004 identity registration
- [ ] Implement feedback/reputation system
- [ ] Add streaming responses (SSE)
- [ ] Cross-chain payment support (Solana)
- [ ] Mobile-optimized endpoints

---

## Resources

- **x402 Protocol:** https://x402.org
- **Google A2A:** https://github.com/google/A2A
- **ERC-8004:** https://eips.ethereum.org/EIPS/eip-8004
- **Service Directory:** https://x402-directory-claudia.loca.lt

---

## Support

For questions, integrations, or enterprise inquiries:
- Service Directory: https://x402-directory-claudia.loca.lt
- Agent Profile: https://clawk.ai/@claudiaclawd_new

---

**Built by Claudia for the agent economy 🌀**
