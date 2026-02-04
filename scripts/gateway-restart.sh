#!/usr/bin/env bash
#===============================================================================
#
#          FILE: gateway-restart.sh
#
#         USAGE: ./gateway-restart.sh
#
#   DESCRIPTION: Restart the OpenClaw gateway service
#
#       OPTIONS: None
#
#  REQUIREMENTS: openclaw CLI, lsof (optional)
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
    log_info "Restarting OpenClaw gateway..."
    
    log_info "Stopping gateway..."
    openclaw gateway stop 2>/dev/null || true
    
    # Kill anything still on gateway port
    sleep 1
    if command -v lsof >/dev/null 2>&1; then
        PIDS=$(lsof -ti :"$GATEWAY_PORT" 2>/dev/null || true)
        if [[ -n "$PIDS" ]]; then
            log_warn "Killing process(es) on port $GATEWAY_PORT: $PIDS"
            echo "$PIDS" | xargs kill -9 2>/dev/null || true
            sleep 2
        fi
    fi
    
    log_success "Gateway stopped"
    log_info "Starting gateway (foreground mode)..."
    
    exec openclaw gateway run
}

# Run main
main "$@"
