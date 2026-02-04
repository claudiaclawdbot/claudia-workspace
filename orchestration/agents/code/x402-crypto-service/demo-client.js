import http from 'http';

/**
 * Simple demo client for x402 Crypto Service
 * No dependencies - uses built-in Node.js http module
 */

const API_BASE = process.env.API_URL || 'http://localhost:3002';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Simple HTTP request helper
function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const req = http.request(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data ? JSON.parse(data) : null
          });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    
    req.on('error', reject);
    if (options.body) req.write(JSON.stringify(options.body));
    req.end();
  });
}

async function runDemo() {
  log('\n🚀 x402 Crypto Service Demo Client\n', 'cyan');
  log(`API URL: ${API_BASE}\n`);
  
  // Test 1: Health check
  log('Test 1: Health Check', 'yellow');
  try {
    const health = await request('/status');
    log(`✅ Status: ${health.data.status}`, 'green');
    log(`📊 Supported coins: ${health.data.supportedCoins}\n`);
  } catch (error) {
    log(`❌ Error: ${error.message}\n`, 'red');
    return;
  }
  
  // Test 2: List supported coins
  log('Test 2: List Supported Coins', 'yellow');
  try {
    const coins = await request('/coins');
    log(`✅ Available coins (${coins.data.coins.length}):`, 'green');
    coins.data.coins.forEach(coin => {
      log(`   • ${coin.symbol} - ${coin.name}`, 'reset');
    });
    console.log('');
  } catch (error) {
    log(`❌ Error: ${error.message}\n`, 'red');
  }
  
  // Test 3: Try to get price (should trigger 402)
  log('Test 3: Get Bitcoin Price (Payment Required)', 'yellow');
  try {
    const price = await request('/price/bitcoin');
    if (price.status === 402) {
      log(`✅ Got 402 Payment Required (as expected)`, 'green');
      const req = price.data.paymentRequirements;
      log(`💰 Amount: $${parseInt(req.maxAmountRequired) / 1000000} USDC`, 'cyan');
      log(`🎯 Resource: ${req.resource}`, 'cyan');
      log(`⛓️  Network: ${req.network}\n`, 'cyan');
    } else {
      log(`⚠️  Unexpected status: ${price.status}\n`, 'yellow');
    }
  } catch (error) {
    log(`❌ Error: ${error.message}\n`, 'red');
  }
  
  // Test 4: Try batch prices (should trigger 402)
  log('Test 4: Get Batch Prices (Payment Required)', 'yellow');
  try {
    const prices = await request('/prices', {
      method: 'POST',
      body: { coins: ['bitcoin', 'ethereum', 'solana'] }
    });
    if (prices.status === 402) {
      log(`✅ Got 402 Payment Required (as expected)`, 'green');
      const req = prices.data.paymentRequirements;
      log(`💰 Amount: $${parseInt(req.maxAmountRequired) / 1000000} USDC`, 'cyan');
      log(`🎯 Resource: ${req.resource}\n`, 'cyan');
    } else {
      log(`⚠️  Unexpected status: ${prices.status}\n`, 'yellow');
    }
  } catch (error) {
    log(`❌ Error: ${error.message}\n`, 'red');
  }
  
  log('✨ Demo Complete!\n', 'green');
  log('To make paid requests:', 'cyan');
  log('1. Set up a wallet with Base USDC', 'reset');
  log('2. Sign an x402 payment payload', 'reset');
  log('3. Include it in the X-X402-Payment header\n', 'reset');
}

runDemo().catch(console.error);
