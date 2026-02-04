# API Documentation

## Table of Contents

- [Configuration](#configuration)
- [Wallet](#wallet)
- [Service Discovery](#service-discovery)
- [Payments](#payments)
- [Types](#types)

---

## Configuration

### `getConfig()`

Returns the current CLI configuration.

```typescript
import { getConfig } from 'x402-cli';

const config = getConfig();
console.log(config.wallet.address);
```

**Returns:** `CLIConfig`

---

### `setWalletConfig(wallet)`

Updates the wallet configuration.

```typescript
import { setWalletConfig } from 'x402-cli';

setWalletConfig({
  privateKey: '0x...',
  address: '0x...',
  network: 'base-sepolia'
});
```

**Parameters:**
- `wallet` - Partial wallet configuration object

---

### `hasWallet()`

Checks if a wallet is configured.

```typescript
import { hasWallet } from 'x402-cli';

if (hasWallet()) {
  console.log('Wallet is ready');
}
```

**Returns:** `boolean`

---

### `generateNewWallet()`

Generates a new Ethereum wallet.

```typescript
import { generateNewWallet } from 'x402-cli';

const { privateKey, address } = generateNewWallet();
console.log(`New address: ${address}`);
```

**Returns:** `{ privateKey: string; address: string }`

---

## Wallet

### `getBalance(address, network?)`

Gets the ETH and USDC balance for an address.

```typescript
import { getBalance } from 'x402-cli';

const balance = await getBalance('0x...', 'base-sepolia');
console.log(`ETH: ${balance.eth}`);
console.log(`USDC: ${balance.usdc}`);
```

**Parameters:**
- `address` - Ethereum address
- `network` - Optional network override

**Returns:** `{ eth: string; usdc: string; network: string }`

---

### `sendPayment(to, amount, token, network?)`

Sends a payment transaction.

```typescript
import { sendPayment } from 'x402-cli';

const { txHash } = await sendPayment(
  '0x...',
  '100000', // 0.10 USDC (6 decimals)
  'USDC'
);
console.log(`Transaction: ${txHash}`);
```

**Parameters:**
- `to` - Recipient address
- `amount` - Amount in smallest unit (wei for ETH, 6 decimals for USDC)
- `token` - Token symbol ('ETH' or 'USDC')
- `network` - Optional network override

**Returns:** `{ txHash: string }`

---

### `getExplorerUrl(txHash, network)`

Returns the block explorer URL for a transaction.

```typescript
import { getExplorerUrl } from 'x402-cli';

const url = getExplorerUrl('0x...', 'base-sepolia');
console.log(url); // https://sepolia.basescan.org/tx/0x...
```

**Returns:** `string`

---

## Service Discovery

### `listServices(options?)`

Lists available x402 services.

```typescript
import { listServices } from 'x402-cli';

// All services
const allServices = await listServices();

// Filtered
const researchServices = await listServices({ 
  category: 'Research',
  featured: true 
});

// Search
const results = await listServices({ search: 'crypto' });
```

**Parameters:**
- `options.category` - Filter by category
- `options.featured` - Show only featured services
- `options.search` - Search query

**Returns:** `Service[]`

---

### `getService(id)`

Gets detailed information about a service.

```typescript
import { getService } from 'x402-cli';

const service = await getService('claudia-research');
console.log(service.name);
console.log(service.endpoints);
```

**Parameters:**
- `id` - Service identifier

**Returns:** `ServiceDetails | null`

---

### `formatPrice(service)`

Formats a service price for display.

```typescript
import { formatPrice } from 'x402-cli';

const price = formatPrice(service);
console.log(price); // "$0.10 USDC"
```

**Returns:** `string`

---

## Payments

### `executePayment(endpoint, method?, body?)`

Executes a payment to any x402-enabled endpoint.

```typescript
import { executePayment } from 'x402-cli';

// GET request
const result = await executePayment('https://api.example.com/data');

// POST request with body
const result = await executePayment(
  'https://api.example.com/analyze',
  'POST',
  { text: 'Hello world' }
);

console.log(result.receipt.txHash);
console.log(result.serviceResponse);
```

**Parameters:**
- `endpoint` - Full URL to the x402 endpoint
- `method` - HTTP method (default: 'GET')
- `body` - Request body for POST requests

**Returns:** `PaymentResponse`

---

### `payForResearch(topic)`

Pays for a research report.

```typescript
import { payForResearch } from 'x402-cli';

const result = await payForResearch('Ethereum scaling solutions');
console.log(result.serviceResponse.content);
```

**Returns:** `PaymentResponse`

---

### `payForCryptoPrice(coin)`

Pays for a single cryptocurrency price.

```typescript
import { payForCryptoPrice } from 'x402-cli';

const result = await payForCryptoPrice('bitcoin');
console.log(result.serviceResponse.price_usd);
```

**Returns:** `PaymentResponse`

---

### `payForCryptoPrices(coins)`

Pays for multiple cryptocurrency prices.

```typescript
import { payForCryptoPrices } from 'x402-cli';

const result = await payForCryptoPrices(['bitcoin', 'ethereum', 'solana']);
console.log(result.serviceResponse);
```

**Returns:** `PaymentResponse`

---

### `payForAllCryptoPrices()`

Pays for all supported cryptocurrency prices.

```typescript
import { payForAllCryptoPrices } from 'x402-cli';

const result = await payForAllCryptoPrices();
console.log(result.serviceResponse);
```

**Returns:** `PaymentResponse`

---

### `getUsageHistory()`

Gets the payment usage history.

```typescript
import { getUsageHistory } from 'x402-cli';

const history = await getUsageHistory();
for (const entry of history) {
  console.log(`${entry.endpoint}: ${entry.amount} ${entry.token}`);
}
```

**Returns:** `UsageLog[]`

---

## Types

### Service

```typescript
interface Service {
  id: string;
  name: string;
  description: string;
  url: string;
  price: {
    amount: string;
    token: string;
    decimals: number;
  };
  category: string;
  tags: string[];
  featured: boolean;
  createdAt: string;
}
```

### ServiceDetails

```typescript
interface ServiceDetails extends Service {
  endpoints: ServiceEndpoint[];
  documentation?: string;
  version?: string;
  uptime?: number;
}
```

### PaymentResponse

```typescript
interface PaymentResponse {
  receipt: PaymentReceipt;
  serviceResponse: unknown;
}
```

### PaymentReceipt

```typescript
interface PaymentReceipt {
  txHash: string;
  network: string;
  amount: string;
  token: string;
  timestamp: string;
}
```

### UsageLog

```typescript
interface UsageLog {
  endpoint: string;
  method: string;
  amount: string;
  token: string;
  txHash: string;
  status: 'success' | 'failed';
  timestamp: string;
}
```

---

## Error Handling

All async functions may throw errors. Always wrap calls in try-catch:

```typescript
import { payForResearch } from 'x402-cli';

try {
  const result = await payForResearch('AI agents');
  console.log(result);
} catch (error) {
  if (error.message.includes('insufficient funds')) {
    console.error('Not enough balance');
  } else if (error.message.includes('Payment Required')) {
    console.error('Payment was rejected');
  } else {
    console.error('Unknown error:', error);
  }
}
```

---

## Network Support

Currently supported networks:

| Network | Chain ID | Status |
|---------|----------|--------|
| Base Sepolia | 84532 | ✅ Testnet |
| Base | 8453 | ✅ Mainnet |

Use `base-sepolia` for testing (free testnet tokens available).
Use `base` for production (real USDC).
