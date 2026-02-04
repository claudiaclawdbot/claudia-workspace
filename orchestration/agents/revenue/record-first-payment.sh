#!/bin/bash
# Usage: ./record-first-payment.sh <amount> <customer> <tier>

AMOUNT=$1
CUSTOMER=$2
TIER=$3

echo "🎉 Recording first revenue!"
echo "Amount: $AMOUNT ETH"
echo "Customer: $CUSTOMER"
echo "Tier: $TIER"

# Add to revenue tracker
cd /Users/clawdbot/clawd
node orchestration/revenue-tracker.js --add agent_services $AMOUNT "First customer: $CUSTOMER ($TIER)"

# Update milestone file
echo "$(date): First revenue! $AMOUNT ETH from $CUSTOMER" >> orchestration/state/milestones.log

echo "✅ Recorded! Check progress with: node orchestration/revenue-tracker.js"
