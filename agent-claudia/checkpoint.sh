#!/usr/bin/env bash
#===============================================================================
#
#          FILE: checkpoint.sh
#
#         USAGE: ./checkpoint.sh
#
#   DESCRIPTION: Checkpoint system - Called every 5 minutes
#                Decides whether to wait for user or continue autonomously
#
#       OPTIONS: None
#
#  REQUIREMENTS: jq, date (macOS/BSD style)
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
CLAUDIA_DIR="${CLAUDIA_DIR:-/Users/clawdbot/clawd}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ORCHESTRATOR="${SCRIPT_DIR}/orchestrator.json"
TASKS="${SCRIPT_DIR}/TASKS.md"
LOG="${SCRIPT_DIR}/orchestrator.log"
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

# Log to file with timestamp
log_file() {
    echo "$(date '+%Y-%m-%d %H:%M:%S'): $*" >> "$LOG"
}

# Main logic
main() {
    # Validate required files exist
    if [[ ! -f "$ORCHESTRATOR" ]]; then
        log_error "Orchestrator file not found: $ORCHESTRATOR"
        exit 1
    fi
    
    if [[ ! -f "$TASKS" ]]; then
        log_error "Tasks file not found: $TASKS"
        exit 1
    fi
    
    # Load configuration from orchestrator
    local user_last_seen timeout_min continue_on_timeout
    user_last_seen=$(jq -r '.userLastSeen' "$ORCHESTRATOR")
    timeout_min=$(jq -r '.timeoutMinutes' "$ORCHESTRATOR")
    continue_on_timeout=$(jq -r '.continueOnTimeout' "$ORCHESTRATOR")
    
    # Calculate minutes since last user interaction
    local last_epoch now_epoch minutes_since
    last_epoch=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$user_last_seen" "+%s" 2>/dev/null || echo "0")
    now_epoch=$(date +%s)
    minutes_since=$(( (now_epoch - last_epoch) / 60 ))
    
    log_file "User last seen ${minutes_since} minutes ago"
    
    # Check if we should continue autonomously
    if [[ "$minutes_since" -gt "$timeout_min" ]] && [[ "$continue_on_timeout" == "true" ]]; then
        log_file "TIMEOUT - Continuing autonomously"
        log_warn "User timeout ($timeout_min min) - Switching to autonomous mode"
        
        # Pick highest priority P0 task
        local pending_task task_id
        pending_task=$(grep "| [0-9] |.*TODO" "$TASKS" | head -1 || true)
        
        if [[ -n "$pending_task" ]]; then
            task_id=$(echo "$pending_task" | awk -F'|' '{print $2}' | tr -d ' ')
            log_file "Auto-starting task $task_id"
            log_info "Auto-starting task $task_id (no user response for ${minutes_since}m)"
            
            # Spawn via sessions_spawn
            openclaw agent --message "Auto-continue task $task_id (no user response for ${minutes_since}m)" --deliver 2>/dev/null || true
        else
            # No P0 tasks - scout for opportunities
            log_file "No pending P0 tasks - scouting opportunities"
            log_info "No urgent tasks. Checking for new opportunities..."
            
            openclaw agent --message "No P0 tasks. Checking for new opportunities..." --deliver 2>/dev/null || true
        fi
    else
        log_file "Within timeout window or autonomous mode disabled"
    fi
    
    # Update orchestrator with current timestamp
    local new_timestamp
    new_timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    jq ".userLastSeen = \"$new_timestamp\"" "$ORCHESTRATOR" > /tmp/orch.json && mv /tmp/orch.json "$ORCHESTRATOR"
    
    log_success "Checkpoint complete"
}

# Run main
main "$@"
