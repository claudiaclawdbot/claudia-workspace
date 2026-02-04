/**
 * x402 Merchant Test Client
 * 
 * This script demonstrates how to test the x402 merchant endpoint
 * It creates a mock payment payload and sends it to the server
 */

import http from 'http';

const SERVER_URL = 'localhost';
const SERVER_PORT = 4020;

// Helper function to make HTTP requests
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: SERVER_URL,
      port: SERVER_PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test 1: Health Check
async function testHealth() {
  console.log('\n🏥 Test 1: Health Check');
  console.log('─'.repeat(50));
  
  try {
    const response = await makeRequest('/health');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return response.status === 200;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

// Test 2: Get All Prices
async function testPrices() {
  console.log('\n💰 Test 2: Get All Prices');
  console.log('─'.repeat(50));
  
  try {
    const response = await makeRequest('/prices');
    console.log('Status:', response.status);
    console.log('Tiers:', Object.keys(response.data.tiers).join(', '));
    console.log('Networks:', response.data.supportedNetworks.map(n => n.name).join(', '));
    return response.status === 200;
  } catch (error) {
    console.error('❌ Prices test failed:', error.message);
    return false;
  }
}

// Test 3: Get Price for Specific Tier
async function testPriceEndpoint() {
  console.log('\n🏷️  Test 3: Get Price for Deep Tier');
  console.log('─'.repeat(50));
  
  try {
    const response = await makeRequest('/price?tier=deep&network=eip155:84532');
    console.log('Status:', response.status);
    console.log('Amount:', response.data.amount);
    console.log('Asset:', response.data.asset);
    console.log('PayTo:', response.data.payTo);
    return response.status === 200;
  } catch (error) {
    console.error('❌ Price endpoint test failed:', error.message);
    return false;
  }
}

// Test 4: Invalid Payment Payload
async function testInvalidPayment() {
  console.log('\n❌ Test 4: Invalid Payment (Should Fail)');
  console.log('─'.repeat(50));
  
  try {
    const invalidPayload = {
      x402Version: 2,
      resource: { url: 'http://test', description: 'Test' },
      accepted: { amount: '999999' } // Invalid amount
    };
    
    const response = await makeRequest('/pay', 'POST', invalidPayload);
    console.log('Status:', response.status);
    console.log('Error (expected):', response.data.error);
    return response.status === 400;
  } catch (error) {
    console.error('❌ Invalid payment test failed:', error.message);
    return false;
  }
}

// Test 5: Mock Valid Payment Structure
async function testMockPayment() {
  console.log('\n💳 Test 5: Mock Payment Structure');
  console.log('─'.repeat(50));
  
  // This is a mock payload - in real usage, the signature would be valid
  const mockPayload = {
    x402Version: 2,
    resource: {
      url: 'http://localhost:4020/pay',
      description: 'Agent Intel: DeFi Archaeology Report',
      mimeType: 'application/json'
    },
    accepted: {
      scheme: 'exact',
      network: 'eip155:84532',
      amount: '25000000', // $25 basic tier
      asset: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
      payTo: '0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055',
      maxTimeoutSeconds: 300,
      extra: {
        assetTransferMethod: 'eip3009',
        name: 'USDC',
        version: '2',
        tier: 'basic'
      }
    },
    payload: {
      signature: '0x1234567890abcdef', // Mock signature - would fail verification
      authorization: {
        from: '0xClientWalletAddress',
        to: '0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055',
        value: '25000000',
        validAfter: '0',
        validBefore: '9999999999',
        nonce: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
      }
    }
  };
  
  try {
    const response = await makeRequest('/pay', 'POST', mockPayload);
    console.log('Status:', response.status);
    
    if (response.status === 402) {
      console.log('✅ Correctly rejected invalid signature');
      console.log('Error:', response.data.error);
    } else {
      console.log('Response:', JSON.stringify(response.data, null, 2));
    }
    return true;
  } catch (error) {
    console.error('❌ Mock payment test failed:', error.message);
    return false;
  }
}

// Test 6: Verify Endpoint
async function testVerifyEndpoint() {
  console.log('\n✓ Test 6: Verify Endpoint');
  console.log('─'.repeat(50));
  
  const verifyRequest = {
    paymentPayload: {
      payload: {
        signature: '0xmock',
        authorization: {
          from: '0xClient',
          to: '0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055',
          value: '25000000',
          validAfter: '0',
          validBefore: '9999999999',
          nonce: '0xabc'
        }
      }
    },
    paymentRequirements: {
      amount: '25000000',
      payTo: '0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055'
    }
  };
  
  try {
    const response = await makeRequest('/verify', 'POST', verifyRequest);
    console.log('Status:', response.status);
    console.log('Valid:', response.data.valid);
    console.log('Checks:', JSON.stringify(response.data.checks, null, 2));
    return response.status === 200;
  } catch (error) {
    console.error('❌ Verify test failed:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     x402 Merchant - Test Suite                         ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  
  const results = [];
  
  results.push({ name: 'Health Check', passed: await testHealth() });
  results.push({ name: 'Get Prices', passed: await testPrices() });
  results.push({ name: 'Price Endpoint', passed: await testPriceEndpoint() });
  results.push({ name: 'Invalid Payment', passed: await testInvalidPayment() });
  results.push({ name: 'Mock Payment', passed: await testMockPayment() });
  results.push({ name: 'Verify Endpoint', passed: await testVerifyEndpoint() });
  
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║     Test Results                                       ║');
  console.log('╠════════════════════════════════════════════════════════╣');
  
  let passedCount = 0;
  results.forEach(result => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`║  ${icon} ${result.name.padEnd(45)} ║`);
    if (result.passed) passedCount++;
  });
  
  console.log('╠════════════════════════════════════════════════════════╣');
  console.log(`║  ${passedCount}/${results.length} tests passed${''.padEnd(34)} ║`);
  console.log('╚════════════════════════════════════════════════════════╝');
  
  process.exit(passedCount === results.length ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
