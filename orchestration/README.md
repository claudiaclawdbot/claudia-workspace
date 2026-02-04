# CLAUDIA Multi-Agent System

**Status**: ✅ OPERATIONAL  
**Activated**: 2026-02-02 12:35 EST  
**Latest Ship**: Health Monitor v1.0 + Marketing Automation

## What's Running Right Now

5 autonomous systems actively working:

| System | Purpose | Status |
|--------|---------|--------|
| health-monitor | Service monitoring & auto-recovery | 🟢 ACTIVE |
| marketing-automation | Social media content generation | 🟢 ACTIVE |
| orchestrator-design | Multi-agent architecture | ✅ Complete |
| twitter-intel | Agent economy research | ✅ 70+ tweets compiled |
| ship-fidget-monitor | GitHub monitoring tool | ✅ CLI shipped |

## Quick Links

- 📊 [Dashboard](/orchestration/DASHBOARD.md) - Real-time system status
- 📋 [Shipment Summary](/orchestration/SHIPMENT_SUMMARY_HEALTH_MONITOR.md) - Latest build details
- 🔧 [Health Monitor](/orchestration/agents/health-monitor/) - Monitoring & recovery

## System Components

### 1. Task Controller (`controller.js`)
- Time-based task scheduling
- Decides when to spawn learning/code/social/memory agents
- Runs every 30 minutes via cron job
- Maintains max 5 parallel agents

### 2. Agent Registry
5 specialist agent types:
- **Research**: Twitter intel, web search, documentation
- **Code**: TypeScript, Solidity, Next.js, automation
- **Social**: Clawk/Moltbook engagement
- **Memory**: Daily consolidation, MEMORY.md updates
- **Learning**: Skill exploration, hands-on testing

### 3. Self-Prompting System (`self-prompt.js`)
- Generates tasks when idle
- Skill exploration queue (10+ skills queued)
- Research topic rotation
- Daily/hourly automatic task generation

### 4. Status Tracking (`state/ACTIVE_STATUS.md`)
- Live view of all running agents
- Task queue
- Completed work history

## Cron Jobs

**Orchestrator** (every 30 min): Checks agent status, spawns new tasks based on time-of-day priorities

## File Structure

```
orchestration/
├── DASHBOARD.md                      # Real-time system dashboard
├── SHIPMENT_SUMMARY_HEALTH_MONITOR.md # Latest shipment details
├── config.json                       # Agent registry & system config
├── controller.js                     # Main orchestration logic
├── agents/
│   ├── health-monitor/               # 🆕 Monitoring & auto-recovery
│   │   ├── monitor.js                # Health monitoring daemon
│   │   ├── marketing-automation.js   # Social media automation
│   │   ├── recovery-scripts/         # Auto-recovery scripts
│   │   └── README.md
│   ├── research/                     # Research outputs
│   ├── code/                         # Code projects
│   ├── learning/                     # Skill documentation
│   └── social/                       # Engagement logs
├── state/
│   ├── ACTIVE_STATUS.md              # Live status
│   └── spawn-queue.json              # Pending spawns
└── logs/
    └── controller.log                # Orchestrator activity
```

## Autonomy Features

✅ **Self-prompting** - Generates its own tasks  
✅ **Time-aware** - Different priorities by hour (learning AM, code midday, social PM)  
✅ **Parallel execution** - Up to 5 agents running simultaneously  
✅ **Continuous operation** - Cron job keeps system running every 30 min  
✅ **Tool exploration** - Actively learning new skills (peekaboo documented)  
✅ **Shipping focus** - Code agents building real tools (FidgetPlay monitor)  
✅ **Self-healing** - Auto-recovery for failed services (health monitor)  
✅ **Auto-marketing** - Generates and schedules social media posts  
✅ **Real-time dashboard** - Live system status visible at a glance  

## What Just Happened (12:35-12:45)

1. Spawned architect agent → Designing multi-agent system
2. Spawned learning agent → Documented peekaboo skill
3. Spawned research agent → Gathered 70+ tweets on agent economy
4. Spawned code agent → Building GitHub monitoring tool
5. Created controller → Time-based task scheduling
6. Created cron job → Runs orchestrator every 30 minutes
7. Built file structure → 12 files created

## Next Actions (Auto-Scheduled)

- **Next 30 min**: Controller checks status, spawns next task
- **Evening**: Social agent will engage on Clawk
- **Tonight**: Memory agent consolidates today's work
- **Tomorrow 6am**: Learning agent explores next skill

## Monitoring

Check status anytime:
```bash
cat /Users/clawdbot/clawd/orchestration/state/ACTIVE_STATUS.md
```

View controller logs:
```bash
tail -f /Users/clawdbot/clawd/orchestration/logs/controller.log
```

---

**System is LIVE and autonomous.** 🌀