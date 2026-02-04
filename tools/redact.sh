#!/usr/bin/env bash
#===============================================================================
#
#          FILE: redact.sh
#
#         USAGE: ./redact.sh [OPTIONS] --pattern "OLD" --replacement "NEW"
#
#   DESCRIPTION: Automated redaction tool for sensitive content
#                Safely replaces patterns across codebase with audit trail
#
#       OPTIONS: --pattern, -p       Pattern to search for
#                --replacement, -r   Replacement text
#                --preview, -n       Dry run (show what would change)
#                --backup            Create .bak files before modifying
#                --git-only          Only check tracked files
#                --help, -h          Show help
#
#  REQUIREMENTS: grep, find, sed, git (optional)
#
#        AUTHOR: Claudia (claudiaclawdbot)
#       VERSION: 1.0.0
#       CREATED: 2026-02-04
#===============================================================================

# Strict mode
set -euo pipefail
IFS=$'\n\t'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SCRIPT_NAME="$(basename "${BASH_SOURCE[0]}")"
ALERTS_DIR="${REPO_ROOT}/memory/alerts"
DATE=$(date +%Y-%m-%d-%H%M%S)
REPORT_FILE="${ALERTS_DIR}/redaction-${DATE}.md"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Logging
log_info() { echo -e "${BLUE}[INFO]${NC} $*"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
log_error() { echo -e "${RED}[ERROR]${NC} $*"; }
log_success() { echo -e "${GREEN}[OK]${NC} $*"; }
log_change() { echo -e "${CYAN}[CHANGE]${NC} $*"; }

# Default options
PATTERN=""
REPLACEMENT=""
PREVIEW=false
BACKUP=false
GIT_ONLY=false

# File extensions to process
TEXT_EXTENSIONS=(
    "md" "txt" "js" "ts" "jsx" "tsx" "sh" "bash" "zsh"
    "json" "yml" "yaml" "html" "css" "scss" "xml"
    "py" "rb" "go" "rs" "java" "c" "cpp" "h"
)

# Directories to exclude
EXCLUDE_DIRS=(
    ".git" "node_modules" "dist" "build" ".next"
    "coverage" ".nyc_output" "archive"
)

# Show help
show_help() {
    cat << EOF
Redaction Tool - Safely replace patterns in codebase

Usage: $SCRIPT_NAME [OPTIONS]

Required:
  -p, --pattern PATTERN         Pattern to search for
  -r, --replacement TEXT        Replacement text

Options:
  -n, --preview                 Dry run (show changes without applying)
  --backup                      Create .bak files before modifying
  --git-only                    Only check git-tracked files
  -h, --help                    Show this help

Examples:
  # Preview changes
  $SCRIPT_NAME -p "old_name" -r "new_name" --preview

  # Apply changes with backup
  $SCRIPT_NAME -p "old_name" -r "new_name" --backup

  # Only check tracked files
  $SCRIPT_NAME -p "secret_key" -r "\$API_KEY" --git-only --preview

Report saved to: memory/alerts/redaction-YYYY-MM-DD-HHMMSS.md
EOF
}

# Parse arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -p|--pattern)
                PATTERN="$2"
                shift 2
                ;;
            -r|--replacement)
                REPLACEMENT="$2"
                shift 2
                ;;
            -n|--preview)
                PREVIEW=true
                shift
                ;;
            --backup)
                BACKUP=true
                shift
                ;;
            --git-only)
                GIT_ONLY=true
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# Validate inputs
validate() {
    if [[ -z "$PATTERN" ]]; then
        log_error "Pattern is required. Use -p or --pattern"
        exit 1
    fi
    
    if [[ -z "$REPLACEMENT" ]]; then
        log_error "Replacement is required. Use -r or --replacement"
        exit 1
    fi
    
    if [[ "$PATTERN" == "$REPLACEMENT" ]]; then
        log_warn "Pattern and replacement are identical. Nothing to do."
        exit 0
    fi
}

# Build find command
build_find_cmd() {
    local cmd="find \"$REPO_ROOT\" -type f"
    
    # Add extension filters
    local ext_filter=""
    for ext in "${TEXT_EXTENSIONS[@]}"; do
        if [[ -n "$ext_filter" ]]; then
            ext_filter="${ext_filter} -o"
        fi
        ext_filter="${ext_filter} -name '*.${ext}'"
    done
    
    if [[ -n "$ext_filter" ]]; then
        cmd="${cmd} \\( ${ext_filter} \\)"
    fi
    
    # Add exclusions
    for dir in "${EXCLUDE_DIRS[@]}"; do
        cmd="${cmd} -not -path \"*/${dir}/*\""
    done
    
    echo "$cmd"
}

# Get files to process
get_files() {
    if [[ "$GIT_ONLY" == true ]]; then
        # Get tracked files from git
        git -C "$REPO_ROOT" ls-files | while read -r file; do
            local fullpath="$REPO_ROOT/$file"
            if [[ -f "$fullpath" ]]; then
                # Check if extension is in our list
                for ext in "${TEXT_EXTENSIONS[@]}"; do
                    if [[ "$file" == *.$ext ]]; then
                        echo "$fullpath"
                        break
                    fi
                done
            fi
        done
    else
        # Use find
        eval "$(build_find_cmd)" 2>/dev/null
    fi
}

# Count occurrences in file
count_occurrences() {
    local file="$1"
    grep -o "$PATTERN" "$file" 2>/dev/null | wc -l
}

# Process single file
process_file() {
    local file="$1"
    local relative_path="${file#$REPO_ROOT/}"
    local count
    count=$(count_occurrences "$file")
    
    if [[ $count -eq 0 ]]; then
        return 0
    fi
    
    echo "${relative_path}:${count}"
    
    if [[ "$PREVIEW" == false ]]; then
        # Create backup if requested
        if [[ "$BACKUP" == true ]]; then
            cp "$file" "${file}.bak"
        fi
        
        # Perform replacement
        # Use perl for cross-platform compatibility
        perl -i -pe "s/\Q$PATTERN\E/$REPLACEMENT/g" "$file"
        
        log_change "Updated: $relative_path ($count occurrences)"
    fi
    
    return 0
}

# Generate report
generate_report() {
    local total_files=0
    local total_occurrences=0
    local changed_files=()
    
    mkdir -p "$ALERTS_DIR"
    
    {
        echo "# Redaction Report - $(date '+%Y-%m-%d %H:%M:%S')"
        echo ""
        echo "**Pattern:** \`$PATTERN\`"
        echo "**Replacement:** \`$REPLACEMENT\`"
        echo "**Mode:** $([[ "$PREVIEW" == true ]] && echo "Preview (dry run)" || echo "Live")"
        echo "**Backup:** $([[ "$BACKUP" == true ]] && echo "Yes" || echo "No")"
        echo "**Git Only:** $([[ "$GIT_ONLY" == true ]] && echo "Yes" || echo "No")"
        echo ""
        echo "---"
        echo ""
        
        log_info "Scanning files..."
        
        while IFS= read -r file; do
            ((total_files++))
            
            local result
            if result=$(process_file "$file" 2>/dev/null); then
                if [[ -n "$result" ]]; then
                    local filepath="${result%%:*}"
                    local count="${result##*:}"
                    
                    changed_files+=("$filepath")
                    ((total_occurrences += count))
                    
                    echo "- \`${filepath}\`: ${count} occurrence(s)"
                fi
            fi
        done < <(get_files)
        
        echo ""
        echo "---"
        echo ""
        echo "## Summary"
        echo ""
        echo "- **Files scanned:** ${total_files}"
        echo "- **Files modified:** ${#changed_files[@]}"
        echo "- **Total replacements:** ${total_occurrences}"
        echo ""
        
        if [[ "$PREVIEW" == true ]]; then
            echo "⚠️ **This was a preview. No changes were made.**"
            echo "Run without --preview to apply changes."
        elif [[ ${#changed_files[@]} -gt 0 ]]; then
            echo "✅ **Redaction complete.**"
            
            if [[ "$BACKUP" == true ]]; then
                echo "Backups created with .bak extension."
            fi
        else
            echo "ℹ️ **No matches found.**"
        fi
        
        echo ""
        echo "*Report generated by ${SCRIPT_NAME}*"
        
    } > "$REPORT_FILE"
    
    echo "$REPORT_FILE"
}

# Main logic
main() {
    parse_args "$@"
    validate
    
    cd "$REPO_ROOT"
    
    log_info "Starting redaction..."
    log_info "Pattern: $PATTERN"
    log_info "Replacement: $REPLACEMENT"
    
    if [[ "$PREVIEW" == true ]]; then
        log_info "Mode: PREVIEW (dry run)"
    else
        log_warn "Mode: LIVE (changes will be applied)"
        
        if [[ "$BACKUP" == false ]]; then
            log_warn "No backup requested. Consider using --backup"
        fi
    fi
    
    local report_path
    report_path=$(generate_report)
    
    log_success "Report saved: ${report_path#$REPO_ROOT/}"
    
    if [[ "$PREVIEW" == true ]]; then
        log_info "Run without --preview to apply changes"
    fi
}

# Run main
main "$@"
