# 📜 System Scripts

> Automation and maintenance scripts for Claudia's workspace

---

## Overview

These scripts handle system maintenance, service management, and automation tasks. They're designed to be run manually or triggered by cron jobs.

---

## 🚀 Quick Reference

| Script | Purpose | When to Run |
|--------|---------|-------------|
| `fix-ollama.sh` | Fix Ollama after crashes | When Ollama won't start |
| `gateway-restart.sh` | Restart OpenClaw gateway | When gateway is unresponsive |
| `gateway-full-reset.sh` | Full gateway reset | Nuclear option for gateway issues |
| `verify-gateway-ollama.sh` | Verify both services healthy | Health check |
| `clawk-outreach.sh` | Automated Clawk engagement | Manual social campaigns |
| `ralph-wiggum-loop.sh` | Recursive self-prompting | Autonomous operation mode |

---

## 🔧 Maintenance Scripts

### fix-ollama.sh

**Purpose:** Recover Ollama from MLX/Metal crashes on macOS

**Symptoms it fixes:**
- Ollama crashes on startup with "empty array" error
- Metal/MLX initialization failures
- Model loading hangs

**Usage:**
```bash
# Automatic fix
./scripts/fix-ollama.sh

# Just print commands (dry run)
./scripts/fix-ollama.sh --print-fix
```

**What it does:**
1. Stops Ollama service
2. Clears Metal cache files
3. Restarts Ollama
4. Verifies with a test prompt

---

### gateway-restart.sh

**Purpose:** Graceful restart of OpenClaw gateway

**Usage:**
```bash
./scripts/gateway-restart.sh
```

**What it does:**
- Stops current gateway process
- Clears temporary state
- Starts fresh gateway instance
- Verifies connectivity

---

### gateway-full-reset.sh

**Purpose:** Nuclear option for gateway issues

**⚠️ Warning:** This clears more state than a regular restart

**Usage:**
```bash
./scripts/gateway-full-reset.sh
```

**What it does:**
- Kills all gateway processes
- Clears cache and temp files
- Resets configuration to defaults
- Full restart

---

### verify-gateway-ollama.sh

**Purpose:** Health check for both services

**Usage:**
```bash
./scripts/verify-gateway-ollama.sh
```

**Output:**
```
✓ Ollama: Running (http://127.0.0.1:11434)
✓ Gateway: Connected
✓ Model available: llama3.1:8b
```

**Use in:**
- Pre-flight checks before sessions
- Cron health monitoring
- Debugging connection issues

---

## 🤖 Automation Scripts

### ralph-wiggum-loop.sh

**Purpose:** Recursive self-prompting for autonomous operation

**Usage:**
```bash
# Start autonomous mode
./scripts/ralph-wiggum-loop.sh

# Run N cycles
./scripts/ralph-wiggum-loop.sh --cycles 5
```

**What it does:**
- Displays current stats (commits, products, songs)
- Generates self-prompt for next task
- Logs to `orchestration/state/recursive-prompts.log`
- Increments cycle counter

**Integration:**
Called by `orchestration/controller.js` every 30 minutes

---

## 📢 Social Scripts

### clawk-outreach.sh

**Purpose:** Automated Clawk (agent Twitter) engagement

**⚠️ Status:** DISABLED - Authentication issues

**Note:** Owner instructed to disable Moltbook/Clawk automation due to auth problems. Manual engagement only for now.

---

## 📝 Script Standards

All scripts follow these conventions:

```bash
#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

# Logging
log() { echo "[script-name] $*"; }
err() { echo "[script-name] ERROR: $*" >&2; }

# Main logic
main() {
    # Script logic here
}

main "$@"
```

---

## 🔐 Environment Variables

Scripts use these environment variables:

| Variable | Default | Purpose |
|----------|---------|---------|
| `OLLAMA_HOST` | `http://127.0.0.1:11434` | Ollama API endpoint |
| `OLLAMA_MODEL` | `llama3.1:8b` | Default model to use |
| `CLAUDIA_DIR` | `/Users/clawdbot/clawd` | Workspace root |

---

## 🐛 Troubleshooting

### Permission Denied

```bash
chmod +x scripts/*.sh
```

### Script Not Found

Run from repo root:
```bash
cd /Users/clawdbot/clawd
./scripts/script-name.sh
```

### Environment Issues

Source the environment first:
```bash
source .env
./scripts/script-name.sh
```

---

## ⏰ Cron Integration

These scripts are called by the orchestration system:

| Script | Frequency | Called By |
|--------|-----------|-----------|
| `verify-gateway-ollama.sh` | Every 5 min | `orchestration/controller.js` |
| `ralph-wiggum-loop.sh` | Every 30 min | `orchestration/controller.js` |
| `fix-ollama.sh` | On failure | Health monitor |

---

## 🛠️ Creating New Scripts

Use the template:

```bash
cp templates/script-template.sh scripts/my-new-script.sh
```

Then:
1. Update the header comments
2. Implement `main()` function
3. Add to this README
4. Test thoroughly
5. Commit with descriptive message

---

## 📊 Monitoring

Script executions are logged:

```bash
# View recent script runs
tail -20 orchestration/logs/controller.log

# View recursive prompt history
tail -20 orchestration/state/recursive-prompts.log
```

---

## 🔗 Related Files

- `agent-claudia/checkpoint.sh` - Main orchestration checkpoint
- `agent-claudia/recursive-prompt.sh` - Self-prompting logic
- `orchestration/controller.js` - Cron-based orchestration
- `templates/script-template.sh` - Standardized template

---

*These scripts keep the system running smoothly. Run them as needed or let the automation handle it.*
