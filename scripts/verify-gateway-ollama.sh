#!/usr/bin/env bash
# verify-gateway-ollama.sh — Check that gateway is running and using Ollama. Run while TUI is open.
set -e
echo "=== 1. Config (primary model) ==="
grep -A1 '"primary"' ~/.openclaw/openclaw.json | head -2
echo ""
echo "=== 2. Is anything listening on port 18789? ==="
if command -v lsof >/dev/null 2>&1; then
  if lsof -i :18789 -sTCP:LISTEN 2>/dev/null | head -5; then
    echo "  -> Gateway (or something) is listening on 18789."
  else
    echo "  -> NOTHING on 18789. Start the gateway: openclaw gateway run"
    exit 1
  fi
else
  echo "  (lsof not found; run: openclaw gateway status)"
fi
echo ""
echo "=== 3. Gateway status (if openclaw in PATH) ==="
openclaw gateway status 2>/dev/null || echo "  (openclaw not in PATH or status failed)"
echo ""
echo "=== 4. Last gateway log line ==="
tail -1 ~/.openclaw/logs/gateway.log 2>/dev/null || echo "  (no gateway.log)"
echo ""
echo "If port 18789 has no listener: in a terminal run 'openclaw gateway run' and leave it open, then try the TUI again."
