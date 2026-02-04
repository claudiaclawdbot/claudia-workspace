/**
 * Quick Test Script for x402 Research Service
 * 
 * Usage:
 *   node test-service.js <service-url> <private-key>
 * 
 * Example:
 *   node test-service.js http://localhost:4020 0x1234...
 *   node test-service.js https://api.x402-research.com 0x1234...
 */

const { ethers } = require('ethers');

const SERVICE_URL = process.argv[2] || 'http://localhost:4020';
const PRIVATE_KEY = process.argv[3];

if (!PRIVATE_KEY) {
  console.error('❌ Error: Private key required');
  console.error('Usage: node test-service.js <service-url> <private-key>');
  process.exit(1);
}

const wallet = new ethers.Wallet(PRIVATE_KEY);

console.log('🧪 x402 Research Service Test Suite');
console.log('=====================================\n');
console.log(`Service URL: ${SERVICE_URL}`);
console.log(`Test Wallet: ${wallet.address}\n`);

async function testEndpoint(name, method, path, body = null) {
  try {
    const url = `${SERVICE_URL}${path}`;
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (body) options.body = JSON.stringify(body);
    
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ ${name}: PASSED`);
      return { success: true, data: data.data };
    } else {
      console.log(`❌ ${name}: FAILED - ${data.error?.message}`);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.log(`❌ ${name}: ERROR - ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testPaymentVerification() {
  console.log('\n📋 Testing Payment Verification...\n');
  
  const pricing = await testEndpoint('Get Pricing', 'GET', '/pricing');
  if (!pricing.success) return;
  
  const paymentAddress = pricing.data.paymentAddress;
  const expectedAmount = '0.001';
  
  // Create payment payload
  const payload = {
    sender: wallet.address,
    receiver: paymentAddress,
    amount: ethers.parseEther(expectedAmount).toString(),
    token: '0x0000000000000000000000000000000000000000',
    chainId: 8453,
    nonce: ethers.hexlify(ethers.randomBytes(32)),
    timestamp: Math.floor(Date.now() / 1000),
    metadata: { test: true }
  };
  
  // Sign payment
  const domain = {
    name: 'x402 Payment Protocol',
    version: '1',
    chainId: 8453,
    verifyingContract: '0x0000000000000000000000000000000000000000'
  };
  
  const types = {
    Payment: [
      { name: 'sender', type: 'address' },
      { name: 'receiver', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'token', type: 'address' },
      { name: 'chainId', type: 'uint256' },
      { name: 'nonce', type: 'bytes32' },
      { name: 'timestamp', type: 'uint256' },
      { name: 'metadata', type: 'bytes' }
    ]
  };
  
  const message = {
    ...payload,
    metadata: ethers.toUtf8Bytes(JSON.stringify(payload.metadata))
  };
  
  const signature = await wallet.signTypedData(domain, types, message);
  
  // Test verification endpoint
  const result = await testEndpoint('Verify Payment', 'POST', '/verify-payment', {
    expectedAmount
  }, {
    'x-x402-version': '1.0.0',
    'x-x402-network': 'base',
    'x-x402-chain-id': '8453',
    'x-x402-scheme': 'eip712',
    'x-x402-payload': Buffer.from(JSON.stringify(payload)).toString('base64'),
    'x-x402-signature': signature,
    'x-x402-timestamp': payload.timestamp.toString()
  });
  
  if (result.success) {
    console.log(`   Payment verified: ${result.data.verified}`);
    console.log(`   Sender: ${result.data.sender}`);
    console.log(`   Amount: ${result.data.amount} ETH`);
  }
}

async function runTests() {
  console.log('Running service tests...\n');
  
  // Test 1: Health check
  await testEndpoint('Health Check', 'GET', '/status');
  
  // Test 2: Service info
  const info = await testEndpoint('Service Info', 'GET', '/');
  if (info.success) {
    console.log(`   Name: ${info.data.name}`);
    console.log(`   Version: ${info.data.version}`);
  }
  
  // Test 3: Pricing
  const pricing = await testEndpoint('Pricing', 'GET', '/pricing');
  if (pricing.success) {
    console.log(`   Payment Address: ${pricing.data.paymentAddress}`);
    console.log(`   Tiers: ${pricing.data.tiers.map(t => `${t.complexity} (${t.basePrice} ETH)`).join(', ')}`);
  }
  
  // Test 4: Payment verification (if wallet has funds)
  await testPaymentVerification();
  
  console.log('\n=====================================');
  console.log('✨ Test suite complete!');
  console.log('\nNext steps:');
  console.log('  1. Fund your wallet with ETH on Base');
  console.log('  2. Run a real research request');
  console.log('  3. Check your service logs');
}

// Helper to make requests with custom headers
async function testEndpoint(name, method, path, body = null, customHeaders = {}) {
  try {
    const url = `${SERVICE_URL}${path}`;
    const options = {
      method,
      headers: { 
        'Content-Type': 'application/json',
        ...customHeaders
      }
    };
    if (body) options.body = JSON.stringify(body);
    
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ ${name}: PASSED`);
      return { success: true, data: data.data };
    } else {
      console.log(`❌ ${name}: FAILED - ${data.error?.message}`);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.log(`❌ ${name}: ERROR - ${error.message}`);
    return { success: false, error: error.message };
  }
}

runTests().catch(console.error);
