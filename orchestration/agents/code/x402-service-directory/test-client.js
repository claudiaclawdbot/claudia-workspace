/**
 * x402 Service Directory - Test Client
 * 
 * Example client demonstrating how to interact with the directory.
 * Can be used for testing and as a reference implementation.
 */

// Configuration
const DIRECTORY_URL = process.env.DIRECTORY_URL || 'http://localhost:3003';

// Sample service data for testing registration
const sampleService = {
  name: 'Test AI Service',
  description: 'A test service for demonstrating x402 directory registration',
  url: 'https://test-service.example.com',
  category: 'compute',
  pricing: {
    type: 'per_request',
    currency: 'USDC',
    rate: '0.001'
  },
  endpoints: {
    status: '/status',
    process: '/process'
  },
  tags: ['test', 'ai', 'compute']
};

/**
 * Helper to make HTTP requests
 */
async function request(method, endpoint, body = null, headers = {}) {
  const url = `${DIRECTORY_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data = await response.json();
  
  return {
    status: response.status,
    data
  };
}

/**
 * Test 1: Get service status
 */
async function testStatus() {
  console.log('\n🧪 Test 1: Service Status');
  console.log('─'.repeat(50));
  
  const result = await request('GET', '/status');
  console.log('Status:', result.status === 200 ? '✅ OK' : '❌ Failed');
  console.log('Response:', JSON.stringify(result.data, null, 2));
  return result.status === 200;
}

/**
 * Test 2: Get pricing information
 */
async function testPricing() {
  console.log('\n🧪 Test 2: Pricing Information');
  console.log('─'.repeat(50));
  
  const result = await request('GET', '/pricing');
  console.log('Status:', result.status === 200 ? '✅ OK' : '❌ Failed');
  console.log('Registration Fee:', result.data.pricing?.registration?.amount, 'USDC');
  console.log('Featured Listing:', result.data.pricing?.featuredListing?.amount, 'USDC');
  return result.status === 200;
}

/**
 * Test 3: List services
 */
async function testListServices() {
  console.log('\n🧪 Test 3: List Services');
  console.log('─'.repeat(50));
  
  const result = await request('GET', '/services');
  console.log('Status:', result.status === 200 ? '✅ OK' : '❌ Failed');
  console.log('Total Services:', result.data.total);
  console.log('Services:');
  result.data.services.forEach((s, i) => {
    console.log(`  ${i + 1}. ${s.name} (${s.category}) - ${s.verified ? '✅' : '⚪'}`);
  });
  return result.status === 200;
}

/**
 * Test 4: Search services
 */
async function testSearch() {
  console.log('\n🧪 Test 4: Search Services');
  console.log('─'.repeat(50));
  
  const result = await request('GET', '/search?q=crypto');
  console.log('Status:', result.status === 200 ? '✅ OK' : '❌ Failed');
  console.log('Query: "crypto"');
  console.log('Results:', result.data.total);
  result.data.results.forEach((s, i) => {
    console.log(`  ${i + 1}. ${s.name}`);
  });
  return result.status === 200;
}

/**
 * Test 5: Get categories
 */
async function testCategories() {
  console.log('\n🧪 Test 5: Get Categories');
  console.log('─'.repeat(50));
  
  const result = await request('GET', '/categories');
  console.log('Status:', result.status === 200 ? '✅ OK' : '❌ Failed');
  console.log('Categories:');
  result.data.categories.forEach(c => {
    console.log(`  • ${c.name}: ${c.count} services`);
  });
  return result.status === 200;
}

/**
 * Test 6: Get service details
 */
async function testServiceDetails() {
  console.log('\n🧪 Test 6: Service Details');
  console.log('─'.repeat(50));
  
  // First get a list of services
  const list = await request('GET', '/services');
  if (list.data.services.length === 0) {
    console.log('No services to get details for');
    return false;
  }
  
  const firstId = list.data.services[0].id;
  const result = await request('GET', `/services/${firstId}`);
  console.log('Status:', result.status === 200 ? '✅ OK' : '❌ Failed');
  console.log('Service:', result.data.service?.name);
  console.log('Category:', result.data.service?.category);
  return result.status === 200;
}

/**
 * Test 7: Register service (requires payment)
 */
async function testRegister() {
  console.log('\n🧪 Test 7: Register Service (Paid)');
  console.log('─'.repeat(50));
  
  // Step 1: Try without payment (should get 402)
  const noPayment = await request('POST', '/register', sampleService);
  console.log('Without Payment - Status:', noPayment.status === 402 ? '✅ 402 Received' : '❌ Unexpected');
  
  if (noPayment.status === 402) {
    console.log('Payment Required ✅');
    console.log('Amount:', noPayment.data.paymentRequirements?.asset?.[Object.keys(noPayment.data.paymentRequirements.asset)[0]]?.amount);
    
    // For demo, we can't actually sign without a wallet
    // In production, you would:
    // 1. Create EIP-3009 authorization
    // 2. Send with X-X402-Payment header
    console.log('\n💡 To complete registration:');
    console.log('   1. Create EIP-3009 authorization');
    console.log('   2. Sign with your wallet');
    console.log('   3. Send X-X402-Payment header with base64-encoded payload');
  }
  
  return noPayment.status === 402;
}

/**
 * Test 8: Get stats
 */
async function testStats() {
  console.log('\n🧪 Test 8: Directory Statistics');
  console.log('─'.repeat(50));
  
  const result = await request('GET', '/stats');
  console.log('Status:', result.status === 200 ? '✅ OK' : '❌ Failed');
  if (result.data.stats) {
    console.log('Overview:');
    console.log('  Total Services:', result.data.stats.overview?.totalServices);
    console.log('  Verified:', result.data.stats.overview?.verifiedServices);
    console.log('  Featured:', result.data.stats.overview?.featuredServices);
    console.log('Categories:', Object.keys(result.data.stats.categories || {}).length);
  }
  return result.status === 200;
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         🌀 x402 Service Directory - Test Suite             ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log('║  URL:', DIRECTORY_URL.padEnd(49, ' '), '║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  const tests = [
    testStatus,
    testPricing,
    testListServices,
    testSearch,
    testCategories,
    testServiceDetails,
    testRegister,
    testStats
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const success = await test();
      if (success) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.error('Test error:', error.message);
      failed++;
    }
  }

  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                      Test Results                          ║');
  console.log('╠════════════════════════════════════════════════════════════╣');
  console.log(`║  ✅ Passed: ${passed.toString().padEnd(46, ' ')}║`);
  console.log(`║  ❌ Failed: ${failed.toString().padEnd(46, ' ')}║`);
  console.log('╚════════════════════════════════════════════════════════════╝');

  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
