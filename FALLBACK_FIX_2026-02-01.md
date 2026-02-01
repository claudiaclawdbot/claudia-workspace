# Fallback Not Auto-Switching to Ollama — Fix Plan

*2026-02-01 — Why OpenClaw stops answering at usage limit instead of switching to Ollama*

---

## Verified

- **Ollama /v1/chat/completions works.** OpenClaw uses `baseUrl: http://localhost:11434/v1` and `api: openai-completions`. Tested: `curl -X POST http://localhost:11434/v1/chat/completions` returns a valid response.
- **Config is correct.** `openclaw.json` has `primary: anthropic/claude-sonnet-4-5` and `fallbacks: ["ollama/llama3.1:8b"]`.
- **Fallback path exists.** Gateway → auto-reply → `runAgentTurnWithFallback` → `runWithModelFallback` → tries primary, on FailoverError tries Ollama. Same for CLI agent.

---

## Why It Might Not Be Switching

### 1. Error not treated as failover (most likely)

Fallback only runs when the error is a **FailoverError** (or is coerced to one). Coercion uses:

- **HTTP status:** 429 → `rate_limit`, 401/403 → `auth`, 408 → `timeout`.
- **Message:** `classifyFailoverReason(message)` matches patterns like `rate_limit`, `too many requests`, `429`, `usage limit`, `quota exceeded`, etc.

If the Anthropic SDK or HTTP client:

- throws an error **without** `statusCode` / `status` 429, and  
- uses a message that doesn’t match those patterns,

then `coerceToFailoverError` returns `null`, `runWithModelFallback` **rethrows** the original error, and **Ollama is never tried**. You get “stops answering” (or a generic error) instead of fallback.

### 2. Timeout instead of 429

If the API hangs on rate limit instead of returning 429, you get a timeout. Timeouts *are* treated as failover (e.g. “possible rate limit”) and should still trigger the throw that leads to Ollama. So if you see “Trying next account…” in logs but only one Anthropic profile, the code should then throw FailoverError and try Ollama. If you never see that, the failure might be earlier (e.g. error format).

### 3. “All models failed” but user sees nothing

If both Anthropic and Ollama fail, `runWithModelFallback` throws `All models failed (2): ...`. The runner catches it and returns a payload like:  
`⚠️ Agent failed before reply: ... Logs: openclaw logs --follow`.  
If you see **no** message at all, the problem may be delivery (e.g. gateway/Telegram not sending the error payload), not fallback logic.

---

## Diagnostic: Force failover with bad auth

This checks whether **any** failover works (auth → Ollama). If this works, the issue is specific to **rate-limit** error shape.

```bash
cd /Users/clawdbot/clawd
bash test_fallback.sh
```

Or manually (embedded run; needs `--local` and `--session-id` so no gateway/to required):

```bash
ANTHROPIC_API_KEY=invalid openclaw agent --local --session-id test-fallback --message "Reply with only: FALLBACK_OK" --timeout 90
```

**Result (2026-02-01 run):** Fallback **did** trigger. Anthropic failed (invalid key → cooldown), then OpenClaw tried Ollama. Ollama **timed out** at 45s (first request can be slow). So the failover path works; if you hit "stops answering" in production, either (1) the rate-limit error isn’t recognized as FailoverError, or (2) Ollama is timing out when we do fall back — try longer timeout or warm up Ollama first.

- **If you get a short reply (e.g. “FALLBACK_OK”)**  
  Fallback to Ollama works. The bug is likely that **rate-limit errors** from Anthropic don’t have `statusCode: 429` or a message that matches the rate-limit patterns, so they aren’t coerced to FailoverError.

- **If you get an auth error and no reply**  
  Failover isn’t triggering even for auth. Then we need to look at how the runner/gateway calls `runWithModelFallback` and whether errors are wrapped or dropped.

---

## What to do when you hit usage limit again

1. **Check logs right after it happens:**
   ```bash
   tail -100 ~/.openclaw/logs/gateway.err.log | grep -i "rate\|429\|quota\|failover\|ollama\|error"
   ```
2. **Try manual switch:**  
   Send: `/model ollama/llama3.1:8b`  
   Then send a normal message. If that works, the session was still “stuck” on Anthropic; auto-fallback just didn’t run.
3. **Optional:** In another terminal, run:
   ```bash
   tail -f ~/.openclaw/logs/gateway.err.log
   ```
   then trigger the limit again and see the exact error text and whether Ollama is attempted.

---

## Fix options (once we know the cause)

### If rate-limit error isn’t recognized

- **Upstream:** Report to OpenClaw that when Anthropic returns 429/usage limit, the thrown error doesn’t get coerced to FailoverError (include a redacted `gateway.err.log` snippet).
- **Local patch (if you’re comfortable editing installed code):** In  
  `/opt/homebrew/lib/node_modules/openclaw/dist/agents/pi-embedded-helpers/errors.js`,  
  add any **exact** Anthropic rate-limit message substring to `ERROR_PATTERNS.rateLimit` (e.g. the string you see in the logs).  
  **Warning:** Updates to OpenClaw may overwrite this; re-apply or wait for an official fix.

### If “All models failed” but no user message

- Check gateway/Telegram path: ensure the runner’s final error payload is actually sent to the user (e.g. “Agent failed before reply: …”).

### If you want to see when fallback runs

- The runner does **not** pass `onError` to `runWithModelFallback`, so there’s no built-in “anthropic failed, trying ollama” log. You’d need an OpenClaw change (or a local patch) to add `onError` logging in the auto-reply execution path.

---

## Summary

- **Most likely:** Anthropic’s rate-limit error doesn’t have `statusCode: 429` or a message matching the known patterns, so it’s not turned into a FailoverError and Ollama is never tried.
- **Next step:** Run the `ANTHROPIC_API_KEY=invalid` test above. If that falls back to Ollama, we focus on making rate-limit errors look like failover (message pattern or status code). If it doesn’t, we focus on the runner/gateway path and error propagation.
