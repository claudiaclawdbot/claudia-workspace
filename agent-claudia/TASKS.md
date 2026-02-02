# CLAUDIA Task System

Last Updated: 2025-02-02

## How It Works

- **TASKS.md** = Master list (this file) - human editable
- **today.sh** = Run today's high priority tasks
- **worker.sh** = Execute individual tasks via Claude Code CLI
- **Cron** = Auto-runs daily at 8am

## Status Legend

- `TODO` - Not started
- `IN_PROGRESS` - Currently working on it
- `BLOCKED` - Waiting on something
- `DONE` - Complete

## Tasks

### 🔴 P0 - Critical (Do First)

| ID | Task | Status | Output File | Notes |
|----|------|--------|-------------|-------|
| 1 | ElizaOS evaluation (quick research) | DONE | `memory/elizaos-eval.md` | Verdict: Build custom, not ElizaOS |
| 2 | FIDGET-SPINNER Phase 1 design doc | DONE | `github.com/claudiaclawdbot/fidget-play` | ✅ SHIPPED: SPIN + StakeGauge contracts |
| 3 | x402 skill spec document | DONE | `skills/x402/SKILL.md` | ✅ SHIPPED: github.com/claudiaclawdbot/openclaw-skills |
| 4 | Social agent system outline | DONE | `github.com/claudiaclawdbot/claudia-social` | ✅ SHIPPED: Clawk integration ready |

### 🟡 P1 - Important

| ID | Task | Status | Output File | Notes |
|----|------|--------|-------------|-------|
| 5 | TBD | TODO | - | - |

### 🟢 P2 - Backlog

| ID | Task | Status | Output File | Notes |
|----|------|--------|-------------|-------|
| 6 | TBD | TODO | - | - |

---

## Daily Run Log

| Date | Tasks Run | Results |
|------|-----------|---------|
| 2025-02-02 | - | Initial setup |

## Quick Commands

```bash
# Run today's tasks
/Users/clawdbot/clawd/agent-claudia/today.sh

# Run specific task by ID
/Users/clawdbot/clawd/agent-claudia/worker.sh 2

# Mark task done (manual)
# Edit this file, change TODO -> DONE
```
