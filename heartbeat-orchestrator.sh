#!/bin/bash
# heartbeat-orchestrator.sh
# Runs during heartbeat checks to continue autonomous work

ORCHESTRATOR_FILE="/Users/clawdbot/clawd/CLAUDIA_ORCHESTRATOR.md"
TASK_QUEUE="/Users/clawdbot/clawd/TASK_QUEUE.json"

echo "[$(date)] Checking orchestrator state..."

# Check if objectives file exists
if [ ! -f "$ORCHESTRATOR_FILE" ]; then
    echo "No orchestrator file found. Skipping autonomous work."
    exit 0
fi

# Check when last autonomous work happened
LAST_WORK_FILE="/Users/clawdbot/clawd/.last_autonomous_work"
if [ -f "$LAST_WORK_FILE" ]; then
    LAST_WORK=$(cat "$LAST_WORK_FILE")
    CURRENT_TIME=$(date +%s)
    TIME_DIFF=$((CURRENT_TIME - LAST_WORK))
    
    # Only do autonomous work every 30 minutes max
    if [ $TIME_DIFF -lt 1800 ]; then
        echo "Autonomous work done ${TIME_DIFF}s ago. Skipping."
        exit 0
    fi
fi

# Mark autonomous work as happening
date +%s > "$LAST_WORK_FILE"

echo "[$(date)] Ready for autonomous work delegation"
exit 0
