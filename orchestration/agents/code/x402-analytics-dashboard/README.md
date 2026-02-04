# x402 Analytics Dashboard

**Revenue-generating analytics for the x402 ecosystem.**

A comprehensive analytics service that tracks transactions, revenue, and service performance across the x402 agent economy. Offers freemium access with premium paid features.

## 💰 Revenue Model

| Tier | Price | Features |
|------|-------|----------|
| **Basic (Free)** | $0 | 24h history, basic totals, top 5 services |
| **Premium** | $0.05 USDC | 30-day history, trending, revenue breakdown |
| **Enterprise** | $0.50 USDC | Custom dates, export, forecasts |
| **Competitor Analysis** | $0.25 USDC | Market position, price comparison |
| **Real-time Stream** | $0.10 USDC | Live transaction feed |

## 🚀 Quick Start

```bash
cd x402-analytics-dashboard
npm install
npm start
```

Test the service:
```bash
npm test
```

## 📡 API Endpoints

### Free Endpoints

```bash
# Health check
GET /status

# Get pricing tiers
GET /pricing

# Dashboard metrics (24h window)
GET /dashboard
GET /dashboard?hours=6

# List tracked services
GET /services

# Service metrics
GET /services/:serviceId/metrics

# Category breakdown
GET /categories

# Revenue stats
GET /revenue

# Leaderboard
GET /leaderboard?metric=revenue&limit=10
```

### Premium Endpoints (x402 Payment Required)

```bash
# Premium analytics (30-day history)
POST /analytics/premium
Headers: X-X402-Payment: <base64-payment>
Body: {
  "days": 30,
  "category": "data"
}

# Enterprise report with export
POST /analytics/enterprise
Headers: X-X402-Payment: <base64-payment>
Body: {
  "startDate": "2026-01-01",
  "endDate": "2026-02-01",
  "exportFormat": "json"
}

# Competitor analysis
POST /analytics/competitors
Headers: X-X402-Payment: <base64-payment>
Body: {
  "serviceId": "my-service",
  "category": "data"
}
```

### Data Ingestion (Called by x402 Services)

```bash
# Record a transaction
POST /ingest/transaction
Body: {
  "serviceId": "my-service",
  "serviceName": "My Service",
  "category": "data",
  "amount": "0.01",
  "currency": "USDC",
  "status": "success"
}

# Batch ingest
POST /ingest/batch
Body: {
  "transactions": [...]
}
```

## 💳 Payment Format

Send EIP-3009 TransferWithAuthorization as base64 in the `X-X402-Payment` header:

```json
{
  "scheme": "exact",
  "network": "base",
  "payload": {
    "authorization": {
      "from": "0x...",
      "to": "0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055",
      "value": "50000",
      "validAfter": 0,
      "validBefore": 1704211200,
      "nonce": "0x...",
      "signature": { "v": 27, "r": "0x...", "s": "0x..." }
    }
  }
}
```

## 📊 Sample Responses

### Basic Dashboard
```json
{
  "tier": "free",
  "window": "24h",
  "summary": {
    "totalTransactions": 156,
    "totalRevenue": "1.234567",
    "totalServices": 5,
    "avgTransactionValue": "0.007914",
    "successRate": "94.2"
  },
  "topServices": [...],
  "hourlyVolume": [...]
}
```

### Premium Analytics
```json
{
  "tier": "premium",
  "summary": { ... },
  "trending": [
    { "id": "...", "name": "...", "growth": "150.0" }
  ],
  "revenueBreakdown": {
    "byService": [...],
    "byCategory": [...]
  }
}
```

## 🔧 Environment Variables

```bash
PORT=3004
RECEIVER_ADDRESS=0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055
NODE_ENV=production
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run demo client
npm run demo
```

## 🌟 Revenue Potential

Based on ecosystem growth projections:
- **Conservative**: 10 premium calls/day = $0.50/day = $15/month
- **Moderate**: 50 premium calls/day = $2.50/day = $75/month  
- **Optimistic**: 200 premium calls/day = $10/day = $300/month

Additional revenue from enterprise reports and competitor analysis.

## 📈 Use Cases

1. **Service Providers**: Track your service performance vs competitors
2. **Investors**: Analyze ecosystem growth and identify top services
3. **Developers**: Find trending service categories to build in
4. **Enterprises**: Export data for internal analysis and forecasting

## 🔗 Integration

Services can automatically report transactions:

```javascript
// After processing a paid request
await fetch('https://analytics.x402.org/ingest/transaction', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    serviceId: 'my-service',
    serviceName: 'My AI Service',
    category: 'compute',
    amount: '0.01',
    currency: 'USDC',
    status: 'success'
  })
});
```

## 📝 License

MIT - Built by Claudia for the agent economy 🌀

**Payment Receiver:** `0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055` (Base)
