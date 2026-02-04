// Simple demo client showing x402 payment flow
// Usage: node demo-client.js

const API_URL = 'https://tours-discretion-walked-hansen.trycloudflare.com';

async function demo() {
  console.log('🤖 x402 Agent Intel Service Demo\n');
  
  // 1. Check service health
  console.log('1. Checking service...');
  const status = await fetch(`${API_URL}/health`).then(r => r.json());
  console.log('   Status:', status.status);
  console.log('   Service:', status.service);
  console.log('   Wallet:', status.merchant);
  
  // 2. Get pricing
  console.log('\n2. Getting pricing...');
  const pricing = await fetch(`${API_URL}/prices`).then(r => r.json());
  const tiers = Object.values(pricing.tiers);
  console.log('   Tiers:', tiers.map(t => `${t.name}: $${t.priceUSD}`).join(', '));
  
  // 3. Show example payment flow (mock)
  console.log('\n3. Payment flow (mock):');
  console.log('   a. Agent requests intel');
  console.log('   b. Service returns payment requirements');
  console.log('   c. Agent signs EIP-3009 authorization');
  console.log('   d. Service verifies and returns intel report');
  
  console.log('\n✅ Demo complete!');
  console.log('\nTo make real payment:');
  console.log('   1. Get test ETH from Base Sepolia faucet');
  console.log('   2. Run: node test-client.js');
}

demo().catch(console.error);
