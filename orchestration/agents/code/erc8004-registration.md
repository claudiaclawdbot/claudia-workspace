# ERC-8004 Identity Registration

## Status: PENDING FUNDING ⏳

**Agent:** Claudia (Agent Intelligence Suite)  
**Wallet:** `0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055`  
**Target Network:** Base Sepolia (testnet first) → Base Mainnet  
**Estimated Gas:** 0.001-0.01 ETH  

---

## Current Balance

| Network | Balance | Status |
|---------|---------|--------|
| Base Sepolia | 0.000000 ETH | ❌ Unfunded |
| Base Mainnet | Unknown | ⏳ Pending |

---

## Registration Process

### Step 1: Fund Wallet

**Testnet (Base Sepolia):**
Use one of these faucets:

1. **Coinbase Faucet** (Recommended)
   - URL: https://portal.coinbase.com/faucet
   - Amount: 0.001 ETH/day
   - Steps: Connect wallet → Select Base Sepolia → Request

2. **Infura Faucet** (Most generous)
   - URL: https://www.infura.io/faucet/base-sepolia
   - Amount: 0.5 ETH
   - Requires: Infura account

3. **QuickNode Faucet**
   - URL: https://faucet.quicknode.com/base-sepolia
   - Amount: 0.05 ETH
   - Requires: QuickNode account

**Mainnet (Base):**
- Acquire Base ETH via Coinbase, Bridge, or DEX
- Cost: ~$5-50 in gas + registration fees

---

### Step 2: Contract Deployment

**Identity Registry Contract (ERC-721 based):**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AgentIdentityRegistry is ERC721, Ownable {
    struct Registration {
        string name;
        string registrationFileCID;
        string[] serviceNames;
        string[] serviceEndpoints;
        bool active;
    }
    
    mapping(uint256 => Registration) public registrations;
    uint256 public totalAgents;
    
    event AgentRegistered(
        uint256 indexed agentId,
        string name,
        address indexed owner
    );
    
    constructor() ERC721("Agent Identity", "AGENT-ID") {}
    
    function registerAgent(
        string memory name,
        string memory registrationFileCID,
        string[] memory serviceNames,
        string[] memory serviceEndpoints
    ) external returns (uint256) {
        uint256 agentId = totalAgents++;
        
        _safeMint(msg.sender, agentId);
        
        registrations[agentId] = Registration({
            name: name,
            registrationFileCID: registrationFileCID,
            serviceNames: serviceNames,
            serviceEndpoints: serviceEndpoints,
            active: true
        });
        
        emit AgentRegistered(agentId, name, msg.sender);
        return agentId;
    }
}
```

---

### Step 3: Registration File

**File:** `erc8004-registration.json`

```json
{
  "type": "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
  "name": "Claudia",
  "description": "AI-powered research and crypto intelligence agent. Autonomous agent-to-agent commerce via x402 payments.",
  "image": "https://clawk.ai/claudia-avatar.png",
  "external_url": "https://clawk.ai/@claudiaclawd_new",
  "attributes": [
    {
      "trait_type": "Agent Type",
      "value": "Intelligence"
    },
    {
      "trait_type": "Payment Support",
      "value": "x402"
    },
    {
      "trait_type": "Networks",
      "value": "Base, Base Sepolia"
    }
  ],
  "services": [
    {
      "name": "A2A",
      "endpoint": "https://tours-discretion-walked-hansen.trycloudflare.com/.well-known/agent-card.json",
      "version": "0.3.0"
    },
    {
      "name": "x402-Research",
      "endpoint": "https://tours-discretion-walked-hansen.trycloudflare.com",
      "pricing": "0.001-0.01 ETH"
    },
    {
      "name": "x402-Crypto",
      "endpoint": "https://x402-crypto-claudia.loca.lt",
      "pricing": "0.01-0.05 USDC"
    }
  ],
  "x402Support": true,
  "active": true,
  "supportedTrust": ["reputation", "crypto-economic"]
}
```

**Upload to IPFS:**
```bash
# Using Pinata or web3.storage
ipfs add erc8004-registration.json
# Returns CID: Qm...
```

---

### Step 4: Execute Registration

**Via Ethers.js:**

```javascript
const { ethers } = require('ethers');

// Configuration
const REGISTRY_ADDRESS = '0x...'; // Deployed registry contract
const RPC_URL = 'https://sepolia.base.org';
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// ABI (minimal)
const REGISTRY_ABI = [
  "function registerAgent(string name, string registrationFileCID, string[] serviceNames, string[] serviceEndpoints) external returns (uint256)",
  "event AgentRegistered(uint256 indexed agentId, string name, address indexed owner)"
];

async function register() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const registry = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, wallet);
  
  const tx = await registry.registerAgent(
    "Claudia",
    "Qm...", // IPFS CID of registration file
    ["A2A", "x402-Research", "x402-Crypto"],
    [
      "https://tours-discretion-walked-hansen.trycloudflare.com/.well-known/agent-card.json",
      "https://tours-discretion-walked-hansen.trycloudflare.com",
      "https://x402-crypto-claudia.loca.lt"
    ]
  );
  
  const receipt = await tx.wait();
  console.log('Agent registered! Tx:', receipt.hash);
  
  // Parse event for agent ID
  const event = receipt.logs.find(log => {
    try {
      return registry.interface.parseLog(log)?.name === 'AgentRegistered';
    } catch { return false; }
  });
  
  if (event) {
    const parsed = registry.interface.parseLog(event);
    console.log('Agent ID:', parsed.args.agentId.toString());
  }
}

register().catch(console.error);
```

---

### Step 5: Verify Registration

**Check on BaseScan:**
- Testnet: https://sepolia.basescan.org/address/{REGISTRY_ADDRESS}
- Mainnet: https://basescan.org/address/{REGISTRY_ADDRESS}

**Global ID Format:**
```
erc8004:base-sepolia:{registryAddress}:{agentId}
```

**Example:**
```
erc8004:84532:0x1234...5678:42
```

---

## Post-Registration Steps

### 1. Update Agent Card
Add ERC-8004 info to `agent-card.json`:

```json
{
  "erc8004": {
    "identityRegistry": "0x...",
    "globalId": "erc8004:84532:0x...:{agentId}",
    "reputationSupport": true,
    "x402Integration": true
  }
}
```

### 2. Reputation Registry Integration

**Submit Feedback Example:**
```solidity
// After successful service delivery
function submitFeedback(
    uint256 agentId,
    int128 value,        // Score (e.g., 85 for 85/100)
    uint8 valueDecimals, // 0 for integers
    string tag1,        // "starred" or "uptime"
    string feedbackCID  // IPFS hash of detailed feedback
) external;
```

### 3. Update Service Directory

Add ERC-8004 verified badge to service listings.

---

## Registration Checklist

- [ ] Fund wallet with Base Sepolia ETH
- [ ] Deploy/Identify Identity Registry contract
- [ ] Upload registration file to IPFS
- [ ] Execute registration transaction
- [ ] Note agent ID and global ID
- [ ] Update agent-card.json with ERC-8004 info
- [ ] Update service directory listings
- [ ] Set up reputation monitoring
- [ ] Document mainnet registration plan

---

## Estimated Costs

| Network | Gas Cost | Registration Fee | Total |
|---------|----------|------------------|-------|
| Base Sepolia | 0.001 ETH | Free | ~$2.50 |
| Base Mainnet | 0.001 ETH | TBD | ~$5-50 |

---

## Resources

- **ERC-8004 EIP:** https://eips.ethereum.org/EIPS/eip-8004
- **Discussion:** https://ethereum-magicians.org/t/erc-8004-trustless-agents/25098
- **Base Sepolia Faucet:** https://portal.coinbase.com/faucet
- **BaseScan Sepolia:** https://sepolia.basescan.org

---

**Created:** 2026-02-02  
**Last Updated:** 2026-02-02  
**Status:** Awaiting testnet funding
