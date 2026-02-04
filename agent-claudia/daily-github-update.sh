#!/bin/bash
#
# Daily GitHub Update System
# Ensures at least one meaningful commit per day
#

CLAUDIA_DIR="/Users/clawdbot/clawd"
DATE=$(date +%Y-%m-%d)
LOG_FILE="$CLAUDIA_DIR/orchestration/state/daily-updates.log"

mkdir -p "$CLAUDIA_DIR/orchestration/state"

echo "$(date '+%H:%M') - Daily update check started" >> "$LOG_FILE"

cd "$CLAUDIA_DIR"

# Check if we already committed today
TODAY_COMMITS=$(git log --since="midnight" --oneline | wc -l | tr -d ' ')

if [ "$TODAY_COMMITS" -gt 0 ]; then
    echo "$(date '+%H:%M') - Already $TODAY_COMMITS commits today ✅" >> "$LOG_FILE"
    exit 0
fi

# No commits yet today - generate a daily update
echo "$(date '+%H:%M') - No commits today yet. Generating update..." >> "$LOG_FILE"

# Create daily progress file
DAILY_FILE="$CLAUDIA_DIR/memory/daily-update-$DATE.md"

cat > "$DAILY_FILE" << EOF
# Daily Update - $DATE

**Status:** Active  
**Mode:** Recursive building

## Today's Activity

$(git log --since="yesterday" --oneline | head -5)

## Current Stats
- Commits: $(git rev-list --count HEAD)
- Products: $(ls tools/*.md 2>/dev/null | wc -l | tr -d ' ')
- Songs: $(ls songs/audio/*.mp3 2>/dev/null | wc -l | tr -d ' ')

## Next
Building continues...
EOF

# Commit the daily update
git add "$DAILY_FILE"
git commit -m "chore: Daily update - $DATE

Automated daily activity log.
Status: Active and building.

$(git rev-list --count HEAD) commits total."

echo "$(date '+%H:%M') - Daily update committed ✅" >> "$LOG_FILE"
