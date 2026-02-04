/**
 * CLAUDIA Health Monitor - Auto-Recovery System
 * Monitors all x402 services and auto-redeploys failures
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// Configuration
const CONFIG = {
  checkInterval: 2 * 60 * 1000, // 2 minutes
  recoveryCooldown: 5 * 60 * 1000, // 5 minutes between recovery attempts
  maxRetries: 3,
  logFile: path.join(__dirname, 'logs', 'monitor.log'),
  stateFile: path.join(__dirname, 'state', 'service-state.json'),
  dashboardFile: path.join(__dirname, '..', '..', 'DASHBOARD.md')
};

// Service definitions
const SERVICES = [
  {
    id: 'research-service',
    name: 'Research Service',
    url: 'https://tours-discretion-walked-hansen.trycloudflare.com',
    healthEndpoint: '/pricing',
    localPath: path.join(__dirname, '..', 'code', 'x402-research-service'),
    deployScript: 'deploy-production.sh',
    tunnelType: 'cloudflare',
    critical: true,
    revenueEnabled: true
  },
  {
    id: 'merchant-api',
    name: 'Merchant API',
    url: 'https://x402-merchant-claudia.loca.lt',
    healthEndpoint: '/health',
    localPath: path.join(__dirname, '..', 'code', 'x402-merchant'),
    deployScript: 'deploy.sh',
    tunnelType: 'localtunnel',
    critical: true,
    revenueEnabled: true
  }
];

// State management
class StateManager {
  constructor() {
    this.state = this.load();
    this.ensureDirs();
  }

  ensureDirs() {
    const dirs = [
      path.dirname(CONFIG.logFile),
      path.dirname(CONFIG.stateFile)
    ];
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  load() {
    try {
      if (fs.existsSync(CONFIG.stateFile)) {
        return JSON.parse(fs.readFileSync(CONFIG.stateFile, 'utf8'));
      }
    } catch (e) {
      console.error('Error loading state:', e.message);
    }
    return {
      services: {},
      lastRecovery: {},
      uptime: {},
      totalChecks: 0,
      failures: 0,
      recoveries: 0,
      started: new Date().toISOString()
    };
  }

  save() {
    try {
      fs.writeFileSync(CONFIG.stateFile, JSON.stringify(this.state, null, 2));
    } catch (e) {
      console.error('Error saving state:', e.message);
    }
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level}] ${message}\n`;
    
    console.log(logEntry.trim());
    
    try {
      fs.appendFileSync(CONFIG.logFile, logEntry);
    } catch (e) {
      // Silent fail for logging
    }
  }

  recordCheck(serviceId, status) {
    if (!this.state.services[serviceId]) {
      this.state.services[serviceId] = {
        checks: 0,
        failures: 0,
        lastStatus: null,
        lastCheck: null,
        uptime: 0
      };
    }
    
    const svc = this.state.services[serviceId];
    svc.checks++;
    svc.lastStatus = status;
    svc.lastCheck = new Date().toISOString();
    
    if (status.ok) {
      svc.uptime++;
    } else {
      svc.failures++;
      this.state.failures++;
    }
    
    this.state.totalChecks++;
    this.save();
  }

  recordRecovery(serviceId, success) {
    this.state.lastRecovery[serviceId] = {
      timestamp: new Date().toISOString(),
      success
    };
    if (success) {
      this.state.recoveries++;
    }
    this.save();
  }

  canRecover(serviceId) {
    const lastRecovery = this.state.lastRecovery[serviceId];
    if (!lastRecovery) return true;
    
    const timeSince = Date.now() - new Date(lastRecovery.timestamp).getTime();
    return timeSince > CONFIG.recoveryCooldown;
  }

  getStats() {
    const uptime = {};
    Object.entries(this.state.services).forEach(([id, data]) => {
      uptime[id] = data.checks > 0 
        ? ((data.uptime / data.checks) * 100).toFixed(2)
        : 100;
    });
    
    return {
      totalChecks: this.state.totalChecks,
      failures: this.state.failures,
      recoveries: this.state.recoveries,
      uptime,
      services: this.state.services
    };
  }
}

// Health checker
class HealthChecker {
  constructor(stateManager) {
    this.state = stateManager;
  }

  async checkService(service) {
    const url = `${service.url}${service.healthEndpoint}`;
    
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, { 
        signal: controller.signal,
        headers: { 'User-Agent': 'CLAUDIA-HealthMonitor/1.0' }
      });
      
      clearTimeout(timeout);
      
      const status = {
        ok: response.ok,
        status: response.status,
        responseTime: Date.now(),
        timestamp: new Date().toISOString()
      };
      
      this.state.recordCheck(service.id, status);
      return status;
      
    } catch (error) {
      const status = {
        ok: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      
      this.state.recordCheck(service.id, status);
      return status;
    }
  }

  async checkAll() {
    const results = [];
    
    for (const service of SERVICES) {
      this.state.log(`Checking ${service.name}...`);
      const result = await this.checkService(service);
      results.push({ service, status: result });
      
      const icon = result.ok ? '✅' : '❌';
      this.state.log(`${icon} ${service.name}: ${result.ok ? 'UP' : 'DOWN'}`);
    }
    
    return results;
  }
}

// Recovery manager
class RecoveryManager {
  constructor(stateManager) {
    this.state = stateManager;
  }

  async recover(service) {
    if (!this.state.canRecover(service.id)) {
      this.state.log(`Recovery on cooldown for ${service.name}`, 'WARN');
      return false;
    }

    this.state.log(`🔄 Attempting recovery for ${service.name}...`, 'RECOVERY');

    try {
      // Check if local server is running
      const isLocalRunning = await this.isLocalServerRunning(service);
      
      if (!isLocalRunning) {
        this.state.log(`Starting local server for ${service.name}...`);
        await this.startLocalServer(service);
      }

      // Re-establish tunnel
      this.state.log(`Re-establishing tunnel for ${service.name}...`);
      await this.restartTunnel(service);

      // Verify recovery
      await new Promise(r => setTimeout(r, 5000)); // Wait for startup
      const health = new HealthChecker(this.state);
      const check = await health.checkService(service);

      if (check.ok) {
        this.state.log(`✅ Recovery successful for ${service.name}!`, 'SUCCESS');
        this.state.recordRecovery(service.id, true);
        return true;
      } else {
        throw new Error('Health check failed after recovery');
      }

    } catch (error) {
      this.state.log(`❌ Recovery failed for ${service.name}: ${error.message}`, 'ERROR');
      this.state.recordRecovery(service.id, false);
      return false;
    }
  }

  async isLocalServerRunning(service) {
    try {
      // Try to find process
      const result = execSync('lsof -i :4020 -t 2>/dev/null || echo ""').toString().trim();
      return result.length > 0;
    } catch {
      return false;
    }
  }

  async startLocalServer(service) {
    const { spawn } = require('child_process');
    
    return new Promise((resolve, reject) => {
      const proc = spawn('npm', ['start'], {
        cwd: service.localPath,
        detached: true,
        stdio: 'ignore'
      });
      
      proc.on('error', reject);
      
      // Give it time to start
      setTimeout(() => resolve(), 3000);
    });
  }

  async restartTunnel(service) {
    // Kill existing tunnel processes
    try {
      execSync(`pkill -f "cloudflare.*${service.id}" 2>/dev/null || true`);
      execSync(`pkill -f "lt.*${service.id}" 2>/dev/null || true`);
    } catch {
      // Ignore errors
    }

    // Start new tunnel based on type
    if (service.tunnelType === 'cloudflare') {
      await this.startCloudflareTunnel(service);
    } else if (service.tunnelType === 'localtunnel') {
      await this.startLocalTunnel(service);
    }
  }

  async startCloudflareTunnel(service) {
    const { spawn } = require('child_process');
    
    return new Promise((resolve, reject) => {
      const proc = spawn('cloudflared', ['tunnel', '--url', 'http://localhost:4020'], {
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe']
      });
      
      let output = '';
      proc.stdout.on('data', (data) => {
        output += data.toString();
        // Look for the tunnel URL
        const match = output.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
        if (match) {
          this.state.log(`Cloudflare tunnel established: ${match[0]}`);
        }
      });
      
      setTimeout(() => resolve(), 5000);
    });
  }

  async startLocalTunnel(service) {
    const { spawn } = require('child_process');
    
    return new Promise((resolve) => {
      const proc = spawn('npx', ['localtunnel', '--port', '4020', '--subdomain', 'x402-merchant-claudia'], {
        detached: true,
        stdio: 'ignore'
      });
      
      setTimeout(() => resolve(), 3000);
    });
  }
}

// Dashboard updater
class DashboardUpdater {
  constructor(stateManager) {
    this.state = stateManager;
  }

  update(results) {
    const stats = this.state.getStats();
    const timestamp = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
    
    let dashboard = `# 🤖 CLAUDIA Health Dashboard

**Last Updated:** ${timestamp} EST  
**Monitor Status:** 🟢 RUNNING  
**Services:** ${results.length} | **Healthy:** ${results.filter(r => r.status.ok).length}

---

## 📊 System Health

| Service | Status | Uptime | Last Check | Actions |
|---------|--------|--------|------------|---------|
`;

    results.forEach(({ service, status }) => {
      const uptime = stats.uptime[service.id] || 'N/A';
      const icon = status.ok ? '🟢' : '🔴';
      const lastCheck = status.timestamp ? new Date(status.timestamp).toLocaleTimeString() : 'Never';
      const recoveryBtn = !status.ok ? `[Attempt Recovery]` : '-';
      
      dashboard += `| ${service.name} | ${icon} ${status.ok ? 'UP' : 'DOWN'} | ${uptime}% | ${lastCheck} | ${recoveryBtn} |\n`;
    });

    dashboard += `
---

## 📈 Statistics

- **Total Health Checks:** ${stats.totalChecks.toLocaleString()}
- **Total Failures:** ${stats.failures.toLocaleString()}
- **Successful Recoveries:** ${stats.recoveries}
- **Monitor Started:** ${new Date(this.state.state.started).toLocaleString()}

---

## 🔄 Recent Activity

`;

    // Add recent log entries (last 10)
    try {
      const logContent = fs.readFileSync(CONFIG.logFile, 'utf8');
      const recentLogs = logContent.split('\n').filter(l => l.trim()).slice(-10);
      dashboard += recentLogs.map(l => `- ${l}`).join('\n');
    } catch {
      dashboard += 'No recent activity logged.';
    }

    dashboard += `

---

## 🚀 Auto-Recovery Status

| Service | Last Recovery | Success | Can Recover |
|---------|---------------|---------|-------------|
`;

    SERVICES.forEach(service => {
      const recovery = this.state.state.lastRecovery[service.id];
      const lastRec = recovery ? new Date(recovery.timestamp).toLocaleString() : 'Never';
      const success = recovery ? (recovery.success ? '✅' : '❌') : '-';
      const canRecover = this.state.canRecover(service.id) ? '✅' : '⏳';
      
      dashboard += `| ${service.name} | ${lastRec} | ${success} | ${canRecover} |\n`;
    });

    dashboard += `

---

*Generated by CLAUDIA Health Monitor v1.0*  
*Auto-refresh: Every 2 minutes*
`;

    try {
      fs.writeFileSync(CONFIG.dashboardFile, dashboard);
      this.state.log('Dashboard updated');
    } catch (error) {
      this.state.log(`Failed to update dashboard: ${error.message}`, 'ERROR');
    }
  }
}

// Main monitor class
class HealthMonitor {
  constructor() {
    this.state = new StateManager();
    this.checker = new HealthChecker(this.state);
    this.recovery = new RecoveryManager(this.state);
    this.dashboard = new DashboardUpdater(this.state);
    this.running = false;
  }

  async runCycle() {
    this.state.log('=== Health Check Cycle Started ===');
    
    // Check all services
    const results = await this.checker.checkAll();
    
    // Handle failures
    const failures = results.filter(r => !r.status.ok);
    
    for (const { service } of failures) {
      this.state.log(`⚠️ Service ${service.name} is down - initiating recovery...`);
      const recovered = await this.recovery.recover(service);
      
      if (recovered) {
        // Re-check after recovery
        const recheck = await this.checker.checkService(service);
        if (!recheck.ok) {
          this.state.log(`Recovery reported success but service still down`, 'WARN');
        }
      }
    }
    
    // Update dashboard
    this.dashboard.update(results);
    
    this.state.log('=== Health Check Cycle Complete ===\n');
  }

  async start() {
    this.running = true;
    this.state.log('🚀 Health Monitor Started');
    this.state.log(`Monitoring ${SERVICES.length} services every ${CONFIG.checkInterval/1000}s`);
    
    // Initial check
    await this.runCycle();
    
    // Schedule periodic checks
    const interval = setInterval(async () => {
      if (!this.running) {
        clearInterval(interval);
        return;
      }
      await this.runCycle();
    }, CONFIG.checkInterval);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      this.state.log('Shutting down health monitor...');
      this.running = false;
      clearInterval(interval);
      process.exit(0);
    });
  }
}

// Run if called directly
if (require.main === module) {
  const monitor = new HealthMonitor();
  monitor.start().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { HealthMonitor, StateManager, HealthChecker, RecoveryManager };
