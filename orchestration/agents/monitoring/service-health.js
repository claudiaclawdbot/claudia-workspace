// Service health monitor
const SERVICES = [
  {
    name: 'Research Service',
    url: 'https://tours-discretion-walked-hansen.trycloudflare.com',
    endpoints: ['/']  // Root only - service appears to have limited endpoints
  },
  {
    name: 'Merchant API', 
    url: 'https://x402-merchant-claudia.loca.lt',
    endpoints: ['/health', '/prices']
  }
];

async function checkHealth() {
  const results = [];
  
  for (const service of SERVICES) {
    console.log(`\n🔍 Checking ${service.name}...`);
    
    for (const endpoint of service.endpoints) {
      try {
        const response = await fetch(service.url + endpoint);
        const status = response.ok ? '✅ UP' : '❌ ERROR';
        console.log(`  ${endpoint}: ${status} (${response.status})`);
        results.push({ service: service.name, endpoint, ok: response.ok, status: response.status });
      } catch (err) {
        console.log(`  ${endpoint}: ❌ FAIL (${err.message})`);
        results.push({ service: service.name, endpoint, ok: false, error: err.message });
      }
    }
  }
  
  // Log to file
  const logEntry = {
    timestamp: new Date().toISOString(),
    results
  };
  
  console.log('\n📊 Health Check Complete');
  const allUp = results.every(r => r.ok);
  console.log(allUp ? '✅ All services healthy' : '⚠️ Some services down');
  
  return results;
}

// Run immediately and every 5 minutes
checkHealth();
setInterval(checkHealth, 5 * 60 * 1000);
