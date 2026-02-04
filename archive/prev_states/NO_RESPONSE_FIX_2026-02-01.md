# No Response in OpenClaw Control — Fix (2026-02-01)

## What was wrong

1. **Gateway never showed error/final reply when the run failed**  
   In `chat.send`, the control UI only broadcast the final reply when `!agentRunStarted`. So when you sent a message, the run started, then failed (429 or "All models failed" from Ollama timeout), the error text was never sent to the UI — you saw nothing.

2. **Anthropic profile was stuck in cooldown**  
   After repeated 429s, `anthropic:default` was in cooldown until ~16:44. So the runner skipped Anthropic and tried Ollama; if Ollama timed out, you got "All models failed" but (because of #1) no message in the UI.

## What was changed

1. **Gateway** (`/opt/homebrew/lib/node_modules/openclaw/dist/gateway/server-methods/chat.js`)  
   - Logic now broadcasts the final reply whenever there is any final reply content (`finalReplyParts.length > 0`), not only when the agent run never started.  
   - So when the run fails, you now see the error in the control UI (e.g. "⚠️ Agent failed before reply: ...").

2. **Auth cooldown cleared** (`~/.openclaw/agents/main/agent/auth-profiles.json`)  
   - `cooldownUntil` and failure counts for `anthropic:default` were reset so Anthropic is tried again on the next message.  
   - If you’re still rate limited, you’ll get 429 → fallback to Ollama; if Ollama answers, you’ll see it; if Ollama times out, you’ll at least see the error message.

## What you need to do

1. **Restart the OpenClaw gateway** so the chat.js change is loaded (e.g. restart from the main OpenClaw control or menubar).
2. **Send a message again** in the control UI.  
   - If Anthropic works (limit reset), you get a normal reply.  
   - If you get 429 and fallback to Ollama works, you get an Ollama reply.  
   - If both fail, you should now see the error text in the chat instead of no response.

## If you still get no reply

- Check `~/.openclaw/logs/gateway.err.log` for the latest `lane task error` or `FailoverError`.  
- If you see "All models failed" and "ollama/llama3.1:8b: LLM request timed out", Ollama is too slow; try warming it up first:  
  `curl -s -X POST http://localhost:11434/v1/chat/completions -H "Content-Type: application/json" -d '{"model":"llama3.1:8b","messages":[{"role":"user","content":"hi"}],"max_tokens":5}'`  
  Then send a short message in the control UI.

## Note on the gateway patch

The change was made in the **installed** OpenClaw package under Homebrew (`/opt/homebrew/lib/node_modules/openclaw/`). An `openclaw update` or reinstall may overwrite it. If "no response on failure" comes back after an update, re-apply the same logic: broadcast the final reply whenever `combinedReply` (from `finalReplyParts`) is non-empty, not only when `!agentRunStarted`.
