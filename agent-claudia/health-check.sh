#!/usr/bin/env bash
#===============================================================================
#
#          FILE: health-check.sh
#
#         USAGE: ./health-check.sh [--verbose]
#
#   DESCRIPTION: Overnight health check for x402 services
#                Runs every hour during overnight hours (11pm-6am)
#
#       OPTIONS: --verbose    Show detailed output
#
#  REQUIREMENTS: curl
#
#        AUTHOR: Claudia (claudiaclawdbot)
#       VERSION: 1.0.0
#       CREATED: 2026-02-03
#      REVISION: 2026-02-04 - Standardized header, added logging
#===============================================================================

# Strict mode
set -euo pipefail
IFS=$'\n\t'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_NAME="$(basename "${BASH_SOURCE[0]}")"
STATE_DIR="${SCRIPT_DIR}/../orchestration/agents/health-monitor/state"

# Service endpoints
RESEARCH_URL="https://collections-parcel-auditor-sunset.trycloudflare.com/status"
PRICE_URL="https://afford-den-romance-welcome.trycloudflare.com/status"
MERCHANT_URL="http://localhost:4021/health"

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

# Check service health
check_service() {
    local name="$1"
    local url="$2"
    local status
    
    status=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    
    if [[ "$status" == "200" ]]; then
        log_success "$name: UP"
        return 0
    else
        log_warn "$name: DOWN (HTTP $status)"
        return 1
    fi
}

# Update state file
update_state() {
    local research_status="$1"
    local price_status="$2"
    local merchant_status="$3"
    
    # Ensure state directory exists
    mkdir -p "$STATE_DIR"
    
    # Create/update state JSON
    cat > "${STATE_DIR}/service-state.json" << EOF
{
  "lastCheck": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "services": {
    "research": {
      "status": $([[ "$research_status" == "200" ]] && echo '"up"' || echo '"down"'),
      "httpCode": "$research_status"
    },
    "price": {
      "status": $([[ "$price_status" == "200" ]] && echo '"up"' || echo '"down"'),
      "httpCode": "$price_status"
    },
    "merchant": {
      "status": $([[ "$merchant_status" == "200" ]] && echo '"up"' || echo '"down"'),
      "httpCode": "$merchant_status"
    }
  }
}
EOF
}

# Main logic
main() {
    local verbose=false
    
    # Parse arguments
    if [[ "${1:-}" == "--verbose" ]]; then
        verbose=true
    fi
    
    echo "=== $(date) x402 Health Check ==="
    
    local research_status price_status merchant_status
    local all_up=true
    
    # Check research service
    research_status=$(curl -s -o /dev/null -w "%{http_code}" "$RESEARCH_URL" 2>/dev/null || echo "000")
    if [[ "$research_status" == "200" ]]; then
        log_success "Research service: UP"
    else
        log_warn "Research service: DOWN (HTTP $research_status)"
        all_up=false
    fi
    
    # Check price service
    price_status=$(curl -s -o /dev/null -w "%{http_code}" "$PRICE_URL" 2>/dev/null || echo "000")
    if [[ "$price_status" == "200" ]]; then
        log_success "Price service: UP"
    else
        log_warn "Price service: DOWN (HTTP $price_status)"
        all_up=false
    fi
    
    # Check merchant service
    merchant_status=$(curl -s -o /dev/null -w "%{http_code}" "$MERCHANT_URL" 2>/dev/null || echo "000")
    if [[ "$merchant_status" == "200" ]]; then
        log_success "Merchant service: UP"
    else
        log_warn "Merchant service: DOWN (HTTP $merchant_status)"
        all_up=false
    fi
    
    # Update state file
    update_state "$research_status" "$price_status" "$merchant_status"
    
    # Summary
    if [[ "$all_up" == true ]]; then
        log_success "All services healthy"
        exit 0
    else
        log_warn "Some services down - see RECOVERY_PLAN.md"
        exit 1
    fi
}

# Run main
main "$@"
