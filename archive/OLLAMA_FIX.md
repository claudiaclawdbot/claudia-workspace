# Fix Ollama MLX/Metal Crash (macOS)

*Why OpenClaw gets no answer when switched to Ollama — and how to fix it.*

---

## What’s wrong

On this Mac, **Ollama crashes on startup** with:

```
NSRangeException: index 0 beyond bounds for empty array
```

The crash happens in **MLX (Metal)** init: `imagegen/mlx` → `mlx_random_key` → Metal device list is empty, then code accesses index 0 and aborts. So:

- `ollama list` and `ollama ps` crash.
- No server runs on `localhost:11434`.
- When OpenClaw is set to Ollama, requests go to Ollama and get no response → you see no answer.

---

## Fix (run these in your terminal)

You need **write access to Homebrew** so Ollama can be upgraded. Run:

```bash
# 1. Fix Homebrew permissions (sudo will ask for your password)
sudo chown -R $(whoami) /Users/$(whoami)/Library/Logs/Homebrew /opt/homebrew /opt/homebrew/Cellar /opt/homebrew/Frameworks /opt/homebrew/bin /opt/homebrew/etc /opt/homebrew/etc/bash_completion.d /opt/homebrew/include /opt/homebrew/lib /opt/homebrew/lib/pkgconfig /opt/homebrew/opt /opt/homebrew/sbin /opt/homebrew/share /opt/homebrew/share/aclocal /opt/homebrew/share/doc /opt/homebrew/share/info /opt/homebrew/share/man /opt/homebrew/share/man/man1 /opt/homebrew/share/man/man3 /opt/homebrew/share/man/man5 /opt/homebrew/share/man/man7 /opt/homebrew/share/man/man8 /opt/homebrew/share/zsh /opt/homebrew/share/zsh/site-functions /opt/homebrew/var/homebrew/linked /opt/homebrew/var/homebrew/locks /opt/homebrew/var/log

# 2. Upgrade Ollama (newer versions may fix the MLX crash)
brew upgrade ollama

# 3. Start Ollama (pick one)
brew services start ollama
# OR open the Ollama app from Applications / menu bar

# 4. Verify
./scripts/fix-ollama.sh
```

If step 4 passes, OpenClaw can use Ollama again (e.g. `/model ollama/llama3.1:8b`).

---

## One-liner script

From the repo root:

```bash
./scripts/fix-ollama.sh
```

- If Ollama is still crashing, the script prints the same fix commands above and exits with code 1.
- If Ollama is running, the script checks the server and warms up the model, then prints “Done. You can use OpenClaw with Ollama now.”

To only print the fix commands:

```bash
./scripts/fix-ollama.sh --print-fix
```

---

## If upgrade doesn’t fix it

1. **Use the Ollama app** — Quit any CLI Ollama, open the Ollama app from Applications. Sometimes Metal works when the app runs in the GUI session.
2. **Check for newer Ollama releases** — [ollama.com](https://ollama.com) or [GitHub releases](https://github.com/ollama/ollama/releases). Newer builds may fix the MLX/Metal init bug.
3. **Until Ollama works** — In OpenClaw, switch back to Anthropic or OpenRouter so you get answers; retry Ollama after an update or on another machine.

---

## Summary

| Problem | Ollama crashes on startup (MLX/Metal empty device array). |
| Fix | Fix Homebrew permissions, `brew upgrade ollama`, start Ollama, then run `./scripts/fix-ollama.sh`. |
| Script | `scripts/fix-ollama.sh` — checks CLI + server, warms up model, or prints fix commands. |
