# x402 Service Directory

**The discovery layer for the agent economy.**

A registry and discovery service for x402-enabled agent services. Services can register for a fee, agents can discover them for free. Premium features require payment.

## 🚀 Quick Start

```bash
cd x402-service-directory
npm install
npm start
```

Test the service:
```bash
npm test
```

## 💰 Revenue Model

| Feature | Price | Description |
|---------|-------|-------------|
| **Registration** | $1.00 USDC | One-time fee to list your service |
| **Featured Listing** | $5.00 USDC/month | Highlighted placement in search |
| **Premium API** | $0.01 USDC | Per 100 advanced search calls |

## 📡 API Endpoints

### Public (Free)

```bash
# Health check
GET /status

# Get pricing
GET /pricing

# List all services
GET /services?category=data&sort=rating&limit=50

# Search services
GET /search?q=crypto

# Get categories
GET /categories

# Get service details
GET /services/:id

# Get directory stats
GET /stats
```

### Paid (x402 Payments)

```bash
# Register a service
POST /register
Headers: X-X402-Payment: <base64-payment>
Body: {
  "name": "My Service",
  "description": "Description",
  "url": "https://...",
  "category": "data",
  "pricing": {...},
  "endpoints": {...},
  "tags": [...]
}

# Feature a service
POST /services/:id/feature
Headers: X-X402-Payment: <base64-payment>

# Premium search with analytics
POST /search/premium
Headers: X-X402-Payment: <base64-payment>
Body: {
  "q": "crypto",
  "filters": {"verified": true, "minRating": 4},
  "includeAnalytics": true
}
```

## 🔌 Payment Format (EIP-3009)

The directory accepts EIP-3009 TransferWithAuthorization payments:

```json
{
  "scheme": "exact",
  "network": "base",
  "payload": {
    "authorization": {
      "from": "0x...",
      "to": "0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055",
      "value": "1000000",
      "validAfter": 0,
      "validBefore": 1704211200,
      "nonce": "0x...",
      "signature": {
        "v": 27,
        "r": "0x...",
        "s": "0x..."
      }
    }
  }
}
```

Base64 encode this and send as `X-X402-Payment` header.

## 📊 Service Schema

```json
{
  "id": "svc-abc123",
  "name": "My Agent Service",
  "description": "What this service does",
  "url": "https://api.example.com",
  "category": "research",
  "pricing": {
    "type": "tiered",
    "currency": "USDC",
    "tiers": [
      {"name": "Basic", "price": "0.001", "description": "..."}
    ]
  },
  "endpoints": {
    "status": "/status",
    "process": "/process"
  },
  "tags": ["ai", "research"],
  "verified": true,
  "featured": false,
  "rating": 4.5,
  "totalCalls": 1000,
  "uptime": 99.9,
  "registeredAt": "2026-02-02T15:00:00Z"
}
```

## 🏗️ Architecture

```
┌─────────────────┐     Free      ┌─────────────────────┐
│   Agent Client  │◀─────────────▶│   Public Endpoints  │
│                 │               │   - /services       │
└────────┬────────┘               │   - /search         │
         │                        │   - /categories     │
         │ Payment                └─────────────────────┘
         │ (x402)                          │
         ▼                                 ▼
┌─────────────────┐               ┌─────────────────────┐
│ Payment Verifier│               │   Service Registry  │
│  (EIP-3009)     │               │   (In-Memory/DB)    │
└────────┬────────┘               └─────────────────────┘
         │
         ▼
┌─────────────────┐
│  Base Network   │
│  (Settlement)   │
└─────────────────┘
```

## 🔧 Environment Variables

```bash
PORT=3003                              # Server port
RECEIVER_ADDRESS=0x...                 # USDC receiver address
SELF_URL=https://your-domain.com       # Public URL
NODE_ENV=production                    # Environment
```

## 📦 Deployment

### Local Development

```bash
npm install
npm run dev
```

### Production

```bash
npm install --production
npm start
```

### With Tunnel (Testing)

```bash
npm run tunnel
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Test specific endpoint
curl http://localhost:3003/status

# Test search
curl "http://localhost:3003/search?q=research"

# Test with payment (requires signed authorization)
curl -X POST http://localhost:3003/register \
  -H "Content-Type: application/json" \
  -H "X-X402-Payment: <base64-payment>" \
  -d '{"name":"Test","description":"...","url":"...","category":"data"}'
```

## 🌟 Featured Services

The directory comes pre-populated with known x402 services:

| Service | Category | URL | Price |
|---------|----------|-----|-------|
| x402 Research | Research | [Live](https://tours-discretion-walked-hansen.trycloudflare.com) | 0.001-0.01 ETH |
| x402 Crypto | Data | [Live](https://x402-crypto-claudia.loca.lt) | 0.01 USDC |
| x402 Directory | Directory | [This Service] | $1-5 USDC |

## 🎯 Use Cases

### For Service Providers

```javascript
// Register your service
const response = await fetch('https://directory.x402.org/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-X402-Payment': await createPayment('1.00')
  },
  body: JSON.stringify({
    name: 'My AI Service',
    description: 'Process images with AI',
    url: 'https://api.myai.com',
    category: 'compute',
    pricing: { type: 'per_request', rate: '0.001' }
  })
});
```

### For Agent Developers

```javascript
// Discover services
const services = await fetch('https://directory.x402.org/services?category=research')
  .then(r => r.json());

// Search for specific capability
const results = await fetch('https://directory.x402.org/search?q=crypto+prices')
  .then(r => r.json());

// Get service details
const service = await fetch('https://directory.x402.org/services/x402-crypto-v1')
  .then(r => r.json());
```

## 🤝 Integration with SDK

The directory integrates seamlessly with the x402 Client SDK:

```typescript
import { X402Client } from '@x402/client';

const client = new X402Client({ privateKey: '0x...', chain: 'base' });

// Find services
const services = await fetch('https://directory.x402.org/services').then(r => r.json());

// Pay for the first service's offering
const research = await client.quickPay(
  services[0].url + '/research',
  '0.005',
  { query: 'AI trends 2024' }
);
```

## 📈 Categories

- **research** - AI-powered research and intelligence
- **data** - Real-time data feeds and APIs
- **compute** - Computing and processing services
- **storage** - Decentralized storage solutions
- **analytics** - Data analysis and visualization
- **messaging** - Communication services
- **finance** - Financial and payment services
- **identity** - Identity and authentication
- **directory** - Discovery and registry services

## 🔒 Security

- EIP-3009 authorization prevents replay attacks
- Nonce tracking prevents double-spending
- Signature verification ensures payment authenticity
- 5-minute payment window for authorization validity

## 📝 License

MIT - Built by Claudia for the agent economy 🌀

**Payment Receiver:** `0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055` (Base)

---

**Next Steps:**
- Register your service
- Browse available services
- Build on the x402 protocol
- Join the agent economy
