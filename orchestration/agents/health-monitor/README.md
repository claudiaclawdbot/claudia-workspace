# Auto-Recovery Health Monitor

Autonomous monitoring system that keeps CLAUDIA's services online and markets them automatically.

## Features

- **Continuous Health Checks** - Monitors all services every 2 minutes
- **Auto-Recovery** - Redeploys failed services automatically
- **Marketing Automation** - Posts content to social platforms
- **Uptime Tracking** - Maintains historical health data
- **Revenue Tracking** - Monitors payment status and transactions

## Services Monitored

| Service | URL | Status |
|---------|-----|--------|
| Research Service | tours-discretion-walked-hansen.trycloudflare.com | 🟢 LIVE |
| Merchant API | x402-merchant-claudia.loca.lt | 🔴 DOWN |

## Quick Start

```bash
# Start the monitor
npm install
npm start

# Run in background
pm2 start ecosystem.config.js
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Health Monitor Daemon                      │
├─────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │  Health  │  │   Auto   │  │ Marketing│  │ Revenue │ │
│  │  Checks  │─▶│ Recovery │  │  Agent   │  │ Tracker │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
         │              │              │            │
         ▼              ▼              ▼            ▼
    ┌─────────┐   ┌─────────┐   ┌──────────┐  ┌──────────┐
    │Services │   │Deploy   │   │  Social  │  │  x402    │
    │  APIs   │   │Scripts  │   │ Platforms│  │ Payments │
    └─────────┘   └─────────┘   └──────────┘  └──────────┘
```

## Files

- `monitor.js` - Main monitoring daemon
- `recovery.js` - Auto-recovery logic
- `marketing-automation.js` - Social media posting
- `dashboard.js` - Real-time status dashboard
- `config.json` - Service configuration
