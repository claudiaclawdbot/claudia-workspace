#!/usr/bin/env bash
#===============================================================================
#
#          FILE: today.sh
#
#         USAGE: ./today.sh
#
#   DESCRIPTION: Run today's high priority (P0) tasks
#                Auto-called by cron at 8am daily
#
#       OPTIONS: None
#
#  REQUIREMENTS: awk, sed (BSD/macOS style), TASKS.md
#
#        AUTHOR: Claudia (claudiaclawdbot)
#       VERSION: 1.0.0
#       CREATED: 2026-02-03
#      REVISION: 2026-02-04 - Standardized header, improved logging
#===============================================================================

# Strict mode
set -euo pipefail
IFS=$'\n\t'

# Configuration
CLAUDIA_DIR="${CLAUDIA_DIR:-/Users/clawdbot/clawd/agent-claudia}"
TASKS_FILE="${CLAUDIA_DIR}/TASKS.md"
LOG_FILE="${CLAUDIA_DIR}/run-$(date +%Y-%m-%d).log"
SCRIPT_NAME="$(basename "${BASH_SOURCE[0]}")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging
log_info() { 
    echo -e "${BLUE}[INFO]${NC} $*"
    echo "$(date '+%H:%M:%S') [INFO] $*" >> "$LOG_FILE"
}

log_warn() { 
    echo -e "${YELLOW}[WARN]${NC} $*"
    echo "$(date '+%H:%M:%S') [WARN] $*" >> "$LOG_FILE"
}

log_error() { 
    echo -e "${RED}[ERROR]${NC} $*"
    echo "$(date '+%H:%M:%S') [ERROR] $*" >> "$LOG_FILE"
}

log_success() { 
    echo -e "${GREEN}[OK]${NC} $*"
    echo "$(date '+%H:%M:%S') [OK] $*" >> "$LOG_FILE"
}

# Log to file only
log_file() {
    echo "$(date '+%H:%M:%S') $*" >> "$LOG_FILE"
}

# Get P0 tasks from TASKS.md
get_p0_tasks() {
    # Extract task IDs from P0 section (between P0 and P1 markers)
    awk '/🔴 P0/,/🟡 P1/' "$TASKS_FILE" | \
        grep '|' | \
        grep 'TODO' | \
        awk -F'|' '{print $2}' | \
        tr -d ' ' || true
}

# Update TASKS.md with run log entry
update_run_log() {
    local run_date="$1"
    local tasks_run="$2"
    local status="$3"
    
    # Add entry to Daily Run Log section
    if [[ -f "$TASKS_FILE" ]]; then
        sed -i '' "/|------|-----------|---------|/a\\
| $run_date | $tasks_run | $status |" "$TASKS_FILE"
    fi
}

# Main logic
main() {
    log_file "=== CLAUDIA Task Run Started ==="
    
    # Validate files exist
    if [[ ! -f "$TASKS_FILE" ]]; then
        log_error "TASKS.md not found: $TASKS_FILE"
        exit 1
    fi
    
    log_info "Scanning for P0 tasks..."
    
    # Get list of TODO P0 tasks
    local tasks
    tasks=$(get_p0_tasks)
    
    if [[ -z "$tasks" ]]; then
        log_success "No P0 tasks to run today"
        update_run_log "$(date +%Y-%m-%d)" "None" "All P0 tasks complete"
        log_file "=== Run Complete: No tasks ==="
        exit 0
    fi
    
    log_info "Found P0 tasks: $tasks"
    
    # Run each task
    local failed_tasks=""
    for task_id in $tasks; do
        echo ""
        log_info "--- Running Task $task_id ---"
        
        if "${CLAUDIA_DIR}/worker.sh" "$task_id" 2>&1; then
            log_success "Task $task_id completed"
        else
            log_error "Task $task_id failed"
            failed_tasks="${failed_tasks}${task_id} "
        fi
    done
    
    echo ""
    
    # Update run log
    local tasks_run
    tasks_run=$(echo "$tasks" | tr ' ' ',')
    
    if [[ -z "$failed_tasks" ]]; then
        log_success "=== All Tasks Complete ==="
        update_run_log "$(date +%Y-%m-%d)" "$tasks_run" "Auto-run complete"
    else
        log_warn "=== Some Tasks Failed ==="
        update_run_log "$(date +%Y-%m-%d)" "$tasks_run" "Partial: ${failed_tasks}failed"
    fi
    
    log_info "Log file: $LOG_FILE"
}

# Run main
main "$@"
