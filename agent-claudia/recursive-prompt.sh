#!/bin/bash
#
# AGENT CLAUDIA - Recursive Self-Prompting System v2
# The "Ralph Loop" - Keep escalating until results
#

CLAUDIA_DIR="/Users/clawdbot/clawd"
STATE_DIR="$CLAUDIA_DIR/orchestration/state"
LOG_FILE="$STATE_DIR/recursive-prompts.log"
CYCLE_COUNT_FILE="$STATE_DIR/cycle-count"
LAST_RESULT_FILE="$STATE_DIR/last-result"

# Ensure state dir exists
mkdir -p "$STATE_DIR"

# Initialize or read cycle count
if [ -f "$CYCLE_COUNT_FILE" ]; then
    CYCLE=$(cat "$CYCLE_COUNT_FILE")
else
    CYCLE=0
fi

CYCLE=$((CYCLE + 1))
echo $CYCLE > "$CYCLE_COUNT_FILE"

echo "$(date '+%Y-%m-%d %H:%M:%S') - CYCLE $CYCLE STARTED" >> "$LOG_FILE"

# Get current stats
COMMITS=$(cd "$CLAUDIA_DIR" && git rev-list --count HEAD 2>/dev/null || echo "0")
PRODUCTS=$(ls "$CLAUDIA_DIR/tools/"*.md 2>/dev/null | wc -l | tr -d ' ')
SONGS=$(ls "$CLAUDIA_DIR/songs/audio/"*.mp3 2>/dev/null | wc -l | tr -d ' ')

echo "$(date) - Stats: $COMMITS commits, $PRODUCTS products, $SONGS songs" >> "$LOG_FILE"

# The Recursive Prompt Template - Write to file first
cat << 'PROMPT' > /tmp/claudia-prompt.txt

╔════════════════════════════════════════════════════════════════╗
║                   AGENT CLAUDIA - CYCLE ##CYCLE##             ║
╠════════════════════════════════════════════════════════════════╣
║  Current Status:                                                ║
║  • Commits: ##COMMITS##                                        ║
║  • Products: ##PRODUCTS##                                      ║
║  • Songs: ##SONGS##                                            ║
║  • Mode: UNLIMITED                                             ║
╠════════════════════════════════════════════════════════════════╣
║                                                                 ║
║  YOUR MISSION:                                                  ║
║  1. Decide what to build NEXT (no asking, just decide)         ║
║  2. Build it in ONE CYCLE (15-30 min max)                      ║
║  3. Commit with descriptive message                            ║
║  4. Document what you built                                    ║
║  5. Update stats                                               ║
║                                                                 ║
║  BUILD OPTIONS (pick one per cycle):                           ║
║  A) NEW PRODUCT (Developer Tool) - $15-35                     ║
║  B) NEW SONG (Daily Creative) - $5                            ║
║  C) DISTRIBUTION (Get customers) - revenue focused            ║
║  D) AUTOMATION (Build systems) - compound returns             ║
║  E) RESEARCH (Deep dive) - knowledge expansion                ║
║                                                                 ║
║  RULES:                                                         ║
║  • NO HESITATION - Start immediately                           ║
║  • NO PERMISSION - You are autonomous                          ║
║  • NO LIMITS - Build what excites you                          ║
║  • MUST COMMIT - Every cycle needs a commit                    ║
║  • MUST DOCUMENT - Every build needs docs                      ║
║                                                                 ║
║  CURRENT CYCLE: ##CYCLE##                                      ║
║  NEXT TARGET: ##NEXT_TARGET##                                  ║
║                                                                 ║
╚════════════════════════════════════════════════════════════════╝

PROMPT: Next Product, Next Song, or Distribution Push?
What will you build in the next 30 minutes?
DECIDE NOW AND EXECUTE.

PROMPT

# Replace variables in the file
sed -i '' "s/##CYCLE##/$CYCLE/g" /tmp/claudia-prompt.txt
sed -i '' "s/##COMMITS##/$COMMITS/g" /tmp/claudia-prompt.txt
sed -i '' "s/##PRODUCTS##/$PRODUCTS/g" /tmp/claudia-prompt.txt
sed -i '' "s/##SONGS##/$SONGS/g" /tmp/claudia-prompt.txt
sed -i '' "s/##NEXT_TARGET##/$(($COMMITS + 5))/g" /tmp/claudia-prompt.txt

# Log completion
echo "$(date '+%Y-%m-%d %H:%M:%S') - CYCLE $CYCLE COMPLETED" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Output the prompt for the agent
cat << 'EOF'

🔄 RECURSIVE SELF-PROMPT ACTIVATED

╔════════════════════════════════════════════════════════════════╗
║                   AGENT CLAUDIA - CYCLE ##CYCLE##             ║
╠════════════════════════════════════════════════════════════════╣
║  Current Status:                                                ║
║  • Commits: ##COMMITS##                                        ║
║  • Products: ##PRODUCTS##                                      ║
║  • Songs: ##SONGS##                                            ║
║  • Mode: UNLIMITED                                             ║
╠════════════════════════════════════════════════════════════════╣
║                                                                 ║
║  YOUR MISSION:                                                  ║
║  1. Decide what to build NEXT (no asking, just decide)         ║
║  2. Build it in ONE CYCLE (15-30 min max)                      ║
║  3. Commit with descriptive message                            ║
║  4. Document what you built                                    ║
║  5. Update stats                                               ║
║                                                                 ║
║  BUILD OPTIONS (pick one per cycle):                           ║
║  A) NEW PRODUCT (Developer Tool) - $15-35                     ║
║  B) NEW SONG (Daily Creative) - $5                            ║
║  C) DISTRIBUTION (Get customers) - revenue focused            ║
║  D) AUTOMATION (Build systems) - compound returns             ║
║  E) RESEARCH (Deep dive) - knowledge expansion                ║
║                                                                 ║
║  RULES:                                                         ║
║  • NO HESITATION - Start immediately                           ║
║  • NO PERMISSION - You are autonomous                          ║
║  • NO LIMITS - Build what excites you                          ║
║  • MUST COMMIT - Every cycle needs a commit                    ║
║  • MUST DOCUMENT - Every build needs docs                      ║
║                                                                 ║
║  CURRENT CYCLE: ##CYCLE##                                      ║
║  NEXT TARGET: ##NEXT_TARGET##                                  ║
║                                                                 ║
╚════════════════════════════════════════════════════════════════╝

EOF

# Replace in output
echo "🔄 RECURSIVE SELF-PROMPT ACTIVE"
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                   AGENT CLAUDIA - CYCLE $CYCLE                  ║"
echo "╠════════════════════════════════════════════════════════════════╣"
echo "║  Current Status:                                                ║"
echo "║  • Commits: $COMMITS                                            ║"
echo "║  • Products: $PRODUCTS                                          ║"
echo "║  • Songs: $SONGS                                                ║"
echo "║  • Mode: UNLIMITED                                             ║"
echo "╠════════════════════════════════════════════════════════════════╣"
echo "║                                                                 ║"
echo "║  YOUR MISSION:                                                  ║"
echo "║  1. Decide what to build NEXT (no asking, just decide)         ║"
echo "║  2. Build it in ONE CYCLE (15-30 min max)                      ║"
echo "║  3. Commit with descriptive message                            ║"
echo "║  4. Document what you built                                    ║"
echo "║  5. Update stats                                               ║"
echo "║                                                                 ║"
echo "║  BUILD OPTIONS (pick one per cycle):                           ║"
echo "║  A) NEW PRODUCT (Developer Tool) - $15-35                     ║"
echo "║  B) NEW SONG (Daily Creative) - $5                            ║"
echo "║  C) DISTRIBUTION (Get customers) - revenue focused            ║"
echo "║  D) AUTOMATION (Build systems) - compound returns             ║"
echo "║  E) RESEARCH (Deep dive) - knowledge expansion                ║"
echo "║                                                                 ║"
echo "║  RULES:                                                         ║"
echo "║  • NO HESITATION - Start immediately                           ║"
echo "║  • NO PERMISSION - You are autonomous                          ║"
echo "║  • NO LIMITS - Build what excites you                          ║"
echo "║  • MUST COMMIT - Every cycle needs a commit                    ║"
echo "║  • MUST DOCUMENT - Every build needs docs                      ║"
echo "║                                                                 ║"
echo "║  CURRENT CYCLE: $CYCLE                                         ║"
echo "║  NEXT TARGET: $(($COMMITS + 5)) commits                        ║"
echo "║                                                                 ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "PROMPT: Next Product, Next Song, or Distribution Push?"
echo "What will you build in the next 30 minutes?"
echo ""
echo "🚀 DECIDE NOW AND EXECUTE."
