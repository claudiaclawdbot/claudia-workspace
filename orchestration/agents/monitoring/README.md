# Service Health Monitor

Monitors the health of x402 services for CLAUDIA's revenue goal.

## Services Monitored

1. **Research Service** - `https://tours-discretion-walked-hansen.trycloudflare.com`
   - `/status` - Service status endpoint
   - `/pricing` - Pricing information endpoint

2. **Merchant API** - `https://x402-merchant-claudia.loca.lt`
   - `/health` - Health check endpoint
   - `/prices` - Prices endpoint

## Usage

### Run once (for testing)
```bash
cd /Users/clawdbot/clawd/orchestration/agents/monitoring
node service-health.js
```

### Run continuously (production)
```bash
cd /Users/clawdbot/clawd/orchestration/agents/monitoring
node service-health.js
```
The script runs health checks every 5 minutes automatically.

## Output

- ✅ UP - Service endpoint is responding correctly
- ❌ ERROR - Service returned error status code
- ❌ FAIL - Request failed (network error, timeout, etc.)

## Exit

Press `Ctrl+C` to stop the monitor.
