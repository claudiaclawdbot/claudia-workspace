# x402 Agent Intel Service - Integration Guide

**Version:** 1.0.0  
**Reading Time:** 15 minutes  
**Difficulty:** Intermediate

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Understanding x402](#understanding-x402)
3. [Step-by-Step Integration](#step-by-step-integration)
4. [Testing on Base Sepolia](#testing-on-base-sepolia)
5. [Switching to Mainnet](#switching-to-mainnet)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

Get your first intel report in under 5 minutes:

```bash
# 1. Get pricing
curl https://x402-agent-intel.vercel.app/prices

# 2. Get specific payment requirements
curl "https://x402-agent-intel.vercel.app/price?tier=basic"

# 3. Sign EIP-3009 authorization (see code below)
# 4. Submit payment and get report (see code below)
```

**Try it now:** See the complete working example in [`test-client.js`](../test-client.js)

---

## Understanding x402

### What is x402?

x402 is a crypto-native payment protocol that uses EIP-3009 (TransferWithAuthorization) for gasless, instant payments. Instead of holding API keys, you hold crypto in your wallet and sign payment authorizations.

### How It Works

```
┌─────────────┐                    ┌─────────────┐
│ Your Agent  │  1. Sign payment   │   Merchant  │
│   Wallet    │ ─────────────────> │    API      │
│             │    authorization   │             │
└─────────────┘                    └─────────────┘
                                         │
                                         │ 2. Verify
                                         │    signature
                                         v
                                   ┌─────────────┐
                                   │ Facilitator │
                                   │  (settles   │
                                   │   onchain)  │
                                   └─────────────┘
                                         │
                                         │ 3. Return
                                         │    report
                                         v
                                   ┌─────────────┐
                                   │ Intel Report│
                                   │   (JSON)    │
                                   └─────────────┘
```

### Key Concepts

| Concept | Description |
|---------|-------------|
| **EIP-3009** | Ethereum standard for gasless token transfers via signatures |
| **Authorization** | Signed message allowing transfer of specific amount |
| **Nonce** | Unique identifier preventing replay attacks |
| **Valid Window** | Time range when authorization is valid (validAfter → validBefore) |
| **Facilitator** | Service that executes the on-chain transfer |

---

## Step-by-Step Integration

### Step 1: Set Up Your Development Environment

**Prerequisites:**
- Node.js 18+ or Python 3.9+
- A wallet with testnet USDC (see [Testing section](#testing-on-base-sepolia))

**JavaScript Setup:**
```bash
mkdir my-agent && cd my-agent
npm init -y
npm install viem
```

**Python Setup:**
```bash
pip install web3 requests
```

---

### Step 2: Get Your Wallet Ready

**Create a test wallet (JavaScript):**
```javascript
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

const privateKey = generatePrivateKey();
const account = privateKeyToAccount(privateKey);
console.log('Address:', account.address);
console.log('Private Key:', privateKey);  // Save this securely!
```

**Or use an existing wallet:**
```javascript
const account = privateKeyToAccount('0x...your_private_key...');
```

---

### Step 3: Fetch Payment Requirements

```javascript
async function getPaymentRequirements(tier = 'basic') {
  const response = await fetch(
    `https://x402-agent-intel.vercel.app/price?tier=${tier}`
  );
  
  if (!response.ok) {
    throw new Error(`Failed to get price: ${response.statusText}`);
  }
  
  return await response.json();
}

// Usage
const requirements = await getPaymentRequirements('deep');
console.log('Price:', requirements.amount);  // "125000000" (6 decimals)
```

---

### Step 4: Create and Sign Authorization

```javascript
import { createWalletClient, http, keccak256, toHex, concat } from 'viem';
import { baseSepolia } from 'viem/chains';

const MERCHANT = '0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055';
const USDC = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';

const client = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http()
});

// Generate unique nonce
function generateNonce() {
  const timestamp = BigInt(Date.now());
  const random = BigInt(Math.floor(Math.random() * 1e18));
  return keccak256(concat([toHex(timestamp), toHex(random)]));
}

async function createAuthorization(requirements) {
  const now = Math.floor(Date.now() / 1000);
  
  const authorization = {
    from: account.address,
    to: MERCHANT,
    value: requirements.amount,
    validAfter: now.toString(),
    validBefore: (now + 600).toString(),  // Valid for 10 minutes
    nonce: generateNonce()
  };
  
  return authorization;
}

async function signAuthorization(authorization) {
  const domain = {
    name: 'USDC',
    version: '2',
    chainId: 84532,  // Base Sepolia
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
  
  return signature;
}

// Usage
const auth = await createAuthorization(requirements);
const signature = await signAuthorization(auth);
```

---

### Step 5: Submit Payment and Get Report

```javascript
async function submitPayment(requirements, authorization, signature, topic) {
  const payload = {
    x402Version: 2,
    resource: {
      url: 'https://x402-agent-intel.vercel.app/pay',
      description: `Agent Intel: ${topic}`,
      mimeType: 'application/json'
    },
    accepted: requirements,
    payload: {
      signature,
      authorization
    }
  };
  
  const response = await fetch('https://x402-agent-intel.vercel.app/pay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Payment failed: ${error.error} - ${error.message}`);
  }
  
  return await response.json();
}

// Usage
const result = await submitPayment(
  requirements,
  auth,
  signature,
  'DeFi Trends 2025'
);

console.log('Payment verified:', result.payment.verified);
console.log('Report:', result.report);
```

---

### Step 6: Handle the Response

```javascript
function handleIntelReport(result) {
  const { payment, report, settlement } = result;
  
  console.log(`✅ Payment of ${payment.amount} USDC verified`);
  console.log(`📊 Report ID: ${report.reportId}`);
  console.log(`📈 Confidence: ${report.confidenceScore * 100}%`);
  console.log(`⏱️ Read time: ${report.estimatedReadTime}`);
  
  // Access report data based on tier
  switch (report.type) {
    case 'quick_summary':
      console.log('Summary:', report.summary);
      console.log('Key Points:', report.keyPoints);
      break;
      
    case 'full_research_report':
      console.log('Executive Summary:', report.executiveSummary);
      console.log('Trends:', report.sections.trends);
      break;
      
    case 'custom_multi_source_analysis':
      console.log('Analysis:', report.analysis);
      console.log('Raw Data:', report.rawData);
      break;
  }
  
  return report;
}
```

---

## Testing on Base Sepolia

### Get Testnet USDC

**Option 1: Circle Faucet**
1. Go to https://faucet.circle.com
2. Connect your wallet
3. Select "Base Sepolia"
4. Request USDC

**Option 2: Bridge from Sepolia**
1. Get Sepolia ETH from https://sepoliafaucet.com
2. Use https://bridge.base.org to bridge to Base Sepolia
3. Get USDC from testnet DEXs

**Option 3: Direct Contract (for devs)**
```javascript
// Call the faucet function on Base Sepolia USDC
const USDC_FAUCET = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
// Note: Circle's testnet USDC has a faucet function for testing
```

### Verify Your Balance

```javascript
import { createPublicClient, http, formatUnits } from 'viem';
import { baseSepolia } from 'viem/chains';

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http()
});

const USDC_ABI = [{
  "inputs": [{"name": "account", "type": "address"}],
  "name": "balanceOf",
  "outputs": [{"name": "", "type": "uint256"}],
  "stateMutability": "view",
  "type": "function"
}];

const balance = await publicClient.readContract({
  address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  abi: USDC_ABI,
  functionName: 'balanceOf',
  args: [account.address]
});

console.log(`Balance: ${formatUnits(balance, 6)} USDC`);
```

### Test Your Integration

Run this complete test:

```javascript
async function runTest() {
  console.log('🧪 Testing x402 Agent Intel Integration\n');
  
  // 1. Check health
  console.log('1. Checking service health...');
  const health = await fetch('https://x402-agent-intel.vercel.app/health');
  console.log('   ✅ Service is healthy\n');
  
  // 2. Get pricing
  console.log('2. Fetching pricing...');
  const prices = await fetch('https://x402-agent-intel.vercel.app/prices');
  const priceData = await prices.json();
  console.log('   Tiers:', Object.keys(priceData.tiers).join(', '));
  console.log('   Networks:', priceData.supportedNetworks.map(n => n.name).join(', '));
  console.log();
  
  // 3. Get payment requirements
  console.log('3. Getting payment requirements for basic tier...');
  const req = await getPaymentRequirements('basic');
  console.log(`   Amount: ${req.amount} USDC`);
  console.log(`   Asset: ${req.asset}\n`);
  
  // 4. Create authorization
  console.log('4. Creating authorization...');
  const auth = await createAuthorization(req);
  console.log(`   From: ${auth.from}`);
  console.log(`   To: ${auth.to}`);
  console.log(`   Value: ${auth.value}\n`);
  
  // 5. Sign
  console.log('5. Signing authorization...');
  const sig = await signAuthorization(auth);
  console.log(`   Signature: ${sig.slice(0, 20)}...\n`);
  
  // 6. Submit payment
  console.log('6. Submitting payment...');
  try {
    const result = await submitPayment(req, auth, sig, 'Test Topic');
    console.log('   ✅ Payment successful!');
    console.log(`   Report ID: ${result.report.reportId}`);
    console.log(`   Topic: ${result.report.topic}`);
    console.log(`   Confidence: ${result.report.confidenceScore}`);
  } catch (err) {
    console.log('   ❌ Payment failed:', err.message);
  }
}

runTest();
```

---

## Switching to Mainnet

When you're ready to go live, make these changes:

### 1. Update Network Configuration

```javascript
// From Base Sepolia
const chain = baseSepolia;
const chainId = 84532;
const usdcAddress = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';

// To Base Mainnet
const chain = base;  // import { base } from 'viem/chains'
const chainId = 8453;
const usdcAddress = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
```

### 2. Update API Endpoint

```javascript
// Testnet
const API_BASE = 'https://x402-agent-intel.vercel.app';

// Mainnet (when available)
const API_BASE = 'https://api.x402-agent-intel.com';
```

### 3. Verify Production Setup

```javascript
async function verifyProductionSetup() {
  const checks = {
    network: false,
    balance: false,
    allowance: false
  };
  
  // Check network
  const chainId = await walletClient.getChainId();
  checks.network = chainId === 8453;  // Base mainnet
  
  // Check USDC balance
  const balance = await publicClient.readContract({
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    abi: USDC_ABI,
    functionName: 'balanceOf',
    args: [account.address]
  });
  checks.balance = balance > 0;
  
  // Check allowance (if using a facilitator contract)
  // ...
  
  console.log('Production checks:', checks);
  return Object.values(checks).every(Boolean);
}
```

### 4. Mainnet USDC Addresses

| Network | Chain ID | USDC Address |
|---------|----------|--------------|
| Base Mainnet | 8453 | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |
| Ethereum | 1 | `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` |
| Arbitrum | 42161 | `0xaf88d065e77c8cC2239327C5EDb3A432268e5831` |
| Optimism | 10 | `0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85` |

---

## Best Practices

### Security

1. **Never hardcode private keys**
   ```javascript
   // ❌ Bad
   const key = '0xabc123...';
   
   // ✅ Good
   const key = process.env.WALLET_PRIVATE_KEY;
   ```

2. **Validate all responses**
   ```javascript
   if (!result.payment?.verified) {
     throw new Error('Payment not verified');
   }
   ```

3. **Use short valid windows**
   ```javascript
   // Valid for 5 minutes max
   validBefore: (now + 300).toString()
   ```

### Performance

1. **Cache pricing data**
   ```javascript
   const priceCache = new Map();
   
   async function getCachedPrice(tier) {
     if (priceCache.has(tier)) {
       return priceCache.get(tier);
     }
     const price = await getPaymentRequirements(tier);
     priceCache.set(tier, price);
     return price;
   }
   ```

2. **Retry with exponential backoff**
   ```javascript
   async function submitWithRetry(payload, maxRetries = 3) {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await submitPayment(payload);
       } catch (err) {
         if (i === maxRetries - 1) throw err;
         await sleep(1000 * Math.pow(2, i));
       }
     }
   }
   ```

### Error Handling

```javascript
class PaymentError extends Error {
  constructor(code, message, details) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

async function safeSubmitPayment(payload) {
  try {
    const response = await fetch('/pay', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const error = await response.json();
      
      switch (response.status) {
        case 402:
          throw new PaymentError(
            'PAYMENT_FAILED',
            error.message,
            error
          );
        case 429:
          throw new PaymentError(
            'RATE_LIMITED',
            'Too many requests',
            { retryAfter: 60 }
          );
        default:
          throw new PaymentError(
            'UNKNOWN_ERROR',
            error.message
          );
      }
    }
    
    return await response.json();
  } catch (err) {
    console.error('Payment failed:', err);
    throw err;
  }
}
```

---

## Troubleshooting

### Common Issues

#### "Invalid EIP-3009 signature"

**Causes:**
- Wrong domain separator
- Wrong chain ID
- Wrong USDC contract address
- Malformed authorization object

**Fix:**
```javascript
// Double-check your domain
const domain = {
  name: 'USDC',      // Must be exactly 'USDC'
  version: '2',      // Must be exactly '2'
  chainId: 84532,    // Must match the network
  verifyingContract: '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
};
```

#### "Authorization expired"

**Cause:** `validBefore` timestamp is in the past.

**Fix:**
```javascript
const now = Math.floor(Date.now() / 1000);
const auth = {
  validAfter: now.toString(),
  validBefore: (now + 600).toString()  // 10 min window
};
```

#### "Payment amount mismatch"

**Cause:** Authorization value doesn't match the price tier.

**Fix:**
```javascript
// Always use the exact amount from /price endpoint
const requirements = await getPaymentRequirements('basic');
authorization.value = requirements.amount;  // Don't modify
```

#### "Nonce already used"

**Cause:** Reusing a nonce.

**Fix:**
```javascript
// Always generate fresh nonce
function generateNonce() {
  return keccak256(concat([
    toHex(Date.now()),
    toHex(Math.random())
  ]));
}
```

### Debug Mode

Enable detailed logging:

```javascript
const DEBUG = true;

function log(...args) {
  if (DEBUG) console.log('[x402]', ...args);
}

// Use throughout your code
log('Creating authorization:', auth);
log('Domain:', domain);
log('Types:', types);
```

### Getting Help

1. **Check the API docs:** [API.md](./API.md)
2. **Run the test client:** `node test-client.js`
3. **Check your wallet:** Verify USDC balance on Base Sepolia
4. **Join Discord:** https://discord.gg/x402
5. **Open an issue:** https://github.com/claudia/x402-merchant/issues

---

## Next Steps

- [ ] Complete the [Quick Start](#quick-start)
- [ ] Test on [Base Sepolia](#testing-on-base-sepolia)
- [ ] Review [Best Practices](#best-practices)
- [ ] Read the full [API Documentation](./API.md)
- [ ] Join the community Discord

---

**Happy building! 🚀**
