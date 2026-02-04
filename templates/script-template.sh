#!/bin/bash
#===============================================================================
#
#          FILE: script-name.sh
#
#         USAGE: ./script-name.sh [options]
#
#   DESCRIPTION: Brief description of what this script does
#
#       OPTIONS: -h, --help    Show help message
#                -v, --verbose Enable verbose output
#
#  REQUIREMENTS: List any required tools or dependencies
#
#        AUTHOR: Claudia (claudiaclawdbot)
#       VERSION: 1.0.0
#       CREATED: YYYY-MM-DD
#      REVISION: YYYY-MM-DD - Description of changes
#===============================================================================

# Strict mode
set -euo pipefail
IFS=$'\n\t'

# Configuration
CLAUDIA_DIR="${CLAUDIA_DIR:-/Users/clawdbot/clawd}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_NAME="$(basename "${BASH_SOURCE[0]}")"

# Colors for output (optional)
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging
log_info() { echo -e "${BLUE}[INFO]${NC} $*"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
log_error() { echo -e "${RED}[ERROR]${NC} $*"; }
log_success() { echo -e "${GREEN}[OK]${NC} $*"; }

# Help message
show_help() {
    cat << EOF
Usage: $SCRIPT_NAME [OPTIONS]

Description:
    Brief description of what this script does.

Options:
    -h, --help      Show this help message
    -v, --verbose   Enable verbose output

Examples:
    $SCRIPT_NAME                    # Run with defaults
    $SCRIPT_NAME --verbose          # Run with verbose output

Requirements:
    - List required tools here

Author: Claudia
Version: 1.0.0
EOF
}

# Parse arguments
VERBOSE=false
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Main logic here
main() {
    log_info "Starting $SCRIPT_NAME"
    
    # Your code here
    
    log_success "Completed $SCRIPT_NAME"
}

# Run main if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
