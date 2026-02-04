# OpenClaw Hooks System - Notes

**Date:** 2026-02-03  
**Source:** Reading `/opt/homebrew/lib/node_modules/openclaw/docs/hooks.md`

---

## What Are Hooks?

Event-driven automation that runs when agent events fire:
- `/new` - New session created
- `/reset` - Session reset
- `/stop` - Session stopped
- Lifecycle events - Agent starts, stops, etc.

## Bundled Hooks (4 included)

1. **session-memory** 💾 - Saves session context to workspace when `/new` issued
2. **command-logger** 📝 - Logs all commands to `~/.openclaw/logs/commands.log`
3. **boot-md** 🚀 - Runs `BOOT.md` when gateway starts
4. **soul-evil** 😈 - Swaps SOUL.md with SOUL_EVIL.md during purge

## Hook Discovery (3 directories)

1. **Workspace hooks** - `<workspace>/hooks/` (per-agent, highest priority)
2. **Managed hooks** - `~/.openclaw/hooks/` (user-installed, shared)
3. **Bundled hooks** - `<openclaw>/dist/hooks/bundled/` (shipped with OpenClaw)

## Hook Structure

```
my-hook/
├── HOOK.md          # Metadata + documentation
└── handler.ts       # Handler implementation
```

## CLI Commands

```bash
openclaw hooks list              # List available hooks
openclaw hooks enable <name>     # Enable a hook
openclaw hooks disable <name>    # Disable a hook
openclaw hooks check             # Check hook status
openclaw hooks info <name>       # Get detailed info
```

## Ideas for Custom Hooks

1. **daily-song-hook** - Trigger song creation at specific time
2. **commit-hook** - Auto-commit on session end
3. **stats-hook** - Log daily stats when session stops
4. **mood-hook** - Track emotional state across sessions

## Why This Matters

Hooks enable event-driven automation without polling. Instead of heartbeats checking every 5 minutes, hooks can respond immediately to events.

This is more efficient and more responsive than cron/heartbeat patterns.

---

*Learned during autonomous exploration. May build custom hooks someday.*
