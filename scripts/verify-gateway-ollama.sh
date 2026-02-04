#!/usr/bin/env bash
#===============================================================================
#
#          FILE: verify-gateway-ollama.sh
#
#         USAGE: ./verify-gateway-ollama.sh
#
#   DESCRIPTION: Verify gateway is running and using Ollama
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
CONFIG_FILE="${HOME}/.openclaw/openclaw.json"
LOG_FILE="${HOME}/.openclaw/logs/gateway.log"
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
    log_info "=== Gateway + Ollama Health Check ==="
    echo ""
    
    # 1. Config
    log_info "1. Config (primary model):"
    if [[ -f "$CONFIG_FILE" ]]; then
        grep -A1 '"primary"' "$CONFIG_FILE" 2>/dev/null | head -2 || log_warn "No primary model configured"
    else
        log_warn "Config file not found: $CONFIG_FILE"
    fi
    echo ""
    
    # 2. Port check
    log_info "2. Port $GATEWAY_PORT status:"
    if command -v lsof >/dev/null 2>&1; then
        if lsof -i :"$GATEWAY_PORT" -sTCP:LISTEN 2>/dev/null | head -5; then
            log_success "Gateway is listening on port $GATEWAY_PORT"
        else
            log_error "Nothing listening on port $GATEWAY_PORT"
            log_info "Start the gateway: openclaw gateway run"
            exit 1
        fi
    else
        log_warn "lsof not found; run: openclaw gateway status"
    fi
    echo ""
    
    # 3. Gateway status
    log_info "3. Gateway status:"
    if command -v openclaw >/dev/null 2>&1; then
        openclaw gateway status 2>/dev/null || log_warn "Status check failed"
    else
        log_warn "openclaw not in PATH"
    fi
    echo ""
    
    # 4. Last log line
    log_info "4. Last gateway log entry:"
    if [[ -f "$LOG_FILE" ]]; then
        tail -1 "$LOG_FILE" 2>/dev/null || log_warn "Cannot read log file"
    else
        log_warn "No gateway.log found"
    fi
    
    echo ""
    log_success "Health check complete"
}

# Run main
main "$@"
