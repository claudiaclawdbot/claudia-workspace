# Full health check + restart (2026-02-01)

## What was checked

- **Config paths** — `openclaw.json` workspace is `/Users/clawdbot/clawd`; that dir exists with `memory/`, `skills/` (evm-wallet, moltbook, qmd), and all expected files. No stale moltbot/clawdbot paths in main config.
- **Gateway logs** — Errors were 429 rate limits and "No available auth profile (all in cooldown)". So Anthropic was in cooldown and the slug-generator (session-memory) was failing on that; main agent runs were also hitting 429 then should fall back to Ollama.
- **Auth cooldown** — Cleared again so the next message will try Anthropic first. If you're still rate limited, it will fall back to Ollama (if Ollama responds in time you'll get a reply; if it times out you should at least see the error in the UI after the gateway fix).
- **Full stop/start** — Gateway was stopped (LaunchAgent unloaded), auth cooldown cleared, then gateway was reinstalled and started. Status: **Gateway running** (reachable, LaunchAgent loaded, pid active).

## Current status (from `openclaw status`)

- **Dashboard:** http://127.0.0.1:18789/
- **Gateway:** local, reachable ~39ms, auth token
- **Gateway service:** LaunchAgent installed · loaded · running
- **Agents:** 1, default main active
- **Memory:** plugin memory-core enabled but reported "unavailable" (may need a separate look)
- **Sessions:** 1 active, default claude-sonnet-4-5

## What to do next

1. **Try the Control UI again** — Open the dashboard or your usual OpenClaw control, send a short message. You should get either a reply or a visible error message (no more silent failure).
2. **If you still get no answer** — Check `~/.openclaw/logs/gateway.err.log` for the latest `lane task error` or `FailoverError` right after you send a message. That will show whether it's 429 → Ollama timeout or something else.
3. **If Ollama is slow** — Warm it up first:  
   `curl -s -X POST http://localhost:11434/v1/chat/completions -H "Content-Type: application/json" -d '{"model":"llama3.1:8b","messages":[{"role":"user","content":"hi"}],"max_tokens":5}'`  
   Then send a message in the UI.

## Note on evm-wallet skill

The logs had one error: `Cannot find module '/Users/clawdbot/clawd/skills/evm-wallet/src/setup.js'`. That path exists on disk; the error may have been from a different cwd (e.g. /private/tmp). If a specific skill keeps failing, we can dig into that next.
