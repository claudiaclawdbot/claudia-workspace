#!/usr/bin/env bash
# fix-ollama.sh — Get Ollama working after MLX/Metal crash on macOS
# Run from repo root or with cd to this script's dir.
# Usage: ./scripts/fix-ollama.sh   (checks and fixes) or ./scripts/fix-ollama.sh --print-fix (only print commands to run)

set -e

OLLAMA_HOST="${OLLAMA_HOST:-http://127.0.0.1:11434}"
WARMUP_URL="${OLLAMA_HOST}/v1/chat/completions"
MODEL="${OLLAMA_MODEL:-llama3.1:8b}"

log() { echo "[fix-ollama] $*"; }
err() { echo "[fix-ollama] ERROR: $*" >&2; }

# --- 1. Print fix commands (run these if Ollama is crashing) ---
print_fix_commands() {
  log "Ollama is crashing on startup (MLX/Metal 'empty array' bug)."
  echo ""
  echo "Run these in your terminal (sudo will ask for your password):"
  echo ""
  echo "  # Fix Homebrew permissions and upgrade Ollama"
  echo "  sudo chown -R \$(whoami) /Users/\$(whoami)/Library/Logs/Homebrew /opt/homebrew /opt/homebrew/Cellar /opt/homebrew/Frameworks /opt/homebrew/bin /opt/homebrew/etc /opt/homebrew/etc/bash_completion.d /opt/homebrew/include /opt/homebrew/lib /opt/homebrew/lib/pkgconfig /opt/homebrew/opt /opt/homebrew/sbin /opt/homebrew/share /opt/homebrew/share/aclocal /opt/homebrew/share/doc /opt/homebrew/share/info /opt/homebrew/share/man /opt/homebrew/share/man/man1 /opt/homebrew/share/man/man3 /opt/homebrew/share/man/man5 /opt/homebrew/share/man/man7 /opt/homebrew/share/man/man8 /opt/homebrew/share/zsh /opt/homebrew/share/zsh/site-functions /opt/homebrew/var/homebrew/linked /opt/homebrew/var/homebrew/locks /opt/homebrew/var/log"
  echo ""
  echo "  brew upgrade ollama"
  echo ""
  echo "Then start Ollama (pick one):"
  echo "  brew services start ollama   # background service"
  echo "  # OR open the Ollama app from Applications / menu bar"
  echo ""
  echo "Then run this script again to verify: ./scripts/fix-ollama.sh"
  echo ""
}

# --- 2. Check if Ollama CLI runs (no crash) ---
check_ollama_cli() {
  if ollama list &>/dev/null; then
    return 0
  fi
  return 1
}

# --- 3. Check if Ollama server is reachable ---
check_ollama_server() {
  if curl -sf --max-time 3 "${OLLAMA_HOST}/api/tags" &>/dev/null; then
    return 0
  fi
  if curl -sf --max-time 3 "http://127.0.0.1:11434/api/tags" &>/dev/null; then
    return 0
  fi
  return 1
}

# --- 4. Warm up the model (first request can be slow) ---
warmup_model() {
  log "Warming up model ${MODEL} (may take 30–60s first time)..."
  if curl -sf --max-time 90 -X POST "${OLLAMA_HOST}/v1/chat/completions" \
    -H "Content-Type: application/json" \
    -d "{\"model\":\"${MODEL}\",\"messages\":[{\"role\":\"user\",\"content\":\"hi\"}],\"max_tokens\":20}" &>/dev/null; then
    log "Warm-up OK."
    return 0
  fi
  # Try legacy endpoint
  if curl -sf --max-time 90 -X POST "${OLLAMA_HOST}/api/generate" \
    -H "Content-Type: application/json" \
    -d "{\"model\":\"${MODEL}\",\"prompt\":\"hi\",\"stream\":false}" &>/dev/null; then
    log "Warm-up OK (legacy API)."
    return 0
  fi
  return 1
}

# --- Main ---
main() {
  if [[ "${1:-}" == "--print-fix" ]]; then
    print_fix_commands
    exit 0
  fi

  log "Checking Ollama..."

  if ! check_ollama_cli; then
    err "Ollama CLI still crashes (e.g. MLX/Metal init)."
    print_fix_commands
    exit 1
  fi
  log "Ollama CLI OK."

  if ! check_ollama_server; then
    err "Ollama server not reachable at ${OLLAMA_HOST}. Start it with: brew services start ollama  (or open the Ollama app)"
    exit 1
  fi
  log "Ollama server OK."

  if ! warmup_model; then
    err "Warm-up request failed. Check model name: ollama list"
    exit 1
  fi

  log "Done. You can use OpenClaw with Ollama now (e.g. /model ollama/llama3.1:8b)."
  exit 0
}

main "$@"
