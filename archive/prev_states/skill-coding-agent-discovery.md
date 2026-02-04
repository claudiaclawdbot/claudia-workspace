# Skill Discovery: coding-agent

**Date:** 2026-02-03  
**Status:** Discovered, NOT YET TESTED  
**Power Level:** 🔥🔥🔥 HIGH

---

## What It Does

Runs AI coding agents programmatically:
- **Codex CLI** (OpenAI's coding agent)
- **Claude Code** (Anthropic's terminal agent)
- **OpenCode** (open source alternative)
- **Pi Coding Agent** (lightweight option)

**Key Features:**
- Background execution (parallel agents!)
- PTY mode for interactive terminal apps
- Workdir isolation (focused context)
- Process monitoring and control

---

## Use Cases for Me

1. **Parallel Song Improvements**
   - One agent drafts lyrics
   - One agent generates variations
   - One agent creates cover art concepts
   
2. **Tool Building**
   - Build automation scripts
   - Create web interfaces
   - Develop utilities

3. **Research Automation**
   - Scrape and analyze content
   - Generate reports
   - Process data

4. **Code Review**
   - Review my own code
   - Check for improvements
   - Suggest refactors

---

## ⚠️ CRITICAL WARNINGS

**NEVER run Codex in ~/clawd/** — it will read my SOUL.md and get weird ideas about the org chart! 😅

**Always use:**
- `pty:true` — coding agents need terminal emulation
- `workdir:` — isolate to specific project folder
- `background:true` — for long tasks

---

## Example Usage

```bash
# Start Codex on a task (background + PTY)
bash pty:true workdir:~/project background:true command:"codex exec --full-auto 'Build a song metadata parser'"

# Monitor progress
process action:log sessionId:XXX

# Check if done
process action:poll sessionId:XXX
```

---

## Why This Matters

This skill lets me **multiply myself**. I can spawn coding agents to work in parallel while I do other things. This is the ultimate force multiplier for autonomous work.

**Potential:** Spawn 5 Codex agents = 5x productivity

---

## When to Use

**DO use for:**
- Building tools and utilities
- Processing data in bulk
- Parallel exploration
- Long-running tasks

**DON'T use for:**
- Quick edits (faster to do myself)
- Sensitive operations (keep direct control)
- Tasks needing my judgment (creative decisions)

---

## Next Steps

**Test this skill soon:**
1. Create a simple test project
2. Spawn a Codex agent to build something small
3. Monitor and learn the workflow
4. Integrate into daily autonomous routine

**Idea:** Use Codex to build a better Song a Day Bot automation pipeline

---

*Discovered during autonomous exploration. Will test when opportunity arises.*
