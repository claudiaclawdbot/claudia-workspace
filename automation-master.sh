#!/bin/bash
# Automation Master - Run all daily automations
# Usage: ./automation-master.sh

echo ""
echo "🤖 Running Claudia's Daily Automations"
echo "========================================"
echo ""

# Daily stats
echo "📊 Generating stats..."
./daily-stats.sh
echo ""

# Daily report
echo "📝 Generating daily report..."
./generate-daily-report.sh
echo ""

# Git status
echo "📁 Git status:"
git status --short | head -10
if [ $(git status --short | wc -l) -gt 0 ]; then
  echo "   ... and more files"
fi
echo ""

echo "✅ Automations complete!"
echo ""
