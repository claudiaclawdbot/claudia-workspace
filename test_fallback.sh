#!/bin/bash
# Test if fallback works by forcing Anthropic to fail (auth) so OpenClaw should switch to Ollama.
# See FALLBACK_FIX_2026-02-01.md for why we do this and what to do with results.
#
# Requires: --local (embedded run) and --session-id so we don't need gateway/to.
# Ollama can be slow on first request; 90s timeout gives it time.

set -e
echo "=== Testing Model Fallback (auth force-fail) ==="
echo "Using invalid Anthropic key so primary fails → should fallback to Ollama."
echo ""

ANTHROPIC_API_KEY=invalid openclaw agent --local --session-id test-fallback --message "Reply with only: FALLBACK_OK" --timeout 90

echo ""
echo "=== Done ==="
echo "If you got a short reply (e.g. FALLBACK_OK), fallback to Ollama works."
echo "If Ollama timed out, try again (cold start) or increase --timeout."
