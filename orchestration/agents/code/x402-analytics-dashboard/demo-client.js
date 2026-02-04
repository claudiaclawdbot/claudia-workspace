/**
 * Demo Client for x402 Analytics Dashboard
 * 
 * Demonstrates usage of the analytics API and shows sample data.
 */

import http from 'http';

const BASE_URL = 'http://localhost:3004';

// HTTP request helper
function request(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3004,
      path,
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
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

function printSection(title) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${title}`);
  console.log('='.repeat(60));
}

function printJSON(obj) {
  console.log(JSON.stringify(obj, null, 2));
}

async function runDemo() {
  console.log('📊 x402 Analytics Dashboard Demo\n');
  
  // 1. Service Status
  printSection('1. Service Status');
  const status = await request('/status');
  printJSON(status.data);
  
  // 2. Pricing Tiers
  printSection('2. Pricing Tiers');
  const pricing = await request('/pricing');
  console.log('Available Tiers:');
  Object.entries(pricing.data.tiers).forEach(([key, tier]) => {
    console.log(`  • ${tier.name}: $${tier.price} USDC`);
    console.log(`    Features: ${tier.features.slice(0, 2).join(', ')}...`);
  });
  
  // 3. Free Dashboard
  printSection('3. Free Dashboard (24h)');
  const dashboard = await request('/dashboard');
  console.log('Summary:');
  console.log(`  • Total Transactions: ${dashboard.data.summary.totalTransactions}`);
  console.log(`  • Total Revenue: ${dashboard.data.summary.totalRevenue} USDC`);
  console.log(`  • Success Rate: ${dashboard.data.summary.successRate}%`);
  console.log(`  • Services Active: ${dashboard.data.summary.totalServices}`);
  console.log('\nTop 5 Services:');
  dashboard.data.topServices.slice(0, 5).forEach((s, i) => {
    console.log(`  ${i + 1}. ${s.name}: ${s.transactions} tx, ${s.revenue} USDC`);
  });
  
  // 4. Services List
  printSection('4. Tracked Services');
  const services = await request('/services');
  services.data.services.forEach(s => {
    console.log(`  • ${s.name} (${s.category})`);
    console.log(`    Revenue: ${s.totalRevenue} USDC | Tx: ${s.totalTransactions}`);
  });
  
  // 5. Category Breakdown
  printSection('5. Category Breakdown');
  const categories = await request('/categories');
  categories.data.categories.forEach(c => {
    console.log(`  • ${c.name}: ${c.serviceCount} services, ${c.revenue} USDC`);
  });
  
  // 6. Service Metrics
  printSection('6. Individual Service Metrics');
  const serviceMetrics = await request('/services/x402-research-v1/metrics');
  printJSON(serviceMetrics.data);
  
  // 7. Leaderboard
  printSection('7. Revenue Leaderboard');
  const leaderboard = await request('/leaderboard?metric=revenue&limit=5');
  leaderboard.data.leaderboard.forEach((s, i) => {
    console.log(`  ${i + 1}. ${s.name}: ${s.revenue} USDC (${s.transactions} tx)`);
  });
  
  // 8. Revenue Stats
  printSection('8. Dashboard Revenue');
  const revenue = await request('/revenue');
  console.log(`Total Revenue: ${revenue.data.revenue.total} USDC`);
  console.log('By Tier:', revenue.data.revenue.byTier);
  
  // 9. Premium Endpoint (shows payment required)
  printSection('9. Premium Endpoint (Payment Required)');
  const premium = await request('/analytics/premium', 'POST', { days: 30 });
  console.log(`Status: ${premium.status} (Payment Required)`);
  console.log(`Price: ${premium.data.paymentRequirements?.description || 'N/A'}`);
  
  // 10. Enterprise Endpoint (shows payment required)
  printSection('10. Enterprise Report (Payment Required)');
  const enterprise = await request('/analytics/enterprise', 'POST', {
    startDate: '2026-01-01',
    endDate: '2026-02-01'
  });
  console.log(`Status: ${enterprise.status} (Payment Required)`);
  console.log(`Price: ${enterprise.data.paymentRequirements?.description || 'N/A'}`);
  
  // 11. Ingest new transaction
  printSection('11. Ingest New Transaction');
  const ingest = await request('/ingest/transaction', 'POST', {
    serviceId: 'demo-service',
    serviceName: 'Demo Service',
    category: 'demo',
    amount: '0.005',
    currency: 'USDC',
    status: 'success'
  });
  console.log('Transaction recorded:');
  printJSON(ingest.data);
  
  // 12. Updated Dashboard
  printSection('12. Updated Dashboard (After Ingest)');
  const updatedDashboard = await request('/dashboard');
  console.log('New Total Transactions:', updatedDashboard.data.summary.totalTransactions);
  
  printSection('Demo Complete!');
  console.log('\nKey Takeaways:');
  console.log('  ✅ Free tier provides valuable 24h insights');
  console.log('  ✅ Premium analytics available for $0.05 USDC');
  console.log('  ✅ Enterprise reports with custom date ranges');
  console.log('  ✅ Services can auto-report via /ingest endpoints');
  console.log('  ✅ Multiple revenue streams from different tiers');
}

runDemo().catch(err => {
  console.error('Demo error:', err.message);
  console.log('\nMake sure the server is running: npm start');
  process.exit(1);
});
