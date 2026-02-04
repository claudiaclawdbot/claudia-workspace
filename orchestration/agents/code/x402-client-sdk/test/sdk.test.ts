/**
 * Simple test for x402 Client SDK
 */

import { X402Client, ServiceDiscovery, SUPPORTED_CHAINS } from '../src';

async function runTests() {
  console.log('🧪 x402 Client SDK Tests\n');
  console.log('========================\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Client initialization
  try {
    console.log('Test 1: Client initialization...');
    const client = new X402Client({
      privateKey: '0x' + '1'.repeat(64),
      chain: 'base'
    });
    
    if (client.getAddress()) {
      console.log('  ✅ Client initialized successfully');
      passed++;
    } else {
      throw new Error('No address returned');
    }
  } catch (error: any) {
    console.log('  ❌ Failed:', error.message);
    failed++;
  }

  // Test 2: Chain configuration
  try {
    console.log('\nTest 2: Chain configuration...');
    const chains = Object.keys(SUPPORTED_CHAINS);
    
    if (chains.includes('base') && chains.includes('ethereum')) {
      console.log('  ✅ Supported chains:', chains.join(', '));
      passed++;
    } else {
      throw new Error('Missing required chains');
    }
  } catch (error: any) {
    console.log('  ❌ Failed:', error.message);
    failed++;
  }

  // Test 3: Service discovery
  try {
    console.log('\nTest 3: Service discovery...');
    const discovery = new ServiceDiscovery();
    const services = await discovery.listServices();
    
    if (services.length > 0) {
      console.log(`  ✅ Found ${services.length} services`);
      services.forEach(s => console.log(`     - ${s.name} (${s.category})`));
      passed++;
    } else {
      throw new Error('No services found');
    }
  } catch (error: any) {
    console.log('  ❌ Failed:', error.message);
    failed++;
  }

  // Test 4: Service filtering by category
  try {
    console.log('\nTest 4: Service category filtering...');
    const discovery = new ServiceDiscovery();
    const researchServices = await discovery.findByCategory('research');
    
    if (researchServices.length > 0) {
      console.log(`  ✅ Found ${researchServices.length} research services`);
      passed++;
    } else {
      throw new Error('No research services found');
    }
  } catch (error: any) {
    console.log('  ❌ Failed:', error.message);
    failed++;
  }

  // Test 5: Client with different chains
  try {
    console.log('\nTest 5: Multi-chain support...');
    
    for (const chain of ['base', 'ethereum', 'arbitrum'] as const) {
      const client = new X402Client({
        privateKey: '0x' + '1'.repeat(64),
        chain
      });
      
      if (!client.getAddress()) {
        throw new Error(`Failed to initialize ${chain} client`);
      }
    }
    
    console.log('  ✅ All chains supported');
    passed++;
  } catch (error: any) {
    console.log('  ❌ Failed:', error.message);
    failed++;
  }

  // Test 6: Payment authorization structure
  try {
    console.log('\nTest 6: Payment authorization...');
    const client = new X402Client({
      privateKey: '0x' + '1'.repeat(64),
      chain: 'base'
    });

    // Create a payment (won't be valid without real funds, but tests structure)
    const { proof, expiresAt } = await client.createPayment(
      '0x1234567890123456789012345678901234567890',
      '0.001',
      3600
    );

    // Verify proof structure
    const decoded = JSON.parse(Buffer.from(proof, 'base64').toString());
    
    if (decoded.scheme === 'exact' && decoded.payload?.authorization) {
      console.log('  ✅ Payment authorization created');
      console.log(`     Expires at: ${new Date(expiresAt * 1000).toISOString()}`);
      passed++;
    } else {
      throw new Error('Invalid payment proof structure');
    }
  } catch (error: any) {
    console.log('  ❌ Failed:', error.message);
    failed++;
  }

  // Summary
  console.log('\n========================');
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('========================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});