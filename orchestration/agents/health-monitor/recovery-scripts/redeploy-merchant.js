#!/usr/bin/env node
/**
 * Redeploy Merchant API Script
 * Fixes the tunnel and gets the merchant API back online
 */

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const MERCHANT_PATH = path.join(__dirname, '..', '..', 'code', 'x402-merchant');
const LOG_FILE = path.join(__dirname, '..', 'logs', 'recovery.log');

function log(message) {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] ${message}\n`;
  console.log(entry.trim());
  try {
    fs.appendFileSync(LOG_FILE, entry);
  } catch (e) {}
}

function checkServerRunning() {
  try {
    const result = execSync('lsof -i :3001 -t 2>/dev/null || echo ""').toString().trim();
    return result.length > 0 ? result : null;
  } catch {
    return null;
  }
}

function killExistingProcesses() {
  log('Killing existing tunnel processes...');
  try {
    execSync('pkill -f "localtunnel.*3001" 2>/dev/null || true');
    execSync('pkill -f "lt.*3001" 2>/dev/null || true');
    log('Existing processes killed');
  } catch (e) {
    log('No existing processes to kill');
  }
}

async function startServer() {
  log('Starting merchant API server...');
  
  return new Promise((resolve, reject) => {
    const proc = spawn('npm', ['start'], {
      cwd: MERCHANT_PATH,
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    let output = '';
    proc.stdout.on('data', (data) => {
      output += data.toString();
      log(`Server: ${data.toString().trim()}`);
    });
    
    proc.stderr.on('data', (data) => {
      log(`Server Error: ${data.toString().trim()}`);
    });
    
    // Give it time to start
    setTimeout(() => {
      log('Server startup time elapsed');
      resolve(proc);
    }, 5000);
  });
}

async function startTunnel() {
  log('Starting localtunnel...');
  
  return new Promise((resolve, reject) => {
    const proc = spawn('npx', ['localtunnel', '--port', '3001', '--subdomain', 'x402-merchant-claudia'], {
      cwd: MERCHANT_PATH,
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    let url = null;
    let output = '';
    
    proc.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      
      // Look for tunnel URL
      const match = text.match(/(https:\/\/[a-z0-9-]+\.loca\.lt)/i);
      if (match && !url) {
        url = match[0];
        log(`✅ Tunnel established: ${url}`);
      }
      
      log(`Tunnel: ${text.trim()}`);
    });
    
    proc.stderr.on('data', (data) => {
      log(`Tunnel Error: ${data.toString().trim()}`);
    });
    
    setTimeout(() => {
      if (url) {
        resolve({ url, proc });
      } else {
        // Check if we got any output with loca.lt
        const match = output.match(/(https:\/\/[a-z0-9-]+\.loca\.lt)/i);
        if (match) {
          resolve({ url: match[0], proc });
        } else {
          reject(new Error('Tunnel URL not found in output'));
        }
      }
    }, 8000);
  });
}

async function verifyHealth(url) {
  log(`Verifying health at ${url}/health...`);
  
  try {
    const response = await fetch(`${url}/health`, { 
      timeout: 10000 
    });
    
    if (response.ok) {
      const data = await response.json();
      log(`✅ Health check passed: ${JSON.stringify(data)}`);
      return true;
    } else {
      log(`❌ Health check failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    log(`❌ Health check error: ${error.message}`);
    return false;
  }
}

async function main() {
  log('=== Merchant API Recovery Started ===');
  
  // Check if server is running
  const existingPid = checkServerRunning();
  if (existingPid) {
    log(`Server already running (PID: ${existingPid})`);
  }
  
  // Kill existing tunnel processes
  killExistingProcesses();
  
  // Start server if not running
  if (!existingPid) {
    await startServer();
  }
  
  // Wait for server to be ready
  await new Promise(r => setTimeout(r, 3000));
  
  // Start tunnel
  try {
    const { url } = await startTunnel();
    
    // Wait for tunnel to propagate
    await new Promise(r => setTimeout(r, 5000));
    
    // Verify health
    const healthy = await verifyHealth(url);
    
    if (healthy) {
      log('=== ✅ Recovery Successful ===');
      log(`Merchant API is now live at: ${url}`);
      
      // Update config with new URL if different
      console.log(`\n🎉 Merchant API redeployed successfully!`);
      console.log(`URL: ${url}`);
      console.log(`Health: ${url}/health`);
      console.log(`Prices: ${url}/prices`);
      
      return 0;
    } else {
      log('=== ❌ Recovery Failed - Health Check Failed ===');
      return 1;
    }
    
  } catch (error) {
    log(`=== ❌ Recovery Failed: ${error.message} ===`);
    return 1;
  }
}

main().then(code => process.exit(code)).catch(err => {
  log(`Fatal error: ${err.message}`);
  process.exit(1);
});
