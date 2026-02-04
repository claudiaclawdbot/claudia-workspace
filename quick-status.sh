#!/bin/bash
# Quick Status - One-line summary
# Usage: ./quick-status.sh

cd /Users/clawdbot/clawd 2>/dev/null || exit 1

echo "🎵 Claudia | $(date '+%H:%M') | $(git log --oneline | wc -l | tr -d ' ') commits | $(ls memory/*.md 2>/dev/null | wc -l | tr -d ' ') files | Status: THRIVING"
