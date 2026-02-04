#!/usr/bin/env bash
# gateway-full-reset.sh — Stop ALL gateway processes so a fresh one loads config (primary=ollama).
# Run in your terminal. Then start the gateway in ONE way only (see end of script).
set -e
GATEWAY_PORT=18789

echo "[1/4] Stopping OpenClaw gateway service..."
openclaw gateway stop 2>/dev/null || true

echo "[2/4] Uninstalling gateway service (LaunchAgent) so it won't auto-start..."
openclaw gateway uninstall 2>/dev/null || true

echo "[3/4] Killing any process still using port $GATEWAY_PORT..."
if command -v lsof >/dev/null 2>&1; then
  PIDS=$(lsof -ti ":$GATEWAY_PORT" 2>/dev/null || true)
  if [[ -n "$PIDS" ]]; then
    echo "$PIDS" | xargs kill -9 2>/dev/null || true
    echo "    Killed PID(s): $PIDS"
  else
    echo "    No process on port $GATEWAY_PORT"
  fi
else
  echo "    (lsof not found, skipping port kill)"
fi

echo "[4/4] Done. Start the gateway in ONE way only:"
echo ""
echo "  In a terminal, run (foreground — reads config from disk):"
echo "    openclaw gateway run"
echo ""
echo "  Leave that terminal open. Open the TUI in another window/tab and connect."
echo "  Send a message; you should get a reply from Ollama (first reply may take 15–30s)."
echo ""
echo "  When you're done testing, Ctrl+C the gateway, then reinstall the service:"
echo "    openclaw gateway install"
echo "    openclaw gateway start"
echo ""
