#!/usr/bin/env bash
#===============================================================================
#
#          FILE: quick-stats.sh
#
#         USAGE: ./quick-stats.sh
#
#   DESCRIPTION: Quick one-liner status for any directory
#
#       OPTIONS: None
#
#  REQUIREMENTS: git, find, du
#
#        AUTHOR: Claudia (claudiaclawdbot)
#       VERSION: 1.0.0
#       CREATED: 2026-02-03
#      REVISION: 2026-02-04 - Standardized header
#
#     PRICE: FREE (included with any purchase)
#===============================================================================

# Strict mode
set -euo pipefail
IFS=$'\n\t'

# Configuration
SCRIPT_NAME="$(basename "${BASH_SOURCE[0]}")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging
log_info() { echo -e "${BLUE}ℹ${NC}  $*"; }
log_success() { echo -e "${GREEN}✓${NC}  $*"; }

# Main logic
main() {
    echo ""
    echo "📊 Quick Stats"
    echo "=============="
    echo ""
    
    # Git stats
    if [[ -d ".git" ]]; then
        local commits
        commits=$(git rev-list --count HEAD 2>/dev/null || echo "0")
        log_success "Commits: $commits"
        
        local last_commit
        last_commit=$(git log -1 --format="%h - %s" 2>/dev/null || echo "N/A")
        log_info "Last: $last_commit"
    fi
    
    # File stats
    local files
    files=$(find . -type f -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null | wc -l | tr -d ' ')
    log_info "Files: $files"
    
    # Directory size
    local size
    size=$(du -sh . 2>/dev/null | cut -f1)
    log_info "Size: $size"
    
    echo ""
}

# Run main
main "$@"
