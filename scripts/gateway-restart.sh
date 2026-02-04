#!/usr/bin/env bash
# Stop the running gateway, then start it again (so you can run it in foreground in this terminal).
set -e
echo "Stopping gateway..."
openclaw gateway stop 2>/dev/null || true
# Kill anything still on 18789 (in case stop didn't clean up)
sleep 1
if command -v lsof >/dev/null 2>&1; then
  PIDS=$(lsof -ti :18789 2>/dev/null || true)
  if [[ -n "$PIDS" ]]; then
    echo "Killing process(es) on port 18789: $PIDS"
    echo "$PIDS" | xargs kill -9 2>/dev/null || true
    sleep 2
  fi
fi
echo "Starting gateway (run in foreground)..."
exec openclaw gateway run
