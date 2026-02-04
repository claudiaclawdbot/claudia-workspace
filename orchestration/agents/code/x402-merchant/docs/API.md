# x402 Agent Intel Service - API Documentation

**Version:** 1.0.0  
**Base URL:** `https://x402-agent-intel.vercel.app` (production) / `http://localhost:4020` (local)  
**Protocol:** x402 v2  
**Authentication:** EIP-3009 (TransferWithAuthorization)

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Endpoints](#endpoints)
4. [Error Codes](#error-codes)
5. [Rate Limits](#rate-limits)
6. [Code Samples](#code-samples)
7. [Webhooks](#webhooks)

---

## Overview

The x402 Agent Intel Service provides AI agents with research capabilities through a crypto-native payment protocol. Agents pay for intelligence reports using USDC via the x402 (EIP-3009) standard.

### Key Features

- **Permissionless Payments:** No API keys required—just crypto signatures
- **Instant Settlement:** Payments settle in seconds on Base/Sepolia
- **Three Report Tiers:** From quick summaries to deep multi-source analysis
- **JSON-First:** All responses are machine-readable JSON
- **Facilitator Compatible:** Works with Coinbase x402 facilitators

---

## Authentication

This API uses **EIP-3009 TransferWithAuthorization** for authentication. Instead of API keys, you cryptographically sign a payment authorization.

### EIP-3009 Overview

EIP-3009 allows gasless transfers by signing an authorization message off-chain. The signature is then verified on-chain by a facilitator.

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│ Your Agent  │ ──────> │  Merchant   │ ──────> │ Facilitator │
│             │  sig    │   API       │  verify │  (settles)  │
└─────────────┘         └─────────────┘         └─────────────┘
```

### Domain Separator (Base Sepolia)

```javascript
const DOMAIN = {
  name: 'USDC',
  version: '2',
  chainId: 84532,  // Base Sepolia
  verifyingContract: '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
};
```

### EIP-712 Types

```javascript
const EIP3009_TYPES = {
  TransferWithAuthorization: [
    { name: 'from', type: 'address' },      // Your wallet address
    { name: 'to', type: 'address' },        // Merchant address
    { name: 'value', type: 'uint256' },     // Payment amount (USDC)
    { name: 'validAfter', type: 'uint256' },  // Unix timestamp
    { name: 'validBefore', type: 'uint256' }, // Expiration timestamp
    { name: 'nonce', type: 'bytes32' }      // Unique nonce
  ]
};
```

### Generating Nonces

Generate a unique 32-byte nonce for each payment:

```javascript
import { keccak256, toHex, concat } from 'viem';

function generateNonce() {
  const timestamp = BigInt(Date.now());
  const random = BigInt(Math.floor(Math.random() * 1e18));
  return keccak256(concat([toHex(timestamp), toHex(random)]));
}
```

---

## Endpoints

### 1. GET /health

Health check and service status.

**Request:**
```bash
curl https://x402-agent-intel.vercel.app/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "x402-merchant-agent-intel",
  "merchant": "0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055",
  "uptime": 86400,
  "timestamp": "2025-02-02T18:30:00.000Z"
}
```

**HTTP Codes:**
- `200 OK` - Service is healthy
- `503 Service Unavailable` - Service is down

---

### 2. GET /prices

Get all pricing tiers and supported networks.

**Request:**
```bash
curl https://x402-agent-intel.vercel.app/prices
```

**Response:**
```json
{
  "merchant": "0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055",
  "tiers": {
    "basic": {
      "id": "basic",
      "name": "Basic Intel",
      "description": "Quick summary of research topic",
      "priceUSD": 25,
      "priceUSDC": "25000000",
      "features": ["Quick summary", "Key points", "Source links"],
      "reportType": "summary"
    },
    "deep": {
      "id": "deep",
      "name": "Deep Research",
      "description": "Full research report with analysis",
      "priceUSD": 125,
      "priceUSDC": "125000000",
      "features": ["Detailed analysis", "Market insights", "Trend data", "Risk assessment"],
      "reportType": "full_report"
    },
    "custom": {
      "id": "custom",
      "name": "Custom Analysis",
      "description": "Multi-source analysis with custom parameters",
      "priceUSD": 250,
      "priceUSDC": "250000000",
      "features": ["Multi-source aggregation", "Custom filters", "Comparative analysis", "Raw data access"],
      "reportType": "custom_analysis"
    }
  },
  "supportedNetworks": [
    { "id": "eip155:84532", "name": "Base Sepolia" },
    { "id": "eip155:11155111", "name": "Sepolia" }
  ]
}
```

---

### 3. GET /price

Get PaymentRequirements for a specific tier (used by x402 clients).

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `tier` | string | No | `basic` | Pricing tier: `basic`, `deep`, `custom` |
| `network` | string | No | `eip155:84532` | Network ID |

**Request:**
```bash
curl "https://x402-agent-intel.vercel.app/price?tier=deep&network=eip155:84532"
```

**Response:**
```json
{
  "x402Version": 2,
  "scheme": "exact",
  "network": "eip155:84532",
  "amount": "125000000",
  "asset": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  "payTo": "0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055",
  "maxTimeoutSeconds": 300,
  "description": "Deep Research - Full research report with analysis",
  "mimeType": "application/json",
  "extra": {
    "assetTransferMethod": "eip3009",
    "name": "USDC",
    "version": "2",
    "tier": "deep",
    "features": ["Detailed analysis", "Market insights", "Trend data", "Risk assessment"]
  }
}
```

**Error Responses:**

```json
// 400 Bad Request - Invalid tier
{
  "error": "Invalid tier",
  "supportedTiers": ["basic", "deep", "custom"]
}

// 400 Bad Request - Unsupported network
{
  "error": "Unsupported network",
  "supportedNetworks": ["eip155:84532", "eip155:11155111"]
}
```

---

### 4. POST /pay

Process payment and return intel report. This is the main endpoint.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**

The request body follows the x402 PaymentPayload specification:

```json
{
  "x402Version": 2,
  "resource": {
    "url": "https://x402-agent-intel.vercel.app/pay",
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
    "description": "Basic Intel - Quick summary of research topic",
    "mimeType": "application/json",
    "extra": {
      "assetTransferMethod": "eip3009",
      "name": "USDC",
      "version": "2",
      "tier": "basic",
      "features": ["Quick summary", "Key points", "Source links"]
    }
  },
  "payload": {
    "signature": "0x1a2b3c...",
    "authorization": {
      "from": "0xYourWalletAddress",
      "to": "0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055",
      "value": "25000000",
      "validAfter": "1706899200",
      "validBefore": "1706902800",
      "nonce": "0x7f8e9d..."
    }
  }
}
```

**Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `x402Version` | number | Must be `2` |
| `resource` | object | Resource being purchased |
| `resource.description` | string | Research topic (extracted from this) |
| `accepted` | object | Payment requirements being accepted |
| `accepted.amount` | string | USDC amount in base units (6 decimals) |
| `accepted.network` | string | Network ID |
| `payload.signature` | string | EIP-712 signature (hex) |
| `payload.authorization` | object | Transfer authorization details |

**Response (Success):**

```json
{
  "success": true,
  "payment": {
    "verified": true,
    "amount": "25000000",
    "payer": "0xYourWalletAddress",
    "payee": "0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055",
    "network": "eip155:84532",
    "timestamp": 1706900000,
    "nonce": "0x7f8e9d..."
  },
  "report": {
    "reportId": "intel-1706900000-abc123xyz",
    "timestamp": "2025-02-02T18:30:00.000Z",
    "tier": "basic",
    "topic": "DeFi Trends 2025",
    "merchant": "0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055",
    "generatedBy": "CLAUDIA Agent Intel Service",
    "disclaimer": "This report is generated for agent consumption...",
    "type": "quick_summary",
    "summary": "Quick intelligence summary on \"DeFi Trends 2025\"",
    "keyPoints": [
      "Market shows moderate interest in topic",
      "Recent developments indicate growing adoption",
      "Key players remain consistent with previous period"
    ],
    "sources": [
      { "name": "Web Search", "count": 5 },
      { "name": "News Feeds", "count": 3 }
    ],
    "estimatedReadTime": "2 minutes",
    "confidenceScore": 0.75
  },
  "settlement": {
    "status": "pending_onchain",
    "message": "Payment authorized. Settlement can be executed by facilitator."
  }
}
```

**Error Responses:**

```json
// 400 Bad Request - Missing fields
{
  "error": "Invalid payment payload",
  "message": "Missing required fields: payload, accepted"
}

// 400 Bad Request - Unsupported network
{
  "error": "Unsupported network",
  "network": "eip155:1"
}

// 400 Bad Request - Invalid amount
{
  "error": "Invalid payment amount",
  "amount": "1000000",
  "validAmounts": ["25000000", "125000000", "250000000"]
}

// 402 Payment Required - Invalid signature
{
  "error": "Payment verification failed",
  "message": "Invalid EIP-3009 signature"
}

// 402 Payment Required - Authorization not yet valid
{
  "error": "Authorization not yet valid",
  "validAfter": "1706900000",
  "currentTime": "1706899000"
}

// 402 Payment Required - Authorization expired
{
  "error": "Authorization expired",
  "validBefore": "1706899000",
  "currentTime": "1706900000"
}

// 402 Payment Required - Amount mismatch
{
  "error": "Payment amount mismatch",
  "expected": "25000000",
  "received": "10000000"
}

// 500 Internal Server Error
{
  "error": "Internal server error",
  "message": "Database connection failed"
}
```

---

### 5. POST /verify

Verify a payment payload (called by x402 facilitators before settlement).

**Request Body:**

```json
{
  "paymentPayload": {
    "signature": "0x1a2b3c...",
    "authorization": {
      "from": "0xYourWalletAddress",
      "to": "0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055",
      "value": "25000000",
      "validAfter": "1706899200",
      "validBefore": "1706902800",
      "nonce": "0x7f8e9d..."
    }
  },
  "paymentRequirements": {
    "scheme": "exact",
    "network": "eip155:84532",
    "amount": "25000000",
    "asset": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    "payTo": "0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055"
  }
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
  },
  "message": "Payment payload is valid"
}
```

Or if invalid:

```json
{
  "valid": false,
  "checks": {
    "signature": false,
    "amount": true,
    "payee": true,
    "timing": true
  },
  "message": "Payment verification failed"
}
```

---

## Error Codes

### HTTP Status Codes

| Code | Name | Description |
|------|------|-------------|
| `200` | OK | Request successful |
| `400` | Bad Request | Invalid request parameters |
| `402` | Payment Required | Payment verification failed |
| `404` | Not Found | Endpoint not found |
| `500` | Internal Server Error | Server-side error |
| `503` | Service Unavailable | Service temporarily unavailable |

### x402 Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| `x402_invalid_signature` | EIP-3009 signature is invalid | Check signing process and domain |
| `x402_amount_mismatch` | Payment amount doesn't match tier | Use exact amount from /price endpoint |
| `x402_expired` | Authorization has expired | Generate new authorization with future validBefore |
| `x402_not_yet_valid` | Authorization not yet active | Wait until validAfter timestamp |
| `x402_invalid_network` | Unsupported blockchain network | Use eip155:84532 or eip155:11155111 |
| `x402_nonce_reused` | Nonce has been used before | Generate new unique nonce |

---

## Rate Limits

Current rate limits (subject to change):

| Endpoint | Limit | Window |
|----------|-------|--------|
| `GET /health` | 100 requests | 1 minute |
| `GET /price` | 60 requests | 1 minute |
| `GET /prices` | 30 requests | 1 minute |
| `POST /pay` | 10 requests | 1 minute |
| `POST /verify` | 60 requests | 1 minute |

**Rate Limit Headers:**

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1706900000
```

**Rate Limit Exceeded Response:**

```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 60,
  "limit": 60,
  "window": "1 minute"
}
```

---

## Code Samples

### JavaScript (Viem)

```javascript
import { createWalletClient, http, keccak256, toHex, concat } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';

// Setup
const account = privateKeyToAccount('0x...');
const client = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http()
});

const MERCHANT = '0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055';
const USDC = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';

// Generate nonce
function generateNonce() {
  return keccak256(concat([
    toHex(Date.now()),
    toHex(Math.floor(Math.random() * 1e18))
  ]));
}

// Get price
const priceRes = await fetch('https://x402-agent-intel.vercel.app/price?tier=deep');
const requirements = await priceRes.json();

// Create authorization
const now = Math.floor(Date.now() / 1000);
const authorization = {
  from: account.address,
  to: MERCHANT,
  value: requirements.amount,  // "125000000"
  validAfter: now.toString(),
  validBefore: (now + 300).toString(),
  nonce: generateNonce()
};

// Sign EIP-3009
const domain = {
  name: 'USDC',
  version: '2',
  chainId: 84532,
  verifyingContract: USDC
};

const types = {
  TransferWithAuthorization: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'validAfter', type: 'uint256' },
    { name: 'validBefore', type: 'uint256' },
    { name: 'nonce', type: 'bytes32' }
  ]
};

const signature = await client.signTypedData({
  domain,
  types,
  primaryType: 'TransferWithAuthorization',
  message: authorization
});

// Submit payment
const paymentPayload = {
  x402Version: 2,
  resource: {
    url: 'https://x402-agent-intel.vercel.app/pay',
    description: 'Agent Intel: DeFi Trends 2025',
    mimeType: 'application/json'
  },
  accepted: requirements,
  payload: { signature, authorization }
};

const response = await fetch('https://x402-agent-intel.vercel.app/pay', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(paymentPayload)
});

const result = await response.json();
console.log('Intel Report:', result.report);
```

### Python (Web3.py)

```python
import requests
import time
import random
from web3 import Web3
from eth_account import Account

# Setup
PRIVATE_KEY = "0x..."
account = Account.from_key(PRIVATE_KEY)
MERCHANT = "0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055"
USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"

# Get price
price_res = requests.get("https://x402-agent-intel.vercel.app/price?tier=deep")
requirements = price_res.json()

# EIP-712 Domain
domain = {
    "name": "USDC",
    "version": "2",
    "chainId": 84532,
    "verifyingContract": USDC
}

# EIP-712 Types
types = {
    "TransferWithAuthorization": [
        {"name": "from", "type": "address"},
        {"name": "to", "type": "address"},
        {"name": "value", "type": "uint256"},
        {"name": "validAfter", "type": "uint256"},
        {"name": "validBefore", "type": "uint256"},
        {"name": "nonce", "type": "bytes32"}
    ]
}

# Generate authorization
now = int(time.time())
nonce = Web3.keccak(text=f"{now}-{random.randint(0, 1000000)}")

authorization = {
    "from": account.address,
    "to": MERCHANT,
    "value": requirements["amount"],
    "validAfter": str(now),
    "validBefore": str(now + 300),
    "nonce": nonce.hex()
}

# Sign EIP-712
signable_message = Account.create_eip712_message(
    domain=domain,
    types=types,
    message=authorization,
    primary_type="TransferWithAuthorization"
)
signed = account.sign_message(signable_message)

# Submit payment
payload = {
    "x402Version": 2,
    "resource": {
        "url": "https://x402-agent-intel.vercel.app/pay",
        "description": "Agent Intel: DeFi Trends 2025"
    },
    "accepted": requirements,
    "payload": {
        "signature": signed.signature.hex(),
        "authorization": authorization
    }
}

response = requests.post(
    "https://x402-agent-intel.vercel.app/pay",
    json=payload
)

result = response.json()
print(f"Report: {result['report']}")
```

### cURL

```bash
# Get price requirements
curl "https://x402-agent-intel.vercel.app/price?tier=basic"

# Submit payment (you need a valid signature)
curl -X POST "https://x402-agent-intel.vercel.app/pay" \
  -H "Content-Type: application/json" \
  -d '{
    "x402Version": 2,
    "resource": {
      "url": "https://x402-agent-intel.vercel.app/pay",
      "description": "Agent Intel: DeFi Trends 2025"
    },
    "accepted": {
      "scheme": "exact",
      "network": "eip155:84532",
      "amount": "25000000",
      "asset": "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
      "payTo": "0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055"
    },
    "payload": {
      "signature": "0x...",
      "authorization": {
        "from": "0x...",
        "to": "0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055",
        "value": "25000000",
        "validAfter": "1706899200",
        "validBefore": "1706902800",
        "nonce": "0x..."
      }
    }
  }'
```

---

## Webhooks

### Report Ready Webhook (Coming Soon)

Subscribe to receive notifications when reports are generated:

**Setup:**
```bash
curl -X POST "https://x402-agent-intel.vercel.app/webhooks" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-agent.com/webhooks/intel",
    "events": ["report.generated", "payment.confirmed"],
    "secret": "your_webhook_secret"
  }'
```

**Webhook Payload:**
```json
{
  "event": "report.generated",
  "timestamp": "2025-02-02T18:30:00.000Z",
  "data": {
    "reportId": "intel-1706900000-abc123",
    "tier": "deep",
    "topic": "DeFi Trends 2025"
  }
}
```

---

## Support

- **Documentation:** https://docs.x402-agent-intel.com
- **Discord:** https://discord.gg/x402
- **Twitter:** @x402intel
- **Email:** support@x402-agent-intel.com

---

## Changelog

### v1.0.0 (2025-02-02)
- Initial release
- Support for three pricing tiers
- EIP-3009 payment verification
- Base Sepolia and Sepolia networks
- Basic, Deep, and Custom report types
