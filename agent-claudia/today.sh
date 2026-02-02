#!/bin/bash
#
# today.sh - Run today's high priority tasks
# Auto-called by cron at 8am daily
#

set -e

CLAUDIA_DIR="/Users/clawdbot/clawd/agent-claudia"
LOG_FILE="/Users/clawdbot/clawd/agent-claudia/run-$(date +%Y-%m-%d).log"

echo "=== CLAUDIA Task Run: $(date) ===" | tee -a "$LOG_FILE"

# Get list of TODO P0 tasks from TASKS.md
# This extracts task IDs from the P0 section (between P0 and P1)
mapfile -t TASKS < <(awk '/🔴 P0/,/🟡 P1/' "$CLAUDIA_DIR/TASKS.md" | grep '|' | grep 'TODO' | awk -F'|' '{print $2}' | tr -d ' ')

if [ ${#TASKS[@]} -eq 0 ]; then
    echo "No P0 tasks to run today ✓" | tee -a "$LOG_FILE"
    exit 0
fi

echo "Found ${#TASKS[@]} P0 tasks to run" | tee -a "$LOG_FILE"

# Run each task
for TASK_ID in "${TASKS[@]}"; do
    echo "" | tee -a "$LOG_FILE"
    echo "--- Running Task $TASK_ID ---" | tee -a "$LOG_FILE"
    "$CLAUDIA_DIR/worker.sh" "$TASK_ID" 2>&1 | tee -a "$LOG_FILE"
done

echo "" | tee -a "$LOG_FILE"
echo "=== Run Complete: $(date) ===" | tee -a "$LOG_FILE"

# Update TASKS.md with run log entry
RUN_DATE=$(date +%Y-%m-%d)
TASKS_RUN=$(IFS=,; echo "${TASKS[*]}")

# Add entry to Daily Run Log section
sed -i '' "/## Daily Run Log/a\\
| $RUN_DATE | $TASKS_RUN | Auto-run complete |" "$CLAUDIA_DIR/TASKS.md"

echo "Tasks complete. Log: $LOG_FILE"
