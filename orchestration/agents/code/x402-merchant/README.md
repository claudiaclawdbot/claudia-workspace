# x402 Merchant - Agent Intel as a Service

A working x402 payment endpoint that accepts crypto payments (USDC via EIP-3009) and provides research reports to agents who can't browse the web.

## Overview

This service allows AI agents to purchase intelligence reports using crypto payments through the x402 protocol. Built for CLAUDIA's $1M revenue goal.

**Merchant Address:** `0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055`

## Features

- ✅ x402 protocol compliant (v2)
- ✅ EIP-3009 signature verification
- ✅ Three pricing tiers (Basic, Deep, Custom)
- ✅ JSON intel reports
- ✅ Facilitator verification endpoint

## Pricing Tiers

| Tier | Price (USDC) | Description | Report Type |
|------|--------------|-------------|-------------|
| Basic | $25 | Quick summary of research topic | Summary |
| Deep | $125 | Full research report with analysis | Full Report |
| Custom | $250 | Multi-source analysis with raw data | Custom Analysis |

## Quick Start

### 1. Install Dependencies

```bash
cd orchestration/agents/code/x402-merchant
npm install
```

### 2. Set Environment Variables (Optional)

```bash
export MERCHANT_ADDRESS=0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055
export PORT=4020
```

### 3. Start Server

```bash
npm start
```

Server will start on `http://localhost:4020`

## API Endpoints

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

## Testing

### 1. Test Health Check
```bash
curl http://localhost:4020/health
```

### 2. Test Pricing
```bash
curl http://localhost:4020/prices
curl "http://localhost:4020/price?tier=deep&network=eip155:84532"
```

### 3. Test Payment (Requires signed EIP-3009 payload)
```bash
curl -X POST http://localhost:4020/pay \
  -H "Content-Type: application/json" \
  -d @test-payload.json
```

See `test-client.js` for a complete test example.

## Supported Networks

- **Base Sepolia** (`eip155:84532`) - Recommended
- **Sepolia** (`eip155:11155111`)

## USDC Addresses

- Base Sepolia: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- Sepolia: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`

## Architecture

```
┌─────────────┐     x402 Payment      ┌─────────────────┐
│   Client    │ ────────────────────> │  Merchant API   │
│   (Agent)   │                       │  (This Service) │
└─────────────┘                       └─────────────────┘
                                              │
                                              │ EIP-3009
                                              │ Verification
                                              v
                                       ┌─────────────────┐
                                       │  Intel Report   │
                                       │   Generator     │
                                       └─────────────────┘
```

## Integration with x402 Facilitators

This endpoint is compatible with Coinbase's x402 facilitators. The `/verify` endpoint follows the facilitator API specification.

## Report Formats

### Basic Tier
- Quick summary
- 3-5 key points
- Source count
- Confidence score
- 2-minute read time

### Deep Tier
- Executive summary
- Market overview section
- Trend analysis with data points
- Risk assessment
- 8-minute read time

### Custom Tier
- Multi-source aggregation
- Comparative analysis
- Raw data access (JSON)
- Custom filters applied
- 15-minute read time

## Future Enhancements

- [ ] Real web scraping integration
- [ ] Database storage for reports
- [ ] Webhook notifications
- [ ] Subscription model
- [ ] Rate limiting
- [ ] API key authentication

## License

MIT - Built for CLAUDIA's Agent Economy
