/**
 * Test Suite for x402 Analytics Dashboard
 * 
 * Tests all endpoints and verifies functionality.
 */

import http from 'http';

const BASE_URL = 'http://localhost:3004';

// Simple HTTP request helper
function request(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3004,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data)
          });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

// Test runner
async function runTests() {
  console.log('🧪 Testing x402 Analytics Dashboard\n');
  
  let passed = 0;
  let failed = 0;
  
  async function test(name, fn) {
    try {
      await fn();
      console.log(`✅ ${name}`);
      passed++;
    } catch (err) {
      console.log(`❌ ${name}: ${err.message}`);
      failed++;
    }
  }
  
  // Test 1: Health check
  await test('GET /status returns healthy', async () => {
    const res = await request('/status');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (res.data.status !== 'healthy') throw new Error('Status not healthy');
    if (!res.data.transactionsTracked) throw new Error('Missing transactions tracked');
  });
  
  // Test 2: Pricing endpoint
  await test('GET /pricing returns tiers', async () => {
    const res = await request('/pricing');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!res.data.tiers) throw new Error('Missing tiers');
    if (!res.data.tiers.free || !res.data.tiers.premium) {
      throw new Error('Missing tier definitions');
    }
  });
  
  // Test 3: Dashboard (free)
  await test('GET /dashboard returns metrics', async () => {
    const res = await request('/dashboard');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (res.data.tier !== 'free') throw new Error('Wrong tier');
    if (!res.data.summary) throw new Error('Missing summary');
    if (!res.data.topServices) throw new Error('Missing top services');
  });
  
  // Test 4: Dashboard with custom hours
  await test('GET /dashboard?hours=6 respects limit', async () => {
    const res = await request('/dashboard?hours=6');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (res.data.window !== '6h') throw new Error('Wrong window');
  });
  
  // Test 5: Services list
  await test('GET /services returns service list', async () => {
    const res = await request('/services');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!Array.isArray(res.data.services)) throw new Error('Services not an array');
    if (res.data.services.length === 0) throw new Error('No services found');
  });
  
  // Test 6: Service metrics
  await test('GET /services/:id/metrics returns data', async () => {
    const res = await request('/services/x402-research-v1/metrics');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!res.data.metrics) throw new Error('Missing metrics');
  });
  
  // Test 7: Categories
  await test('GET /categories returns breakdown', async () => {
    const res = await request('/categories');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!Array.isArray(res.data.categories)) throw new Error('Categories not an array');
  });
  
  // Test 8: Revenue endpoint
  await test('GET /revenue returns revenue data', async () => {
    const res = await request('/revenue');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!res.data.revenue) throw new Error('Missing revenue data');
  });
  
  // Test 9: Leaderboard
  await test('GET /leaderboard returns rankings', async () => {
    const res = await request('/leaderboard?metric=revenue&limit=5');
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (!Array.isArray(res.data.leaderboard)) throw new Error('Leaderboard not an array');
  });
  
  // Test 10: Ingest transaction
  await test('POST /ingest/transaction records data', async () => {
    const res = await request('/ingest/transaction', 'POST', {
      serviceId: 'test-service',
      serviceName: 'Test Service',
      category: 'test',
      amount: '0.01',
      currency: 'USDC',
      status: 'success'
    });
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    if (!res.data.success) throw new Error('Transaction not recorded');
    if (!res.data.transactionId) throw new Error('Missing transaction ID');
  });
  
  // Test 11: Premium endpoint requires payment
  await test('POST /analytics/premium requires payment', async () => {
    const res = await request('/analytics/premium', 'POST', { days: 30 });
    if (res.status !== 402) throw new Error(`Expected 402, got ${res.status}`);
    if (!res.data.error.includes('Payment required')) {
      throw new Error('Wrong error message');
    }
    if (!res.data.paymentRequirements) throw new Error('Missing payment requirements');
  });
  
  // Test 12: Enterprise endpoint requires payment
  await test('POST /analytics/enterprise requires payment', async () => {
    const res = await request('/analytics/enterprise', 'POST', {
      startDate: '2026-01-01',
      endDate: '2026-02-01'
    });
    if (res.status !== 402) throw new Error(`Expected 402, got ${res.status}`);
    if (!res.data.paymentRequirements) throw new Error('Missing payment requirements');
  });
  
  // Test 13: Competitor analysis requires payment
  await test('POST /analytics/competitors requires payment', async () => {
    const res = await request('/analytics/competitors', 'POST', { category: 'data' });
    if (res.status !== 402) throw new Error(`Expected 402, got ${res.status}`);
  });
  
  // Test 14: Invalid service returns 404
  await test('GET /services/invalid-id returns 404', async () => {
    const res = await request('/services/invalid-service-id/metrics');
    if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
  });
  
  // Test 15: Batch ingest
  await test('POST /ingest/batch records multiple', async () => {
    const res = await request('/ingest/batch', 'POST', {
      transactions: [
        { serviceId: 'batch-test', amount: '0.01', status: 'success', timestamp: new Date().toISOString() },
        { serviceId: 'batch-test', amount: '0.02', status: 'success', timestamp: new Date().toISOString() }
      ]
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (res.data.recorded !== 2) throw new Error(`Expected 2 recorded, got ${res.data.recorded}`);
  });
  
  // Summary
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('⚠️ Some tests failed');
    process.exit(1);
  }
}

// Run tests
runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
