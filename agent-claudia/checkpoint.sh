#!/bin/bash
#
# Checkpoint system - Called every 5 minutes
# Decides whether to wait for user or continue autonomously
#

ORCHESTRATOR="/Users/clawdbot/clawd/agent-claudia/orchestrator.json"
TASKS="/Users/clawdbot/clawd/agent-claudia/TASKS.md"
LOG="/Users/clawdbot/clawd/agent-claudia/orchestrator.log"

USER_LAST_SEEN=$(jq -r '.userLastSeen' "$ORCHESTRATOR")
TIMEOUT_MIN=$(jq -r '.timeoutMinutes' "$ORCHESTRATOR")
CONTINUE_ON_TIMEOUT=$(jq -r '.continueOnTimeout' "$ORCHESTRATOR")

# Calculate minutes since last user interaction
LAST_EPOCH=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$USER_LAST_SEEN" "+%s" 2>/dev/null || echo "0")
NOW_EPOCH=$(date +%s)
MINUTES_SINCE=$(( (NOW_EPOCH - LAST_EPOCH) / 60 ))

echo "$(date): User last seen $MINUTES_SINCE minutes ago" >> "$LOG"

if [ "$MINUTES_SINCE" -gt "$TIMEOUT_MIN" ] && [ "$CONTINUE_ON_TIMEOUT" = "true" ]; then
    echo "$(date): TIMEOUT - Continuing autonomously" >> "$LOG"

    # Pick highest priority P0 task
    PENDING_TASK=$(grep "| [0-9] |.*TODO" "$TASKS" | head -1)

    if [ -n "$PENDING_TASK" ]; then
        TASK_ID=$(echo "$PENDING_TASK" | awk -F'|' '{print $2}' | tr -d ' ')
        echo "$(date): Auto-starting task $TASK_ID" >> "$LOG"
        
        # Spawn via sessions_spawn
        openclaw agent --message "Auto-continue task $TASK_ID (no user response for ${MINUTES_SINCE}m)" --deliver
    else
        # No P0 tasks - scout for opportunities
        echo "$(date): No pending P0 tasks - scouting opportunities" >> "$LOG"
        openclaw agent --message "No P0 tasks. Checking for new opportunities..." --deliver
    fi
fi

# Update orchestrator
jq ".userLastSeen = \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"" "$ORCHESTRATOR" > /tmp/orch.json && mv /tmp/orch.json "$ORCHESTRATOR"
