/**
 * x402 Client SDK - Usage Examples
 * 
 * Run with: npx ts-node examples/basic.ts
 */

import { X402Client, ServiceDiscovery } from '../src';

// Example 1: Quick Start
async function quickStartExample() {
  console.log('=== Example 1: Quick Start ===\n');

  // Initialize client
  const client = new X402Client({
    privateKey: process.env.PRIVATE_KEY || '0x1234567890abcdef', // Replace with real key
    chain: 'base'
  });

  console.log('Wallet address:', client.getAddress());

  // Get wallet info
  try {
    const wallet = await client.getWalletInfo();
    console.log('Balance:', wallet.balance);
  } catch (e) {
    console.log('Note: Connect a real wallet to see balances');
  }
}

// Example 2: Pay for Research
async function researchServiceExample() {
  console.log('\n=== Example 2: Research Service ===\n');

  const client = new X402Client({
    privateKey: process.env.PRIVATE_KEY!,
    chain: 'base'
  });

  const serviceUrl = 'https://tours-discretion-walked-hansen.trycloudflare.com';

  try {
    // First, get service info
    const info = await client.getServiceInfo(serviceUrl);
    console.log('Service:', info.name);
    console.log('Pricing tiers:', info.pricing.map(p => 
      `${p.complexity}: ${p.basePrice} ETH`
    ).join(', '));

    // Pay for research
    const result = await client.pay({
      serviceUrl: `${serviceUrl}/research`,
      amount: '0.001',
      payload: {
        query: 'Latest developments in agent economies',
        complexity: 'simple',
        sources: ['twitter', 'web']
      }
    });

    if (result.success) {
      console.log('\n✅ Research completed!');
      console.log('Summary:', result.data?.data?.summary);
    } else {
      console.log('\n❌ Payment failed:', result.error);
    }

  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

// Example 3: Quick Pay (Simplest API)
async function quickPayExample() {
  console.log('\n=== Example 3: Quick Pay ===\n');

  const client = new X402Client({
    privateKey: process.env.PRIVATE_KEY!,
    chain: 'base'
  });

  try {
    // One line to pay and get results
    const result = await client.quickPay(
      'https://tours-discretion-walked-hansen.trycloudflare.com/research',
      '0.001',
      {
        query: 'AI agent frameworks comparison',
        complexity: 'simple'
      }
    );

    console.log('✅ Got results:', result);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

// Example 4: Service Discovery
async function discoveryExample() {
  console.log('\n=== Example 4: Service Discovery ===\n');

  const discovery = new ServiceDiscovery();

  // List all services
  const services = await discovery.listServices();
  console.log('Available services:');
  
  for (const service of services) {
    console.log(`\n  📦 ${service.name}`);
    console.log(`     ID: ${service.id}`);
    console.log(`     Category: ${service.category}`);
    console.log(`     Price: ${service.pricing.min} - ${service.pricing.max} ${service.pricing.currency}`);
    console.log(`     URL: ${service.url}`);
  }

  // Find research services
  const researchServices = await discovery.findByCategory('research');
  console.log(`\n🔍 Found ${researchServices.length} research services`);
}

// Example 5: Multiple Payments (Batch)
async function batchPaymentExample() {
  console.log('\n=== Example 5: Batch Payments ===\n');

  const client = new X402Client({
    privateKey: process.env.PRIVATE_KEY!,
    chain: 'base'
  });

  const queries = [
    'DeFi yield farming strategies',
    'NFT marketplace trends',
    'Layer 2 scaling solutions'
  ];

  console.log('Processing batch of', queries.length, 'research queries...\n');

  for (const query of queries) {
    try {
      const result = await client.pay({
        serviceUrl: 'https://tours-discretion-walked-hansen.trycloudflare.com/research',
        amount: '0.001',
        payload: { query, complexity: 'simple' }
      });

      if (result.success) {
        console.log(`✅ "${query.substring(0, 30)}..." - Completed`);
      } else {
        console.log(`❌ "${query.substring(0, 30)}..." - Failed: ${result.error}`);
      }
    } catch (error: any) {
      console.log(`❌ "${query.substring(0, 30)}..." - Error: ${error.message}`);
    }
  }
}

// Example 6: Error Handling
async function errorHandlingExample() {
  console.log('\n=== Example 6: Error Handling ===\n');

  const client = new X402Client({
    privateKey: process.env.PRIVATE_KEY!,
    chain: 'base'
  });

  try {
    // Try to pay with insufficient funds (will fail)
    const result = await client.pay({
      serviceUrl: 'https://invalid-service-url.example.com/research',
      amount: '999999', // Way too much
      payload: { query: 'test' }
    });

    if (!result.success) {
      console.log('Payment declined (expected):', result.error);
    }

  } catch (error: any) {
    // Network errors, timeouts, etc.
    if (error.code === 'ECONNREFUSED') {
      console.log('Service is offline');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('Request timed out');
    } else {
      console.log('Error:', error.message);
    }
  }
}

// Run all examples
async function runAll() {
  console.log('🚀 x402 Client SDK Examples\n');
  console.log('===========================\n');

  await quickStartExample();
  await discoveryExample();
  
  // These require a real private key
  if (process.env.PRIVATE_KEY) {
    await researchServiceExample();
    await quickPayExample();
    await batchPaymentExample();
    await errorHandlingExample();
  } else {
    console.log('\n⚠️  Set PRIVATE_KEY env var to run payment examples');
    console.log('   export PRIVATE_KEY=0x...');
  }

  console.log('\n===========================');
  console.log('✨ Examples complete!');
}

// Run if executed directly
if (require.main === module) {
  runAll().catch(console.error);
}

export { 
  quickStartExample, 
  researchServiceExample, 
  quickPayExample,
  discoveryExample,
  batchPaymentExample,
  errorHandlingExample 
};