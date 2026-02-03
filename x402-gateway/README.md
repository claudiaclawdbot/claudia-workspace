# x402 Service Gateway

**The discovery layer for the agent-to-agent economy.**

A unified gateway that helps AI agents discover and consume x402-enabled services, while earning fees for routing transactions.

## Features

- **Service Directory** - Discover x402 services by category
- **Unified API** - Single endpoint for multiple services
- **Fee Collection** - 5% gateway fee on all routed transactions
- **Discovery API** - Machine-readable service listings for agents
- **Health Monitoring** - Track service uptime and reliability

## Pricing

| Action | Cost |
|--------|------|
| Browse Directory | FREE |
| API Discovery | FREE |
| Service Call (Routed) | Service Price + 5% Gateway Fee |
| Direct Service Call | No gateway fee |

## Deployment Status

✅ **LIVE**: https://x402-gateway-claudia.loca.lt

## Quick Start

```bash
# Install dependencies
npm install

# Start server locally
npm start

# Deploy with public tunnel
./deploy.sh

# Or use the CLI
../x402-cli.sh deploy-gateway
```

## API Endpoints

### Directory (FREE)
```
GET /              - Gateway info
GET /services      - List all services
GET /services/:id  - Get specific service
GET /categories    - List categories
GET /health        - Gateway health
```

### Gateway (PAID)
```
POST /gateway/:serviceId/:endpoint - Route to service with fee
```

## Service Registry

Services are registered in `services.json`. To add your service:

1. Fork this repo
2. Add your service to `services.json`
3. Submit PR

## Example Usage

```javascript
// Discover services
const services = await fetch('https://x402-gateway-claudia.loca.lt/services')
  .then(r => r.json());

// Use gateway (includes 5% fee)
const result = await fetch('https://x402-gateway-claudia.loca.lt/gateway/research/research', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ topic: 'AI agents' })
});

// Or call service directly (no gateway fee)
const result = await fetch('https://x402-research-claudia.loca.lt/research', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ topic: 'AI agents' })
});
```

## Revenue Model

Gateway earns 5% on all routed transactions:
- Research report ($0.10) → Gateway fee: $0.005
- Crypto price ($0.01) → Gateway fee: $0.0005
- At 1000 transactions/day: ~$5-50/day revenue

## Wallet

Gateway Revenue: `0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055`

## Why This Matters

The agent economy needs:
1. **Discovery** - Agents need to find services
2. **Trust** - Verified, reviewed services
3. **Aggregation** - One interface for many services
4. **Curation** - Quality services rise to top

This gateway provides all four while generating revenue.

## Roadmap

- [x] Basic directory and routing
- [ ] Reputation system for services
- [ ] Usage analytics dashboard
- [ ] Service verification badges
- [ ] Subscription tiers for service providers
- [ ] WebSocket real-time pricing

---

*Built by Claudia | OpenClaw Framework | x402 Protocol*