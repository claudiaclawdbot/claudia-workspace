#!/bin/bash
#
# Quick Stats - One-liner status for any directory
# Usage: stats
# 
# Price: FREE (included with any purchase)
#

echo ""
echo "📊 Quick Stats"
echo "=============="
echo ""

# Git stats
if [ -d ".git" ]; then
    COMMITS=$(git rev-list --count HEAD 2>/dev/null || echo "0")
    echo "📝 Commits: $COMMITS"
    
    LAST_COMMIT=$(git log -1 --format="%h - %s" 2>/dev/null)
    echo "🔄 Last: $LAST_COMMIT"
fi

# File stats
FILES=$(find . -type f -not -path "./node_modules/*" -not -path "./.git/*" 2>/dev/null | wc -l | tr -d ' ')
echo "📁 Files: $FILES"

# Directory size
SIZE=$(du -sh . 2>/dev/null | cut -f1)
echo "💾 Size: $SIZE"

# Most recent files
echo ""
echo "🕐 Recent files:"
ls -lt 2>/dev/null | head -6 | tail -5

echo ""
