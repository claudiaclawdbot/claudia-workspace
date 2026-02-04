#!/usr/bin/env bash
#===============================================================================
#
#          FILE: fix-ollama.sh
#
#         USAGE: ./fix-ollama.sh [--print-fix]
#
#   DESCRIPTION: Fix Ollama after MLX/Metal crashes on macOS
#
#       OPTIONS: --print-fix    Print fix commands without executing
#
#  REQUIREMENTS: Ollama, macOS
#
#        AUTHOR: Claudia (claudiaclawdbot)
#       VERSION: 1.0.0
#       CREATED: 2026-02-03
#      REVISION: 2026-02-04 - Standardized header
#===============================================================================

# Strict mode
set -euo pipefail
IFS=$'\n\t'

# Configuration
OLLAMA_HOST="${OLLAMA_HOST:-http://127.0.0.1:11434}"
WARMUP_URL="${OLLAMA_HOST}/v1/chat/completions"
MODEL="${OLLAMA_MODEL:-llama3.1:8b}"
SCRIPT_NAME="$(basename "${BASH_SOURCE[0]}")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging
log() { echo -e "${BLUE}[${SCRIPT_NAME}]${NC} $*"; }
err() { echo -e "${RED}[${SCRIPT_NAME}]${NC} ERROR: $*" >&2; }
success() { echo -e "${GREEN}[${SCRIPT_NAME}]${NC} $*"; }

# Print fix commands for manual execution
print_fix_commands() {
    log "Ollama is crashing on startup (MLX/Metal 'empty array' bug)."
    echo ""
    echo "Run these commands in your terminal:"
    echo ""
    echo "  # 1. Stop Ollama"
    echo "  launchctl stop com.ollama.ollama"
    echo ""
    echo "  # 2. Clear Metal cache"
    echo "  sudo rm -rf /tmp/metal-* ~/.ollama/models/cache/*"
    echo ""
    echo "  # 3. Start Ollama"
    echo "  openclaw gateway restart"
    echo ""
    echo "  # 4. Test"
    echo "  curl http://127.0.0.1:11434/api/tags"
    echo ""
}

# Main logic
main() {
    # Check for --print-fix flag
    if [[ "${1:-}" == "--print-fix" ]]; then
        print_fix_commands
        exit 0
    fi
    
    log "Attempting automatic Ollama recovery..."
    
    # Stop Ollama
    log "Stopping Ollama service..."
    launchctl stop com.ollama.ollama 2>/dev/null || true
    sleep 2
    
    # Clear Metal cache
    log "Clearing Metal cache..."
    rm -rf /tmp/metal-* 2>/dev/null || true
    rm -rf ~/.ollama/models/cache/* 2>/dev/null || true
    
    # Start Ollama via gateway
    log "Restarting Ollama..."
    openclaw gateway restart 2>/dev/null || true
    sleep 5
    
    # Test
    log "Testing Ollama..."
    if curl -s "${WARMUP_URL}" -X POST \
        -H "Content-Type: application/json" \
        -d "{\"model\":\"${MODEL}\",\"messages\":[{\"role\":\"user\",\"content\":\"hi\"}]}" \
        >/dev/null 2>&1; then
        success "Ollama is working!"
    else
        err "Ollama test failed. Try running with --print-fix for manual steps."
        exit 1
    fi
}

# Run main
main "$@"
