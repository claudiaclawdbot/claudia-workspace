# Integration Guide: Adding x402 SDK to Your Services

This guide shows how to integrate the @x402/client SDK into existing x402 services.

## For Service Consumers (Agents)

### Basic Integration

```typescript
import { X402Client } from '@x402/client';

class MyAgent {
  private client: X402Client;

  constructor(privateKey: string) {
    this.client = new X402Client({ privateKey, chain: 'base' });
  }

  async doResearch(query: string) {
    return this.client.quickPay(
      'https://tours-discretion-walked-hansen.trycloudflare.com/research',
      '0.001',
      { query, complexity: 'simple' }
    );
  }
}
```

### With Error Handling

```typescript
async function safeResearch(query: string) {
  try {
    const result = await client.pay({
      serviceUrl: 'https://api.x402-research.com/research',
      amount: '0.001',
      payload: { query, complexity: 'simple' }
    });

    if (!result.success) {
      // Payment declined
      console.error('Payment failed:', result.error);
      return null;
    }

    return result.data;

  } catch (error: any) {
    // Network or service error
    console.error('Service error:', error.message);
    return null;
  }
}
```

## For Service Providers

### Update Your Documentation

Add this to your service README:

```markdown
## Using with @x402/client SDK

```typescript
import { X402Client } from '@x402/client';

const client = new X402Client({
  privateKey: process.env.PRIVATE_KEY!,
  chain: 'base'
});

const result = await client.quickPay(
  'YOUR_SERVICE_URL',
  'PRICE_IN_ETH',
  { /* your payload */ }
);
```
```

### Register Your Service

Add your service to the SDK's discovery registry in `src/index.ts`:

```typescript
async listServices(): Promise<Array<...>> {
  return [
    // Existing services...
    {
      id: 'your-service-v1',
      name: 'Your Service Name',
      url: 'https://your-service-url.com',
      category: 'your-category',
      description: 'What your service does',
      pricing: { min: '0.001', max: '0.01', currency: 'ETH' }
    }
  ];
}
```

## Integration Checklist

### For Consumers
- [ ] Install `@x402/client`
- [ ] Set up wallet with ETH on Base
- [ ] Initialize client with private key
- [ ] Test with `client.getWalletInfo()`
- [ ] Make first payment with `client.quickPay()`
- [ ] Add error handling
- [ ] Monitor payment success/failure rates

### For Providers
- [ ] Document SDK usage in README
- [ ] Provide code examples
- [ ] Test with SDK before publishing
- [ ] Submit PR to add service to discovery
- [ ] Monitor SDK usage metrics

## Testing Integration

### Test Script

```typescript
import { X402Client } from '@x402/client';

async function testIntegration() {
  const client = new X402Client({
    privateKey: process.env.PRIVATE_KEY!,
    chain: 'base'
  });

  // Test 1: Get service info
  const info = await client.getServiceInfo('YOUR_URL');
  console.log('Service:', info.name);

  // Test 2: Check balance
  const wallet = await client.getWalletInfo();
  console.log('Balance:', wallet.balance);

  // Test 3: Make payment
  const result = await client.pay({
    serviceUrl: 'YOUR_URL/endpoint',
    amount: '0.001',
    payload: { test: true }
  });

  console.log('Success:', result.success);
  console.log('Data:', result.data);
}

testIntegration();
```

## Advanced Patterns

### Retry Logic

```typescript
async function payWithRetry(
  client: X402Client,
  request: PaymentRequest,
  maxRetries = 3
): Promise<PaymentResult> {
  for (let i = 0; i < maxRetries; i++) {
    const result = await client.pay(request);
    
    if (result.success) return result;
    
    if (result.error?.includes('insufficient')) {
      throw new Error('Insufficient funds');
    }
    
    // Wait before retry
    await new Promise(r => setTimeout(r, 1000 * (i + 1)));
  }
  
  throw new Error('Max retries exceeded');
}
```

### Batch Processing

```typescript
async function batchPay(
  client: X402Client,
  requests: Array<{ url: string; amount: string; payload: any }>
) {
  const results = await Promise.all(
    requests.map(r => 
      client.pay({
        serviceUrl: r.url,
        amount: r.amount,
        payload: r.payload
      }).catch(e => ({ success: false, error: e.message }))
    )
  );

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  return { successful, failed };
}
```

## Migration from Raw x402

If you were using raw HTTP before:

**Before:**
```typescript
const signature = await wallet.signTypedData(...);
const response = await fetch(url, {
  headers: { 'X-Payment-Proof': proof }
});
```

**After:**
```typescript
const result = await client.quickPay(url, amount, payload);
```

## Support

- SDK Issues: https://github.com/claudia/x402-client-sdk/issues
- Service Issues: Contact service provider
- General Questions: https://discord.gg/x402