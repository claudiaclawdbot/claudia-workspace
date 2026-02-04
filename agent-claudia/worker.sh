#!/usr/bin/env bash
#===============================================================================
#
#          FILE: worker.sh
#
#         USAGE: ./worker.sh <task_id>
#
#   DESCRIPTION: Execute a single task using Claude Code CLI
#                Reads task details from TASKS.md and generates appropriate prompt
#
#       OPTIONS: None
#
#  REQUIREMENTS: claude CLI, awk, sed (BSD/macOS style)
#
#        AUTHOR: Claudia (claudiaclawdbot)
#       VERSION: 1.0.0
#       CREATED: 2026-02-03
#      REVISION: 2026-02-04 - Standardized header, improved error handling
#===============================================================================

# Strict mode
set -euo pipefail
IFS=$'\n\t'

# Configuration
CLAUDIA_DIR="${CLAUDIA_DIR:-/Users/clawdbot/clawd/agent-claudia}"
TASKS_FILE="${CLAUDIA_DIR}/TASKS.md"
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

# Show usage
show_help() {
    cat << EOF
Usage: $SCRIPT_NAME <task_id>

Execute a single task using Claude Code CLI.

Arguments:
  task_id    The ID of the task to execute (from TASKS.md)

Examples:
  $SCRIPT_NAME 1          # Execute task 1
  $SCRIPT_NAME 4          # Execute task 4

The script reads task details from TASKS.md and generates
an appropriate prompt for Claude Code CLI.
EOF
}

# Parse task from TASKS.md
parse_task() {
    local task_id="$1"
    grep "^| $task_id |" "$TASKS_FILE" || true
}

# Extract field from task line
get_field() {
    local line="$1"
    local field_num="$2"
    echo "$line" | awk -F'|' "{print \$$field_num}" | sed 's/^ *//;s/ *$//'
}

# Generate prompt based on task ID
generate_prompt() {
    local task_id="$1"
    local output_file="$2"
    
    case "$task_id" in
        1)
            echo "Research ElizaOS framework. Write a concise evaluation covering: what it is, key features, architecture, use cases, pros/cons, and whether it's relevant for AI agent development. Output to file: $output_file"
            ;;
        2)
            echo "Create FIDGET-SPINNER Phase 1 design document. Cover: core game mechanics, spin physics implementation, MVP features, tech stack recommendations, and development phases. Output to file: $output_file"
            ;;
        3)
            echo "Write x402 skill specification document for OpenClaw. Cover: what x402 protocol is, how to integrate it as a skill, API design, configuration, and usage examples. Output to file: $output_file"
            ;;
        4)
            echo "Create social agent system outline. Design architecture for multi-agent social coordination: communication protocols, role definitions, consensus mechanisms, and interaction patterns. Output to file: $output_file"
            ;;
        *)
            log_error "Unknown task ID: $task_id"
            exit 1
            ;;
    esac
}

# Mark task as done in TASKS.md
mark_done() {
    local task_id="$1"
    local task_name="$2"
    
    # Update both TODO and IN_PROGRESS statuses to DONE
    sed -i '' "s/| $task_id | $task_name | TODO |/| $task_id | $task_name | DONE |/" "$TASKS_FILE"
    sed -i '' "s/| $task_id | $task_name | IN_PROGRESS |/| $task_id | $task_name | DONE |/" "$TASKS_FILE"
}

# Main logic
main() {
    # Check arguments
    if [[ $# -eq 0 ]] || [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
        show_help
        exit 0
    fi
    
    local task_id="$1"
    
    # Validate task file exists
    if [[ ! -f "$TASKS_FILE" ]]; then
        log_error "TASKS.md not found: $TASKS_FILE"
        exit 1
    fi
    
    # Extract task details
    local task_line
    task_line=$(parse_task "$task_id")
    
    if [[ -z "$task_line" ]]; then
        log_error "Task $task_id not found in TASKS.md"
        exit 1
    fi
    
    # Parse fields
    local task_name task_status output_file notes
    task_name=$(get_field "$task_line" 3)
    task_status=$(get_field "$task_line" 4 | tr -d ' ')
    output_file=$(get_field "$task_line" 5)
    notes=$(get_field "$task_line" 6)
    
    # Display task info
    log_info "Task: $task_name"
    log_info "Status: $task_status"
    log_info "Output: $output_file"
    log_info "Notes: $notes"
    
    # Check if task can be run
    if [[ "$task_status" == "DONE" ]]; then
        log_success "Task $task_id already complete. Skipping."
        exit 0
    fi
    
    if [[ "$task_status" == "BLOCKED" ]]; then
        log_warn "Task $task_id is blocked. Skipping."
        exit 0
    fi
    
    # Generate and execute prompt
    local prompt
    prompt=$(generate_prompt "$task_id" "$output_file")
    
    echo ""
    log_info "Executing with Claude Code CLI..."
    log_info "Prompt: $prompt"
    echo ""
    
    # Check if claude CLI is available
    if ! command -v claude >/dev/null 2>&1; then
        log_error "claude CLI not found in PATH"
        log_info "Install from: https://docs.anthropic.com/claude-code"
        exit 1
    fi
    
    # Run task
    if claude -p "$prompt"; then
        mark_done "$task_id" "$task_name"
        log_success "Task $task_id complete. Output: $output_file"
    else
        log_error "Task $task_id execution failed"
        exit 1
    fi
}

# Run main
main "$@"
