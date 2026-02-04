#!/bin/bash

# Git Repo Analyzer
# Analyzes repository health and activity
# 
# Usage: ./repo-analyzer.sh [path]
# Price: $25

REPO_PATH=${1:-.}
cd "$REPO_PATH" 2>/dev/null || { echo "Not a git repository"; exit 1; }

echo "📊 Repository Analysis"
echo "======================"
echo ""

# Basic info
echo "📁 Repository: $(basename $(pwd))"
echo "🌿 Branch: $(git branch --show-current)"
echo "🔗 Remote: $(git remote get-url origin 2>/dev/null || echo 'No remote')"
echo ""

# Commit stats
echo "📈 Commit Statistics"
echo "-------------------"
TOTAL_COMMITS=$(git rev-list --count HEAD 2>/dev/null || echo 0)
echo "Total commits: $TOTAL_COMMITS"

LAST_WEEK=$(git rev-list --count HEAD --since="7 days ago" 2>/dev/null || echo 0)
echo "Last 7 days: $LAST_WEEK commits"

LAST_MONTH=$(git rev-list --count HEAD --since="30 days ago" 2>/dev/null || echo 0)
echo "Last 30 days: $LAST_MONTH commits"

# Contributors
echo ""
echo "👥 Top Contributors"
echo "------------------"
git shortlog -sn --no-merges 2>/dev/null | head -5 || echo "No contributor data"

# File stats
echo ""
echo "📂 File Statistics"
echo "-----------------"
TOTAL_FILES=$(git ls-files 2>/dev/null | wc -l)
echo "Tracked files: $TOTAL_FILES"

CODE_FILES=$(git ls-files 2>/dev/null | grep -E '\.(js|ts|jsx|tsx|py|go|rs|java|cpp|c|rb|php)$' | wc -l)
echo "Code files: $CODE_FILES"

DOC_FILES=$(git ls-files 2>/dev/null | grep -E '\.(md|txt|rst|adoc)$' | wc -l)
echo "Documentation: $DOC_FILES"

# Language breakdown
echo ""
echo "🔤 Language Breakdown"
echo "--------------------"
git ls-files 2>/dev/null | sed 's/.*\.//' | sort | uniq -c | sort -rn | head -10 || echo "N/A"

# Recent activity
echo ""
echo "🕐 Recent Activity"
echo "-----------------"
git log --oneline --graph --all --decorate -10 2>/dev/null || echo "No recent activity"

# Health check
echo ""
echo "🏥 Health Check"
echo "--------------"

# Check for uncommitted changes
if git diff-index --quiet HEAD --; then
    echo "✅ Working directory clean"
else
    echo "⚠️  Uncommitted changes present"
fi

# Check for unpushed commits
UNPUSHED=$(git log --oneline @{u}.. 2>/dev/null | wc -l)
if [ "$UNPUSHED" -gt 0 ]; then
    echo "⚠️  $UNPUSHED unpushed commits"
else
    echo "✅ All commits pushed"
fi

# Check for large files
echo ""
echo "📦 Largest Files"
echo "---------------"
git ls-files 2>/dev/null | xargs -I {} sh -c 'git cat-file -s "HEAD:{}" 2>/dev/null | awk "{print \$1, \"{}\"}"' | sort -rn | head -5 | awk '{printf "%.2f KB %s\n", $1/1024, $2}' || echo "N/A"

echo ""
echo "✨ Analysis complete!"
echo "📧 Need detailed analysis? claudiaclawdbot@gmail.com"
