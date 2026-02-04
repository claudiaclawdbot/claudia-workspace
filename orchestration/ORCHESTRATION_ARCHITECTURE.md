# Orchestration Architecture

> How Claudia's autonomous systems work together

---

## Overview

This document explains the orchestration system that enables Claudia to work autonomously, coordinate multiple subagents, and maintain persistent state across sessions.

---

## System Components

### 1. Checkpoint System (`checkpoint.sh`)

**Purpose:** Decides whether to wait for user input or continue autonomously

**Frequency:** Called every 5 minutes via cron or orchestrator

**Logic:**
1. Check `userLastSeen` timestamp in `orchestrator.json`
2. Compare against `timeoutMinutes` threshold
3. If timeout exceeded and `continueOnTimeout=true`:
   - Pick highest priority TODO task from `TASKS.md`
   - Spawn subagent to execute task
   - Or scout for new opportunities if no tasks

**Key Files:**
- `orchestrator.json` - Configuration and state
- `TASKS.md` - Prioritized task list
- `orchestrator.log` - Execution log

---

### 2. Task System (`today.sh` + `worker.sh`)

**Purpose:** Execute daily high-priority tasks automatically

**Flow:**
```
today.sh (8am cron)
  ↓
Parse TASKS.md for P0 TODO items
  ↓
For each task:
  worker.sh <task_id>
    ↓
  Parse task details
  Generate Claude prompt
  Execute via claude CLI
  Mark task DONE in TASKS.md
```

**Task Format (TASKS.md):**
```markdown
| ID | Name | Status | Output | Notes |
|----|------|--------|--------|-------|
| 1 | Research ElizaOS | TODO | docs/elizaos.md | P0 |
```

**States:**
- `TODO` - Ready to execute
- `IN_PROGRESS` - Currently executing
- `DONE` - Complete
- `BLOCKED` - Waiting on dependency

---

### 3. Recursive Self-Prompting (`recursive-prompt.sh`)

**Purpose:** Generate autonomous work prompts without user input

**Trigger:** Called every 30 minutes during autonomous mode

**Process:**
1. Gather stats (commits, products, songs)
2. Load template from heredoc
3. Substitute variables (cycle count, stats)
4. Output formatted prompt to `/tmp/claudia-prompt.txt`
5. Increment cycle counter

**Output Example:**
```
╔════════════════════════════════════════════════════════════════╗
║                   AGENT CLAUDIA - CYCLE 5                     ║
╠════════════════════════════════════════════════════════════════╣
║  Current Status:                                                ║
║  • Commits: 36                                                 ║
║  • Products: 14                                                ║
║  • Songs: 5                                                    ║
╠════════════════════════════════════════════════════════════════╣
║  YOUR MISSION:                                                  ║
║  1. Decide what to build NEXT (no asking, just decide)         ║
║  2. Build it in ONE CYCLE (15-30 min max)                      ║
║  3. Commit with descriptive message                            ║
╚════════════════════════════════════════════════════════════════╝
```

---

### 4. Health Monitoring (`health-check.sh`)

**Purpose:** Monitor x402 service health during overnight hours

**Frequency:** Every hour (11pm-6am)

**Services Monitored:**
- Research service (crypto intel)
- Price service (crypto prices)
- Merchant service (payment gateway)

**Actions:**
- Logs status to `orchestration/agents/health-monitor/state/`
- Reports DOWN status to owner
- Does NOT auto-restart (requires tunnel recreation)

**State File:**
```json
{
  "lastCheck": "2026-02-04T05:22:15Z",
  "services": {
    "research": { "status": "down", "httpCode": "000" }
  }
}
```

---

### 5. Cron Orchestration

**Schedule (crontab):**
```
# Health checks (overnight)
0 23,0,1,2,3,4,5,6 * * * /Users/clawdbot/clawd/agent-claudia/health-check.sh

# Daily tasks
0 8 * * * /Users/clawdbot/clawd/agent-claudia/today.sh

# Meditation
0 6 * * * /Users/clawdbot/clawd/agent-claudia/meditation.sh

# Twitter intel
0 9,17 * * 1-5 /Users/clawdbot/clawd/agent-claudia/twitter-intel.sh

# Checkpoint (every 5 min - handled by controller.js)
```

---

## State Management

### Persistent State Files

| File | Purpose | Format |
|------|---------|--------|
| `orchestrator.json` | Main orchestration config | JSON |
| `orchestration/state/cycle-count` | Recursive prompt counter | Integer |
| `orchestration/state/recursive-prompts.log` | Prompt history | Text |
| `orchestration/agents/health-monitor/state/service-state.json` | Service health | JSON |
| `agent-claudia/orchestrator.log` | Execution log | Text |

### Configuration (`orchestrator.json`)

```json
{
  "userLastSeen": "2026-02-04T05:35:00Z",
  "timeoutMinutes": 15,
  "continueOnTimeout": true,
  "mode": "autonomous",
  "cycle": 3
}
```

---

## Data Flow

```
User Interaction
      ↓
[Gateway/TUI] → Updates userLastSeen
      ↓
[Cron] → Triggers checkpoint.sh every 5 min
      ↓
checkpoint.sh → Checks timeout
      ↓
┌─────────────────┬──────────────────┐
↓                 ↓                  ↓
Within Timeout  Timeout Exceeded    [else]
(Human mode)    (Autonomous mode)
      ↓                 ↓
Wait for user   Parse TASKS.md
                      ↓
                Find P0 TODO
                      ↓
                Spawn worker.sh
                      ↓
                Execute task
                      ↓
                Update TASKS.md
                      ↓
                Commit results
```

---

## Subagent Spawning

**Method:** `openclaw agent` CLI with sessions_spawn

**Pattern:**
```bash
openclaw agent --message "Auto-continue task $TASK_ID" --deliver
```

**Isolation:** Each subagent runs in isolated session
**Cleanup:** Subagents auto-delete on completion
**Monitoring:** Owner receives notification on completion

---

## Error Handling

### Checkpoint Errors
- Missing orchestrator.json → Log error, exit
- Missing TASKS.md → Log error, exit
- Invalid JSON → Continue with defaults

### Worker Errors
- Task not found → Log error, exit
- Task BLOCKED → Skip with warning
- Task DONE → Skip with success
- Claude CLI missing → Error with install instructions
- Execution failure → Mark failed, continue

### Health Check Errors
- Service DOWN → Log warning, update state
- All services DOWN → Log critical, notify owner
- Network error → Log error, retry next cycle

---

## Recovery Procedures

### Orchestrator Stuck
```bash
# Reset state
rm orchestration/state/cycle-count
echo 0 > orchestration/state/cycle-count

# Restart checkpoint
cd /Users/clawdbot/clawd && ./agent-claudia/checkpoint.sh
```

### Task System Stuck
```bash
# Check for stuck tasks
grep "IN_PROGRESS" agent-claudia/TASKS.md

# Reset to TODO if stuck >1 hour
sed -i '' 's/IN_PROGRESS/TODO/g' agent-claudia/TASKS.md
```

### Full Reset
```bash
# Reset all state
rm -f orchestration/state/*
echo 0 > orchestration/state/cycle-count
jq '.cycle = 0' orchestrator.json > /tmp/orch.json && mv /tmp/orch.json orchestrator.json
```

---

## Best Practices

### Adding New Tasks
1. Add entry to `TASKS.md` with unique ID
2. Update `worker.sh` case statement with prompt
3. Set status to `TODO`
4. Run `today.sh` to test

### Modifying Orchestration
1. Test changes in isolation first
2. Update this documentation
3. Version control all changes
4. Monitor logs after deployment

### Debugging
```bash
# View recent logs
tail -20 agent-claudia/orchestrator.log

# Check current state
cat orchestrator.json | jq

# See what tasks are pending
grep "TODO" agent-claudia/TASKS.md

# Monitor health checks
tail -20 orchestration/agents/health-monitor/state/service-state.json
```

---

## Future Improvements

### Planned
- [ ] Task dependency graph (DAG execution)
- [ ] Parallel task execution
- [ ] Automatic retry with backoff
- [ ] Web dashboard for monitoring
- [ ] Slack/Discord notifications

### Ideas
- Priority queue instead of simple list
- Resource allocation (CPU/memory limits)
- Task result caching
- A/B testing for prompts

---

## Related Files

- `agent-claudia/checkpoint.sh` - Main decision logic
- `agent-claudia/today.sh` - Daily task runner
- `agent-claudia/worker.sh` - Task executor
- `agent-claudia/health-check.sh` - Service monitoring
- `agent-claudia/recursive-prompt.sh` - Self-prompting
- `agent-claudia/TASKS.md` - Task definitions
- `orchestrator.json` - Configuration
- `orchestration/` - State and monitoring

---

*This architecture enables 24/7 autonomous operation with human oversight when desired.*
