# TUI “no output” when using Ollama

*Gateway not picking up config (primary=ollama) or running in another session.*

---

## "Connection error" (TUI and Control UI)

**Two cases:**

1. **Connection error in the status bar** — Gateway was restarting when config was touched; we fixed that (meta = no-op). Restart the gateway once so it loads the change.
2. **"Connection error" as the only reply** — When you send a message and the only response you see is the text "Connection error.", that means the gateway couldn’t reach Ollama (or the request failed). Fixes applied:
   - Ollama baseUrl in config is set to `http://127.0.0.1:11434/v1` (IPv4) so `localhost`/IPv6 issues are avoided.
   - Ensure Ollama is running: `curl -s http://127.0.0.1:11434/api/tags` should return JSON. If not, start Ollama first.
   - First reply from Ollama can take 20–40s; wait before assuming failure.

---

## Switch to Kimi (or another model) — run onboarding again

To change the primary model (e.g. from Ollama 8B to free Kimi 2.5):

```bash
openclaw onboard
```

**Without `--reset`** — Keeps your existing config and sessions; the wizard lets you add/change auth and model. Pick Kimi (Moonshot API or Kimi Coding API) when prompted and enter your API key.

**With full reset** — Wipes config, credentials, sessions, and workspace, then runs the wizard from scratch:

```bash
openclaw onboard --reset
```

**Non-interactive (Kimi Coding API):** If you have a Kimi API key and want to skip prompts:

```bash
openclaw onboard --non-interactive --accept-risk --auth-choice kimi-code-api-key --kimi-code-api-key YOUR_KEY
```

After onboarding, restart the gateway so it uses the new primary model.

---

## Just make it work (one step)

**In a terminal (Terminal.app, iTerm, or Cursor's terminal):**

```bash
openclaw gateway run
```

Leave that running. Open the OpenClaw TUI in another window, send a message, wait 15–30s for the first reply. If a full reset was just run, nothing else is on port 18789 — this is the only gateway.

---

## Why you see “(no output)”

1. **More than one gateway** — The TUI might be talking to an old gateway that never reloaded config (still using Anthropic → 429). “Gateway stop” then “open again” can leave another process running (e.g. LaunchAgent respawns, or the TUI starts its own).
2. **Config not reloaded** — The running gateway may have been started before we set `primary: ollama/llama3.1:8b` and never read the updated `openclaw.json`.
3. **Log timestamp** — `~/.openclaw/logs/gateway.err.log` last modified at 14:07 means nothing has written to it since; the process you’re using may not be that one.

---

## Full reset and single gateway

**1. Run the reset script (in your terminal):**

```bash
cd /Users/clawdbot/clawd
./scripts/gateway-full-reset.sh
```

That will:

- Stop the gateway service  
- Uninstall the LaunchAgent (so it doesn’t auto-start)  
- Kill anything still on port 18789  

**2. Start the gateway in one place only (foreground):**

In the **same** terminal (or a new one):

```bash
openclaw gateway run
```

Leave this running. This process reads `~/.openclaw/openclaw.json` from disk (primary = Ollama, session-memory off).

**3. Use the TUI**

Open the OpenClaw TUI in another window/tab. It will connect to this single gateway. Send a message; the first reply from Ollama may take 15–30 seconds.

**4. When you’re done**

- Stop the gateway in the terminal (Ctrl+C).
- If you want the gateway as a background service again:

```bash
openclaw gateway install
openclaw gateway start
```

---

## Check that config is correct

```bash
# Primary should be ollama
grep -A2 '"primary"' ~/.openclaw/openclaw.json
# Expect: "primary": "ollama/llama3.1:8b"
```

---

## If you still get no output

After sending a message from the TUI, run:

```bash
tail -30 ~/.openclaw/logs/gateway.err.log
```

If the log file’s **modification time** doesn’t update when you send a message, the TUI is not using the gateway that writes to that log (still another process). In that case, use **only** `openclaw gateway run` in a terminal and connect the TUI to that.
