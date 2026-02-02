#!/bin/bash
#
# worker.sh - Execute a single task using Claude Code CLI
# Usage: ./worker.sh <task_id>
#

set -e

TASK_ID="$1"
CLAUDIA_DIR="/Users/clawdbot/clawd/agent-claudia"
TASKS_FILE="$CLAUDIA_DIR/TASKS.md"

if [ -z "$TASK_ID" ]; then
    echo "Usage: $0 <task_id>"
    echo "Example: $0 1"
    exit 1
fi

# Extract task details from TASKS.md
TASK_LINE=$(grep "^| $TASK_ID |" "$TASKS_FILE" || true)

if [ -z "$TASK_LINE" ]; then
    echo "Error: Task $TASK_ID not found in TASKS.md"
    exit 1
fi

# Parse task fields
TASK_NAME=$(echo "$TASK_LINE" | awk -F'|' '{print $3}' | sed 's/^ *//;s/ *$//')
TASK_STATUS=$(echo "$TASK_LINE" | awk -F'|' '{print $4}' | tr -d ' ')
OUTPUT_FILE=$(echo "$TASK_LINE" | awk -F'|' '{print $5}' | sed 's/^ *//;s/ *$//')
NOTES=$(echo "$TASK_LINE" | awk -F'|' '{print $6}' | sed 's/^ *//;s/ *$//')

echo "Task: $TASK_NAME"
echo "Status: $TASK_STATUS"
echo "Output: $OUTPUT_FILE"
echo "Notes: $NOTES"

if [ "$TASK_STATUS" == "DONE" ]; then
    echo "Task $TASK_ID already complete. Skipping."
    exit 0
fi

if [ "$TASK_STATUS" == "BLOCKED" ]; then
    echo "Task $TASK_ID is blocked. Skipping."
    exit 0
fi

# Generate Claude prompt based on task
PROMPT=""
case $TASK_ID in
    1)
        PROMPT="Research ElizaOS framework. Write a concise evaluation covering: what it is, key features, architecture, use cases, pros/cons, and whether it's relevant for AI agent development. Output to file: $OUTPUT_FILE"
        ;;
    2)
        PROMPT="Create FIDGET-SPINNER Phase 1 design document. Cover: core game mechanics, spin physics implementation, MVP features, tech stack recommendations, and development phases. Output to file: $OUTPUT_FILE"
        ;;
    3)
        PROMPT="Write x402 skill specification document for OpenClaw. Cover: what x402 protocol is, how to integrate it as a skill, API design, configuration, and usage examples. Output to file: $OUTPUT_FILE"
        ;;
    4)
        PROMPT="Create social agent system outline. Design architecture for multi-agent social coordination: communication protocols, role definitions, consensus mechanisms, and interaction patterns. Output to file: $OUTPUT_FILE"
        ;;
    *)
        echo "Unknown task ID: $TASK_ID"
        exit 1
        ;;
esac

echo ""
echo "Executing with Claude Code CLI..."
echo "Prompt: $PROMPT"
echo ""

# Run via Claude Code CLI
# Note: Assumes 'claude' CLI is available in PATH
claude -p "$PROMPT"

# Mark task as DONE in TASKS.md (update the status column)
sed -i '' "s/| $TASK_ID | $TASK_NAME | TODO |/| $TASK_ID | $TASK_NAME | DONE |/" "$TASKS_FILE"
sed -i '' "s/| $TASK_ID | $TASK_NAME | IN_PROGRESS |/| $TASK_ID | $TASK_NAME | DONE |/" "$TASKS_FILE"

echo ""
echo "✓ Task $TASK_ID complete. Output: $OUTPUT_FILE"
