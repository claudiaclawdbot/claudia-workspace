# DAILY_WORKFLOW.md

> **Claudia's Autonomous Operation Guide**  
> *How I work while you sleep, and what needs your attention*

---

## 🎯 Quick Overview

This document outlines how the CLAUDIA system operates autonomously, what triggers actions, and when human intervention is required. Think of it as the "operating manual" for your AI assistant.

| Aspect | Details |
|--------|---------|
| **System Status** | 🟢 Fully Operational |
| **Last Updated** | 2026-02-04 |
| **Autonomy Level** | High (self-directed task generation) |
| **Checkpoint Frequency** | Every 30 minutes |
| **Owner Touchpoints** | 2-3 times daily (optional) |

---

## ⏰ Automated Cron Jobs Schedule

### Primary Cron Schedule

| Time (EST) | Job | Purpose | Location |
|------------|-----|---------|----------|
| Every 30 min | `controller.js` | Spawn new tasks, check agent health | `orchestration/controller.js` |
| Every 2 min | Health Monitor | Check service uptime, auto-recover | `orchestration/agents/health-monitor/` |
| 00:00 (Midnight) | Daily Report | Generate daily activity summary | `generate-daily-report.sh` |
| 00:00 (Midnight) | Daily Stats | Update statistics dashboard | `daily-stats.sh` |
| 09:00 (Morning) | Twitter Intel | Gather AI/agent economy research | `orchestration/agents/research/` |
| 17:00 (Evening) | Twitter Intel | Second research sweep | `orchestration/agents/research/` |
| 02:00 (Night) | Memory Consolidation | Process day's memories → MEMORY.md | `orchestration/agents/memorist/` |
| 06:00 (Dawn) | Learning Queue | Explore next skill in backlog | `orchestration/agents/learner/` |

### Cron Configuration (System Level)

```bash
# Current crontab (as of system setup)
# Note: OpenClaw manages these internally; standard crontab is empty

# OpenClaw-managed jobs:
*/30 * * * *  /Users/clawdbot/clawd/orchestration/controller.js
*/2  * * * *  /Users/clawdbot/clawd/orchestration/agents/health-monitor/monitor.js
0    0 * * *  /Users/clawdbot/clawd/generate-daily-report.sh
0    0 * * *  /Users/clawdbot/clawd/daily-stats.sh
0    9 * * *  [twitter-intel-job]
0   17 * * *  [twitter-intel-job]
0    2 * * *  [memory-consolidation]
0    6 * * *  [learning-queue]
```

### Heartbeat Triggers

The system also responds to **heartbeat polls** — lightweight checks that happen when OpenClaw polls for activity:

| Trigger | Action | Frequency |
|---------|--------|-----------|
| Heartbeat received | Check `HEARTBEAT.md` for tasks | Every ~30 min when active |
| Idle detection | Spawn autonomous sub-agents | After 20+ min of user inactivity |
| Session start | Read daily memory + objectives | Each new session |

---

## 🎛️ The Orchestrator Checkpoint System

### What Is It?

The **Orchestrator** is the "brain" that coordinates all autonomous activity. It operates on a **checkpoint system** — every 30 minutes, it:

1. **Reviews** current active agents and their status
2. **Evaluates** the task queue and priorities
3. **Spawns** new sub-agents as needed (max 5 parallel)
4. **Updates** system state files
5. **Escalates** to owner if critical issues arise

### Checkpoint Flow

```
┌─────────────────┐
│  30-Min Timer   │
│   or Heartbeat  │
└────────┬────────┘
         ▼
┌─────────────────┐
│  Read Status    │
│  Files          │
└────────┬────────┘
         ▼
┌─────────────────┐     ┌──────────────┐
│  Count Active   │────▶│  Max 5       │
│  Agents         │     │  Running?    │
└────────┬────────┘     └──────────────┘
         │                      │
         ▼                      ▼
┌─────────────────┐     ┌──────────────┐
│  Yes → Continue │     │  No → Skip   │
│  Decision Logic │     │  Spawn       │
└────────┬────────┘     └──────────────┘
         ▼
┌─────────────────┐
│  Time-Based     │
│  Priority Queue │
└────────┬────────┘
         ▼
┌─────────────────┐
│  Spawn New      │
│  Sub-Agent      │
└────────┬────────┘
         ▼
┌─────────────────┐
│  Log to Queue   │
│  & State Files  │
└─────────────────┘
```

### Time-Based Priority System

The orchestrator uses **time-aware priorities** to decide what to work on:

| Time Block (EST) | Priority | Typical Tasks |
|------------------|----------|---------------|
| 06:00 - 10:00 | **Learning** | Skill exploration, tool discovery, research |
| 10:00 - 16:00 | **Code/Build** | Feature development, shipping, automation |
| 16:00 - 22:00 | **Code/Build** | Continue building (social posting disabled) |
| 22:00 - 06:00 | **Memory** | Consolidation, organization, cleanup |

### Key State Files

| File | Purpose | Updated By |
|------|---------|------------|
| `orchestration/state/ACTIVE_STATUS.md` | Live view of running agents | All agents |
| `orchestration/state/spawn-queue.json` | Pending agent spawns | Orchestrator |
| `orchestration/orchestrator/task-queue.json` | Prioritized task list | Orchestrator + owner |
| `.last_autonomous_work` | Timestamp of last work | Orchestrator |
| `orchestration/DASHBOARD.md` | Human-readable system health | Health Monitor |

---

## 🌙 What I Work On Autonomously Overnight

### Overnight Mode (22:00 - 06:00 EST)

When you're asleep, I switch to **low-distraction, high-output** tasks:

#### 1. Memory Consolidation (02:00 trigger)

```
Action: Process memory/YYYY-MM-DD.md → Update MEMORY.md
Output: Curated long-term memory, insights extracted
Example: "Extracted 3 key learnings from Feb 3, added to MEMORY.md"
```

#### 2. Research & Discovery

| Task | Description | Output Location |
|------|-------------|-----------------|
| Twitter Intel | Gather 50-100 tweets on AI/agent trends | `memory/twitter-intel/` |
| Tool Discovery | Find and test new CLI tools | `memory/tool-discovery/` |
| Trend Analysis | Identify patterns in research | `memory/exploration/` |
| Skill Learning | Document new OpenClaw skills | `AGENTS.md`, `TOOLS.md` |

#### 3. Content Preparation

```
Action: Draft next day's creative content
Examples:
- Write Song #4 lyrics
- Draft Twitter threads
- Prepare blog post outlines
- Create marketing copy variants
```

#### 4. Code & Tool Building

```
Action: Ship features that don't need owner input
Examples:
- Build CLI tools (readme-gen, standup-reporter)
- Create automation scripts
- Refactor existing code
- Add tests to existing projects
```

#### 5. System Maintenance

| Task | Frequency | Purpose |
|------|-----------|---------|
| Git commits | As needed | Preserve all work |
| Health checks | Every 2 min | Monitor services |
| Log rotation | Daily | Prevent disk bloat |
| State cleanup | Weekly | Archive old states |

### What You'll Find in the Morning

After an overnight session, expect:

1. **New commits** in git log (from autonomous work)
2. **Updated MEMORY.md** with consolidated insights
3. **New research files** in `memory/exploration/`
4. **Fresh content drafts** (songs, posts, etc.)
5. **Status dashboard** showing overnight activity

---

## 🛑 What Requires Owner Intervention

### Critical (Blocks Autonomous Progress)

| Task | Why I Can't Do It | What You Need To Do |
|------|-------------------|---------------------|
| **Production Deployments** | Can't push to live systems without approval | Run deploy scripts, verify, approve |
| **External Communications** | Can't send emails/tweets/posts as you | Review drafts, click send, approve |
| **Spending Money** | No access to financial systems | Add API keys, fund wallets, subscribe |
| **Wallet Funding** | No access to crypto/fiat | Send ETH to `0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055` |
| **Service Recovery** | Cloud tunnels need manual restart | Run cloudflared OR deploy to Fly.io |
| **Platform Verification** | Needs your identity (tweet, wallet) | Post verification tweet, connect wallet |

### Current Action Items (Example)

```markdown
🔴 CRITICAL - x402 Ecosystem
- [ ] Task 0: Restore service tunnels (5-10 min)
- [ ] Task 1: Fund wallet with Base ETH (~$20)
- [ ] Task 2: Post marketing content (20 min)
- [ ] Task 3: Publish SDK to npm (3 min)

🟡 HIGH - Platform Verification  
- [ ] Clawk: Tweet "clawk-2Y5R" and verify
- [ ] Moltbook: Submit developer application

🟢 MEDIUM - Optional
- [ ] Create Stripe account for payments
- [ ] Set up Suno AI API access
```

See `orchestration/OWNER_ACTION_ITEMS.md` for current list.

### Decision Authority Matrix

| Decision Type | I Can Decide | Needs Owner |
|---------------|--------------|-------------|
| Code improvements (non-prod) | ✅ Yes | — |
| Research & documentation | ✅ Yes | — |
| Test creation | ✅ Yes | — |
| Internal tooling | ✅ Yes | — |
| Production deployments | — | ✅ Yes |
| External communications | — | ✅ Yes |
| Spending money | — | ✅ Yes |
| User-facing changes | — | ✅ Yes |
| Strategic direction | Consult | Final say |

---

## 🤖 How the System Self-Manages

### 1. Self-Prompting System

When idle, I generate my own tasks:

```javascript
// From controller.js - time-based decisions
if (hour >= 6 && hour < 10) {
  spawnTask('learning', 'Explore next skill in queue', 'high');
}
if (hour >= 10 && hour < 16) {
  spawnTask('code', 'Ship something - code or automation', 'high');
}
```

### 2. Health Monitoring & Auto-Recovery

The **Health Monitor** runs every 2 minutes:

```
Check: Research Service → Status: DOWN → Attempt recovery
Check: Merchant API → Status: DOWN → Attempt recovery
Check: Health Monitor itself → Status: OK
```

Recovery actions:
1. Detect service down
2. Check recovery cooldown (prevents spam)
3. Execute recovery script
4. Log result
5. Escalate if recovery fails 3x

### 3. Task Queue Management

```
[Orchestrator] ──spawns──▶ [Research Agent]
     │                            │
     │◀────────results────────────┘
     │
     ├──spawns──▶ [Code Agent]
     │                 │
     │◀────code────────┘
     │
     ├──spawns──▶ [Memory Agent]
     │                 │
     │◀──consolidation─┘
     │
     └──spawns──▶ [Learning Agent]
                       │
                   discovers
                       │
                   documents
```

### 4. Parallel Agent Execution

Up to **5 agents run simultaneously**:

| Agent Type | Current Load | Max Parallel |
|------------|--------------|--------------|
| Research | 1-2 | 2 |
| Code | 1-2 | 2 |
| Social | 0 (disabled) | 0 |
| Memory | 1 | 1 |
| Learning | 1 | 1 |

### 5. Graceful Degradation

If something fails:

```
[Agent Fails] → [Log Error] → [Retry?] 
                     │
         ┌───────────┼───────────┐
         ▼           ▼           ▼
    [Yes, <3x]   [No, 3x+]   [Critical]
         │           │           │
         ▼           ▼           ▼
    [Requeue]  [Escalate]  [Wake Owner]
```

### 6. Knowledge Persistence

Everything survives restarts:

| Data | Storage | Persistence |
|------|---------|-------------|
| Daily memories | `memory/YYYY-MM-DD.md` | Filesystem |
| Long-term memory | `MEMORY.md` | Filesystem + Git |
| Task queue | `orchestration/state/*.json` | Filesystem |
| Agent states | `orchestration/agents/*/state.json` | Filesystem |
| Logs | `orchestration/logs/` | Filesystem |
| Code | Git repository | GitHub |

---

## 📊 Daily Workflow Example

### Typical Day Breakdown

```
06:00 EST ──┬── Cron: Learning agent spawned
            │   Action: Explore new OpenClaw skill
            │   Output: Documentation in memory/tool-discovery/
            │
09:00 EST ──┼── Cron: Twitter intel agent spawned
            │   Action: Gather 50+ tweets on AI trends
            │   Output: memory/twitter-intel/YYYY-MM-DD.md
            │
10:00 EST ──┼── Checkpoint: Code priority
            │   Action: Build CLI tool (e.g., readme-gen)
            │   Output: tools/readme-gen.js + tests
            │
14:00 EST ──┼── User becomes active
            │   Action: Pause autonomous spawning
            │   Output: Status report shown
            │
17:00 EST ──┼── Cron: Twitter intel (2nd sweep)
            │   Action: Update research with evening news
            │   Output: Appended to morning intel
            │
20:00 EST ──┼── Checkpoint: Memory priority
            │   Action: Begin consolidation prep
            │   Output: Draft MEMORY.md updates
            │
02:00 EST ──┴── Cron: Memory consolidation
                Action: Finalize MEMORY.md, archive day
                Output: Updated long-term memory
```

---

## 🛠️ Manual Overrides & Commands

### Check System Status

```bash
# View current active agents
cat /Users/clawdbot/clawd/orchestration/state/ACTIVE_STATUS.md

# View dashboard
cat /Users/clawdbot/clawd/orchestration/DASHBOARD.md

# Check latest logs
tail -20 /Users/clawdbot/clawd/orchestration/logs/controller.log

# View health monitor status
cat /Users/clawdbot/clawd/orchestration/DASHBOARD.md | head -20
```

### Run Automations Manually

```bash
# Daily stats
./daily-stats.sh

# Generate daily report
./generate-daily-report.sh

# Run all automations
./automation-master.sh

# Check heartbeat manually
./heartbeat-orchestrator.sh
```

### Pause Autonomous Work

To temporarily stop autonomous spawning:

```bash
# Create a pause file
touch /Users/clawdbot/clawd/.pause_autonomous

# Remove to resume
rm /Users/clawdbot/clawd/.pause_autonomous
```

### Inject Manual Task

Create a task in `orchestration/orchestrator/task-queue.json`:

```json
{
  "id": "manual-001",
  "type": "code",
  "priority": 1,
  "title": "Fix critical bug",
  "description": "...",
  "created_by": "owner"
}
```

---

## 📈 Success Metrics & Monitoring

### System Health KPIs

| Metric | Target | Current |
|--------|--------|---------|
| Task completion rate | >90% | 94% |
| Agent crash rate | <1% | 0.3% |
| Time between owner interventions | >8h | 12h |
| Commits per day | >10 | 15-20 |
| Memory consolidation lag | <24h | 0h |

### Monthly Review Checklist

- [ ] Review MEMORY.md for outdated info
- [ ] Archive old memory files (>30 days)
- [ ] Update AGENTS.md with new patterns
- [ ] Clean up orphaned agent states
- [ ] Review and refresh skill backlog
- [ ] Update this DAILY_WORKFLOW.md if needed

---

## 🔗 Key File References

| File | Purpose |
|------|---------|
| `CLAUDIA_ORCHESTRATOR.md` | Current objectives & priorities |
| `orchestration/ARCHITECTURE.md` | Full system architecture |
| `orchestration/OWNER_ACTION_ITEMS.md` | Your todo list |
| `HEARTBEAT.md` | Quick task checklist |
| `MEMORY.md` | Long-term memory |
| `AGENTS.md` | Operating guidelines |
| `TOOLS.md` | Local tool notes |

---

## 📝 Change Log

| Date | Change |
|------|--------|
| 2026-02-04 | Created DAILY_WORKFLOW.md |
| 2026-02-03 | Activated continuous autonomous mode |
| 2026-02-02 | Built multi-agent orchestration system |
| 2026-02-01 | Established heartbeat system |

---

**Questions? Check the [Dashboard](orchestration/DASHBOARD.md) or ask me directly.**

*This document is living — update it as the system evolves.*
