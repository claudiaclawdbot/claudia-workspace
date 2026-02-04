#!/usr/bin/env bash
#===============================================================================
#
#          FILE: gateway-full-reset.sh
#
#         USAGE: ./gateway-full-reset.sh
#
#   DESCRIPTION: Nuclear option - stop ALL gateway processes for fresh start
#
#       OPTIONS: None
#
#  REQUIREMENTS: openclaw CLI
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
GATEWAY_PORT="${GATEWAY_PORT:-18789}"
SCRIPT_NAME="$(basename "${BASH_SOURCE[0]}")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging
log_info() { echo -e "${BLUE}[INFO]${NC} $*"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
log_error() { echo -e "${RED}[ERROR]${NC} $*"; }
log_success() { echo -e "${GREEN}[OK]${NC} $*"; }

# Main logic
main() {
    log_warn "=== FULL GATEWAY RESET ==="
    log_warn "This is the nuclear option. Use when normal restart fails."
    echo ""
    
    # 1. Stop service
    log_info "[1/4] Stopping OpenClaw gateway service..."
    openclaw gateway stop 2>/dev/null || true
    
    # 2. Uninstall service
    log_info "[2/4] Uninstalling gateway LaunchAgent..."
    openclaw gateway uninstall 2>/dev/null || true
    
    # 3. Kill any process on port
    log_info "[3/4] Killing any process on port $GATEWAY_PORT..."
    if command -v lsof >/dev/null 2>&1; then
        PIDS=$(lsof -ti :"$GATEWAY_PORT" 2>/dev/null || true)
        if [[ -n "$PIDS" ]]; then
            echo "$PIDS" | xargs kill -9 2>/dev/null || true
            log_success "Killed PID(s): $PIDS"
        else
            log_info "No process on port $GATEWAY_PORT"
        fi
    else
        log_warn "lsof not found, skipping port kill"
    fi
    
    # 4. Done
    log_success "[4/4] Reset complete!"
    echo ""
    log_info "Start the gateway in ONE way only:"
    echo ""
    echo "  Run in terminal (foreground, reads config from disk):"
    echo "    openclaw gateway run"
    echo ""
    echo "  Leave terminal open. Open TUI in another window."
    echo "  First Ollama reply may take 15-30s."
    echo ""
    echo "  When done testing, Ctrl+C then reinstall:"
    echo "    openclaw gateway install"
    echo "    openclaw gateway start"
    echo ""
}

# Run main
main "$@"
