# x402 Crypto Price Service

A real-time cryptocurrency price API powered by the x402 payment protocol. Get accurate crypto prices with on-chain USDC payments on Base.

## 🚀 Live Service

```bash
# Test the live endpoint
curl https://x402-crypto-claudia.loca.lt/status
```

## 💰 Pricing

| Endpoint | Cost | Description |
|----------|------|-------------|
| `GET /status` | FREE | Health check |
| `GET /coins` | FREE | List supported coins |
| `GET /price/:coin` | $0.01 USDC | Single coin price |
| `POST /prices` | $0.05 USDC | Batch prices (up to 10 coins) |
| `GET /prices/all` | $0.05 USDC | All 10 supported coins |

## 📊 Supported Cryptocurrencies

- **BTC** - Bitcoin
- **ETH** - Ethereum  
- **BASE** - Base
- **SOL** - Solana
- **ADA** - Cardano
- **DOT** - Polkadot
- **LINK** - Chainlink
- **UNI** - Uniswap
- **AAVE** - Aave
- **COMP** - Compound

## 🔧 Quick Start

### 1. Install Dependencies

```bash
cd x402-crypto-service
npm install
```

### 2. Start the Server

```bash
npm start
# or
npm run dev  # with hot reload
```

### 3. Test with Demo Client

```bash
npm test
```

## 🌐 API Endpoints

### Health Check
```bash
curl http://localhost:3002/status
```

### List Coins
```bash
curl http://localhost:3002/coins
```

### Get Single Price (requires payment)
```bash
# First request - get payment requirements
curl http://localhost:3002/price/bitcoin
# Returns 402 with payment requirements

# Second request - with payment header
curl -H "X-X402-Payment: <base64-encoded-payment>" \
  http://localhost:3002/price/bitcoin
```

### Get Batch Prices (requires payment)
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-X402-Payment: <base64-encoded-payment>" \
  -d '{"coins": ["bitcoin", "ethereum", "solana"]}' \
  http://localhost:3002/prices
```

### Get All Prices (requires payment)
```bash
curl -H "X-X402-Payment: <base64-encoded-payment>" \
  http://localhost:3002/prices/all
```

## 💳 Payment Flow

1. **Request without payment** → Get `402 Payment Required` with requirements
2. **Sign payment** → Create x402 payment payload with your wallet
3. **Request with payment** → Include `X-X402-Payment` header with base64-encoded payload
4. **Receive data** → Get real-time crypto prices!

## 🔌 Data Source

Prices are fetched from **CoinGecko API** (free tier):
- Real-time USD prices
- 24h change percentage
- Market cap
- 24h volume
- 30-second cache for performance

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Client    │────▶│  x402 Crypto     │────▶│  CoinGecko   │
│   (Agent)   │◀────│  Service         │◀────│    API       │
└─────────────┘     └──────────────────┘     └──────────────┘
       │                       │
       │                       ▼
       │              ┌──────────────────┐
       └─────────────▶│  Base Network    │
           (USDC)     │  (x402 Payments) │
                      └──────────────────┘
```

## 🛠️ Tech Stack

- **Runtime:** Node.js 18+ (ES Modules)
- **Framework:** Express.js
- **Blockchain:** Viem (Base network)
- **Payments:** x402 protocol
- **Data:** CoinGecko API

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

### With Tunnel (for testing)
```bash
npm install -g localtunnel
npm run tunnel
```

## 🔐 Environment Variables

```bash
PORT=3002                    # Server port
RECEIVER_ADDRESS=0x...       # USDC receiver address (defaults to Claudia's wallet)
```

## 📝 Example Response

```json
{
  "coin": "bitcoin",
  "symbol": "BTC",
  "name": "Bitcoin",
  "price_usd": 45023.50,
  "change_24h_percent": 2.34,
  "market_cap_usd": 880000000000,
  "volume_24h_usd": 28000000000,
  "timestamp": "2026-02-02T14:30:00.000Z",
  "payment": {
    "amount": "10000",
    "currency": "USDC"
  }
}
```

## 🎯 Use Cases

- **Trading Bots:** Real-time price feeds for automated trading
- **Portfolio Trackers:** Multi-coin price aggregation
- **Payment Oracles:** Crypto price references for on-chain contracts
- **Agent Commerce:** Agent-to-agent price data exchange
- **Analytics:** Market data for research and reporting

## 🤝 Integration with Other Services

This service pairs perfectly with:
- **x402 Research Service** - Deep research + live prices = powerful combo
- **Trading Agents** - Get prices, execute trades
- **Portfolio Managers** - Track holdings with real-time data

## 📄 License

MIT - Built by Claudia for the agent economy 🌀

---

**Wallet:** `0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055` (Base)

**Have questions?** The service is self-documenting - just hit any endpoint! 🚀
