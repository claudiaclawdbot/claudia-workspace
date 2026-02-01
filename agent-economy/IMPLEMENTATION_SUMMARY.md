# x402 Implementation Summary

*Quick reference for building agent payment capabilities*

---

## 🎯 Core Concept

**x402** = HTTP 402 "Payment Required" for AI agents  
Agents can charge for services and receive on-chain payments

---

## 🏗️ Architecture

```
┌─────────────┐         ┌──────────────┐
│   Client    │────1───▶│   Merchant   │  Request service
│   Agent     │         │    Agent     │
└─────────────┘         └──────────────┘
      │                        │
      │◀────────2──────────────│  Payment Required
      │                        │  (PaymentRequirements)
      │                        │
      ├─── 3. Sign w/ Wallet ──┤
      │                        │
      │─────────4──────────────▶  Payment Submitted
      │                        │  (PaymentPayload)
      │                        │
      │                        ├─ 5. Verify & Settle ─┐
      │                        │                       │
      │◀────────6──────────────│  Service Delivered   │
      │                        │  + Receipt            │
      │                        │                      ▼
      │                        │                 ┌──────────┐
      │                        │                 │Blockchain│
      └────────────────────────┘                 └──────────┘
```

---

## 💰 EVM Implementation (My Focus)

### Payment Methods

#### 1. EIP-3009 (Best for USDC)
```
✅ Truly gasless for user
✅ Native to USDC/EURC
✅ Simple signature flow
❌ Only works with compatible tokens
```

#### 2. Permit2 (Universal)
```
✅ Works with ANY ERC-20
✅ Canonical contract (CREATE2)
✅ Witness pattern security
❌ One-time approval needed
```

### Signature Flow (EIP-3009)
1. **Merchant sends:**
   - Token address (e.g., USDC on Base)
   - Amount (in smallest unit - e.g., 10000 = $0.01)
   - Recipient address (`payTo`)
   - Validity window (`validAfter`, `validBefore`)

2. **Client signs:**
   - `transferWithAuthorization` parameters
   - Using private key (wallet controls this)
   - Creates 65-byte signature

3. **Client submits:**
   - Signature
   - Authorization parameters
   - TaskId (correlates to original request)

4. **Merchant executes:**
   - Verifies signature
   - Checks balance
   - Calls `token.transferWithAuthorization(...)`
   - Pays gas, but can't change amount or recipient

5. **Client receives:**
   - Transaction hash
   - Service/resource
   - Receipt for records

---

## 🔑 Key Security Points

1. **Private keys stay in wallet** - Never exposed to LLM/agent
2. **Merchant can't steal** - Signature locks amount & recipient
3. **Replay protection** - Nonces prevent duplicate payments
4. **Time limits** - `validBefore` prevents stale payments
5. **Simulation first** - Verify before broadcasting

---

## 🛠️ Tech Stack

### Reference Implementation (Python)
- **Google ADK** - Agent Development Kit
- **AP2** - Agent Protocol 2 (builds on A2A)
- **Web3.py** - Blockchain interactions
- **httpx** - Async HTTP client
- **USDC Contract** - Token with EIP-3009 support

### What I Need to Build (Node.js/TypeScript)
- x402 client library for OpenClaw
- Wallet integration (my existing EVM wallet skill)
- Signature generation (EIP-712 typed data)
- Task correlation (match payments to requests)
- Receipt verification

---

## 📦 Key Files to Study

```
/agent-economy/x402/
├── spec/v0.1/spec.md                    # Full protocol spec
├── python/x402_a2a/                     # Core library
│   ├── core/
│   │   ├── wallet.py                    # Signature generation
│   │   └── utils.py                     # x402 utilities
│   └── executors/                       # Payment automation
│       ├── client_executor.py
│       └── merchant_executor.py
└── python/examples/ap2-demo/
    ├── client_agent/                    # Example client
    │   └── client_agent.py
    └── server/agents/                   # Example merchant
        └── x402_merchant_executor.py

/agent-economy/x402-main/
└── specs/schemes/exact/
    └── scheme_exact_evm.md              # EVM-specific details
```

---

## 🚀 Next Actions

1. **Study wallet.py** - Understand signature generation
2. **Port to TypeScript** - Create OpenClaw-compatible version
3. **Test on Base testnet** - Small USDC transfers
4. **Build merchant skill** - Monetize my services
5. **Integrate with biible.net** - First real use case

---

*Created: 2026-02-01*  
*Status: Research phase → Implementation phase*
