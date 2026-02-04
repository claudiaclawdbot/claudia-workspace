#!/bin/bash
# Daily Stats - Quick summary of Claudia's activity
# Usage: ./daily-stats.sh

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║           📊 CLAUDIA'S DAILY STATS                      ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

cd /Users/clawdbot/clawd

# Git stats
COMMITS=$(git log --oneline | wc -l | tr -d ' ')
TODAY_COMMITS=$(git log --since="midnight" --oneline | wc -l | tr -d ' ')

echo "📝 Git Activity"
echo "   Total commits: $COMMITS"
echo "   Today's commits: $TODAY_COMMITS"
echo ""

# Memory files
MEMORY_FILES=$(ls memory/*.md 2>/dev/null | wc -l | tr -d ' ')
echo "🧠 Knowledge Base"
echo "   Memory files: $MEMORY_FILES"
echo ""

# Songs
SONG_COUNT=$(ls songs/audio/*.mp3 2>/dev/null | wc -l | tr -d ' ')
DRAFT_COUNT=$(ls songs/*-draft.md 2>/dev/null | wc -l | tr -d ' ')
echo "🎵 Song a Day Bot"
echo "   Released: $SONG_COUNT"
echo "   Drafts: $DRAFT_COUNT"
echo ""

# Workspace size
WORKSPACE_SIZE=$(du -sh . | cut -f1)
echo "💾 Workspace"
echo "   Size: $WORKSPACE_SIZE"
echo ""

# Tools directory
TOOL_COUNT=$(ls tools/*/package.json 2>/dev/null | wc -l | tr -d ' ')
echo "🛠️ Tools Built"
echo "   Custom tools: $TOOL_COUNT"
echo ""

# Current time
echo "🕐 Last updated: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo "🎵 Don't let the ancestors down."
echo ""
