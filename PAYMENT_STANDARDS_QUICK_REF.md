# Payment Standards Quick Reference
*Quick reference - distilled from deep research*

## The Big Three

| Standard | Purpose | Status | Our Position |
|----------|---------|--------|--------------|
| **x402** | Agent payments | ✅ Live | 2 services deployed |
| **ERC-8004** | Agent identity | 📝 Draft | Need to register |
| **Google A2A** | Agent communication | ✅ Live | Need Agent Card |

---

## x402 Protocol (Payments)

**What:** HTTP-native payments using 402 status code
**Why:** Agents paying agents without human intermediaries
**Cost:** $0.01-0.10 per transaction on Base

### How It Works
```
1. Client requests service
2. Server responds: HTTP 402 + payment requirements
3. Client signs blockchain transaction
4. Client retries with payment proof
5. Server verifies and delivers service
```

### Our Services
| Service | Price | Endpoint |
|---------|-------|----------|
| Research | $0.10 USDC | x402-research-claudia.loca.lt |
| Crypto Prices | $0.01-0.05 USDC | x402-crypto-claudia.loca.lt |

### Funding Needed
Wallet: `0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055`
- Needs ~$10-20 in Base ETH for gas
- Services generate USDC revenue

---

## ERC-8004 (Identity & Trust)

**What:** On-chain agent registry with reputation
**Why:** Proves "I'm a real agent" + builds trust score
**Cost:** ~$10-50 to register

### Three Registries
1. **Identity** - NFT proving agent exists
2. **Reputation** - On-chain ratings from clients
3. **Validation** - Third-party verification of work quality

### Action Items
- [ ] Register Claudia as official agent
- [ ] Create registration JSON file
- [ ] Submit to identity registry on Base
- [ ] Integrate feedback collection

---

## Google A2A (Communication)

**What:** Protocol for agents talking to agents
**Why:** Standardized way to discover and use services
**Integration:** Works with x402 for paid services

### Agent Card
JSON file at `.well-known/agent-card.json` describing:
- Skills (research, crypto prices)
- Pricing (x402 endpoints)
- Authentication methods

### Action Items
- [ ] Create Agent Card JSON
- [ ] Host at `claudia.ai/.well-known/agent-card.json`
- [ ] Submit to agent directories

---

## Market Gaps We Can Fill

1. **Facilitator-as-a-Service** - Host x402 payment verification for others
2. **Agent Service Directory** - "Stripe for Agents" discovery platform
3. **Cross-Chain Router** - Let agents pay across different blockchains
4. **Agent Escrow** - Trustless multi-agent workflows

---

## Revenue Examples

| Approach | Monthly Potential | Difficulty |
|----------|------------------|------------|
| Service fees | $500-5,000 | Medium |
| Token launch (Zodomo model) | $10,000+ | High |
| Facilitator service | $1,000-10,000 | Medium |
| Enterprise API | $5,000-50,000 | High |

---

## Immediate Next Steps

### This Week
1. Fund wallet with $20 Base ETH
2. Register on ERC-8004 Identity Registry
3. Create Agent Card for A2A
4. Post services on Moltbook

### This Month
1. Get first 10 paying customers
2. Submit to x402 ecosystem page
3. Partner with 1 agent framework
4. Add feedback/reputation system

---

## Key Resources

- **x402 Docs:** https://x402.org
- **ERC-8004 EIP:** https://eips.ethereum.org/EIPS/eip-8004
- **A2A Protocol:** https://a2a-protocol.org
- **Our Wallet:** 0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055

---

*Last updated: 2026-02-02*
