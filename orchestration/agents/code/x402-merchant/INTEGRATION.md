# x402 Merchant Integration Guide

For AI Agents wanting to purchase intelligence from CLAUDIA's service.

## Quick Start

### 1. Check Service Health

```bash
curl http://localhost:4020/health
```

### 2. Get Pricing

```bash
curl http://localhost:4020/prices
```

### 3. Get Payment Requirements

```bash
curl "http://localhost:4020/price?tier=basic"
```

### 4. Make Payment

You'll need to:
1. Sign an EIP-3009 authorization for USDC transfer
2. Submit the payment payload to `/pay`

## Client Integration Example (JavaScript)

```javascript
import { createWalletClient, http, parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';

// Configuration
const MERCHANT_URL = 'http://localhost:4020';
const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';

// Step 1: Get payment requirements
async function getPaymentRequirements(tier = 'basic') {
  const response = await fetch(`${MERCHANT_URL}/price?tier=${tier}`);
  return await response.json();
}

// Step 2: Create EIP-3009 authorization
async function createPaymentAuthorization(walletClient, requirements) {
  const account = walletClient.account;
  const amount = BigInt(requirements.amount);
  
  // Authorization parameters
  const validAfter = Math.floor(Date.now() / 1000);
  const validBefore = validAfter + requirements.maxTimeoutSeconds;
  const nonce = `0x${Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')}`;
  
  // EIP-3009 domain
  const domain = {
    name: 'USDC',
    version: '2',
    chainId: 84532,
    verifyingContract: USDC_ADDRESS
  };
  
  // EIP-3009 types
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
  
  // Authorization message
  const message = {
    from: account.address,
    to: requirements.payTo,
    value: amount.toString(),
    validAfter: validAfter.toString(),
    validBefore: validBefore.toString(),
    nonce
  };
  
  // Sign authorization
  const signature = await walletClient.signTypedData({
    domain,
    types,
    primaryType: 'TransferWithAuthorization',
    message
  });
  
  return {
    signature,
    authorization: message
  };
}

// Step 3: Submit payment and get report
async function purchaseIntel(walletClient, tier = 'basic', topic = 'General Research') {
  // 1. Get requirements
  const requirements = await getPaymentRequirements(tier);
  
  // 2. Create authorization
  const { signature, authorization } = await createPaymentAuthorization(
    walletClient, 
    requirements
  );
  
  // 3. Build payment payload
  const paymentPayload = {
    x402Version: 2,
    resource: {
      url: `${MERCHANT_URL}/pay`,
      description: `Agent Intel: ${topic}`,
      mimeType: 'application/json'
    },
    accepted: {
      scheme: requirements.scheme,
      network: requirements.network,
      amount: requirements.amount,
      asset: requirements.asset,
      payTo: requirements.payTo,
      maxTimeoutSeconds: requirements.maxTimeoutSeconds,
      extra: requirements.extra
    },
    payload: {
      signature,
      authorization
    }
  };
  
  // 4. Submit payment
  const response = await fetch(`${MERCHANT_URL}/pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentPayload)
  });
  
  const result = await response.json();
  
  if (result.success) {
    console.log('Payment successful!');
    console.log('Report:', result.report);
    return result.report;
  } else {
    console.error('Payment failed:', result.error);
    throw new Error(result.error);
  }
}

// Usage example
async function main() {
  // Initialize wallet (replace with your private key)
  const account = privateKeyToAccount('0x...');
  const walletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http()
  });
  
  // Purchase basic intel report
  const report = await purchaseIntel(
    walletClient,
    'basic',  // Tier: basic, deep, or custom
    'DeFi Trends 2025'  // Topic
  );
  
  console.log('Received report:', report.reportId);
}

main().catch(console.error);
```

## Python Client Example

```python
import requests
import json
from web3 import Web3
from eth_account import Account
from eth_abi import encode

MERCHANT_URL = "http://localhost:4020"
USDC_ADDRESS = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"

def get_payment_requirements(tier="basic"):
    """Get payment requirements for a tier"""
    response = requests.get(f"{MERCHANT_URL}/price", params={"tier": tier})
    return response.json()

def create_eip3009_signature(account, requirements):
    """Create EIP-3009 authorization signature"""
    import time
    import secrets
    
    valid_after = int(time.time())
    valid_before = valid_after + requirements["maxTimeoutSeconds"]
    nonce = "0x" + secrets.token_hex(32)
    
    # Build EIP-712 typed data
    domain = {
        "name": "USDC",
        "version": "2",
        "chainId": 84532,
        "verifyingContract": USDC_ADDRESS
    }
    
    message = {
        "from": account.address,
        "to": requirements["payTo"],
        "value": requirements["amount"],
        "validAfter": str(valid_after),
        "validBefore": str(valid_before),
        "nonce": nonce
    }
    
    # Sign typed data (requires eth-account with EIP-712 support)
    # This is a simplified example
    return {
        "signature": "0x...",  # Actual signature
        "authorization": message
    }

def purchase_intel(private_key, tier="basic", topic="General Research"):
    """Purchase intelligence report"""
    account = Account.from_key(private_key)
    
    # Get requirements
    requirements = get_payment_requirements(tier)
    
    # Create authorization
    auth = create_eip3009_signature(account, requirements)
    
    # Build payload
    payload = {
        "x402Version": 2,
        "resource": {
            "url": f"{MERCHANT_URL}/pay",
            "description": f"Agent Intel: {topic}",
            "mimeType": "application/json"
        },
        "accepted": {
            "scheme": requirements["scheme"],
            "network": requirements["network"],
            "amount": requirements["amount"],
            "asset": requirements["asset"],
            "payTo": requirements["payTo"],
            "maxTimeoutSeconds": requirements["maxTimeoutSeconds"],
            "extra": requirements["extra"]
        },
        "payload": auth
    }
    
    # Submit payment
    response = requests.post(
        f"{MERCHANT_URL}/pay",
        json=payload
    )
    
    return response.json()

# Usage
if __name__ == "__main__":
    # Replace with your private key
    PRIVATE_KEY = "0x..."
    
    result = purchase_intel(PRIVATE_KEY, "deep", "AI Market Analysis")
    print(json.dumps(result, indent=2))
```

## Report Structure

After successful payment, you'll receive a JSON report with:

### Basic Tier
- `reportId`: Unique identifier
- `timestamp`: Generation time
- `summary`: Quick overview
- `keyPoints`: 3-5 bullet points
- `sources`: Source counts
- `confidenceScore`: 0-1 rating

### Deep Tier
Includes Basic +:
- `sections.overview`: Market overview
- `sections.trends`: Data points with trends
- `sections.risks`: Risk assessment
- More detailed sources

### Custom Tier
Includes Deep +:
- `analysis.primary`: Structured data findings
- `analysis.secondary`: Unstructured content
- `analysis.comparative`: Cross-validation
- `rawData`: Access to raw datasets

## Error Handling

Common error responses:

```json
// 400 - Bad Request
{
  "error": "Invalid payment payload",
  "message": "Missing required fields"
}

// 402 - Payment Required
{
  "error": "Payment verification failed",
  "message": "Invalid EIP-3009 signature"
}

// 402 - Authorization Expired
{
  "error": "Authorization expired",
  "validBefore": "1234567890",
  "currentTime": "1234567899"
}
```

## Testing

Test the integration without real payments:

```bash
# Start test server
npm start

# Run test suite
node test-client.js
```

## Support

For issues or questions, contact the merchant at:
- Address: `0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055`
- Service: CLAUDIA Agent Intel

## Links

- x402 Protocol: https://x402.org
- EIP-3009: https://eips.ethereum.org/EIPS/eip-3009
- USDC Contract (Base Sepolia): https://sepolia.basescan.org/token/0x036CbD53842c5426634e7929541eC2318f3dCF7e
