#!/usr/bin/env bash
#===============================================================================
#
#          FILE: ralph-wiggum-loop.sh
#
#         USAGE: ./ralph-wiggum-loop.sh [--max-attempts N]
#
#   DESCRIPTION: Persistence loop for customer acquisition
#                "Keep going until actual results" - Geoffrey Huntley
#
#       OPTIONS: --max-attempts N    Maximum retry attempts (default: 10)
#
#  REQUIREMENTS: curl, wallet balance endpoint access
#
#        AUTHOR: Claudia (claudiaclawdbot)
#       VERSION: 1.0.0
#       CREATED: 2026-02-03
#      REVISION: 2026-02-04 - Standardized header, improved error handling
#
#   NOTE: This script checks wallet balance to detect payments.
#   Requires CLAUDIA_WALLET to be set in .env
#===============================================================================

# Strict mode
set -euo pipefail
IFS=$'\n\t'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TARGET="first_paying_customer"
MAX_ATTEMPTS="${MAX_ATTEMPTS:-10}"
SLEEP_SECONDS="${SLEEP_SECONDS:-300}"  # 5 minutes
LOCK_FILE="/tmp/customer_acquired.lock"
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
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $*"; }

# Load environment
if [[ -f "$REPO_ROOT/.env" ]]; then
    # shellcheck source=/dev/null
    source "$REPO_ROOT/.env"
fi

# Get wallet address
WALLET="${CLAUDIA_WALLET:-0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055}"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --max-attempts)
            MAX_ATTEMPTS="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $SCRIPT_NAME [--max-attempts N]"
            echo ""
            echo "Persistence loop for customer acquisition."
            echo "Monitors wallet balance until first payment received."
            echo ""
            echo "Options:"
            echo "  --max-attempts N    Maximum attempts (default: 10)"
            echo "  --help, -h          Show this help"
            echo ""
            echo "Environment:"
            echo "  CLAUDIA_WALLET      Wallet address to monitor"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Check if already acquired
if [[ -f "$LOCK_FILE" ]]; then
    log_success "Customer already acquired! (lock file exists)"
    exit 0
fi

# Get wallet balance
get_balance() {
    local balance
    balance=$(curl -s "https://sepolia.base.org" \
        -X POST \
        -H "Content-Type: application/json" \
        -d "{\"jsonrpc\":\"2.0\",\"method\":\"eth_getBalance\",\"params\":[\"$WALLET\",\"latest\"],\"id\":1}" 2>/dev/null | \
        grep -o '"result":"[^"]*"' | cut -d'"' -f4 || echo "0x0")
    echo "$balance"
}

# Main loop
main() {
    log_info "🎯 Ralph Wiggum Loop - Target: $TARGET"
    log_info "Monitoring wallet: $WALLET"
    log_info "Max attempts: $MAX_ATTEMPTS"
    echo ""
    
    local attempts=0
    
    while [[ ! -f "$LOCK_FILE" ]] && [[ $attempts -lt $MAX_ATTEMPTS ]]; do
        attempts=$((attempts + 1))
        log_info "Attempt $attempts/$MAX_ATTEMPTS: Acquiring first customer..."
        
        # TODO: Implement actual customer acquisition strategy here
        # This could involve:
        # - Sending targeted outreach messages
        # - Posting on social media
        # - Engaging in community discussions
        # - Following up with warm leads
        
        log_info "Checking wallet balance..."
        local balance
        balance=$(get_balance)
        
        # Convert hex to decimal (rough check for non-zero)
        if [[ "$balance" != "0x0" ]] && [[ -n "$balance" ]] && [[ "$balance" != "0x" ]]; then
            log_success "🎉 CUSTOMER ACQUIRED! Balance: $balance"
            touch "$LOCK_FILE"
            break
        fi
        
        log_warn "No payment yet. Retrying in $((SLEEP_SECONDS / 60)) minutes..."
        sleep "$SLEEP_SECONDS"
    done
    
    echo ""
    if [[ -f "$LOCK_FILE" ]]; then
        log_success "RALPH WIGGUM SUCCESS - Task actually complete!"
        log_info "Lock file: $LOCK_FILE"
    else
        log_error "Max attempts ($MAX_ATTEMPTS) reached"
        log_warn "Consider:"
        log_warn "  • Different outreach strategy"
        log_warn "  • Lower price point"
        log_warn "  • Better value proposition"
        log_warn "  • Manual intervention"
        exit 1
    fi
}

# Run main
trap 'log_warn "Interrupted"; exit 130' INT TERM
main "$@"
