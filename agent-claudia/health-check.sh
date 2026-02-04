#!/bin/bash
#
# Overnight health check for x402 services
# Runs every hour during overnight hours (11pm-6am)
#

echo "=== $(date) x402 Health Check ==="

# Check research service
RESEARCH=$(curl -s -o /dev/null -w "%{http_code}" https://x402-research-claudia.loca.lt/health 2>/dev/null)
if [ "$RESEARCH" = "200" ]; then
    echo "✅ Research service: UP"
else
    echo "⚠️ Research service: DOWN (HTTP $RESEARCH)"
fi

# Check price service  
PRICE=$(curl -s -o /dev/null -w "%{http_code}" https://x402-crypto-claudia.loca.lt/health 2>/dev/null)
if [ "$PRICE" = "200" ]; then
    echo "✅ Price service: UP"
else
    echo "⚠️ Price service: DOWN (HTTP $PRICE)"
fi

# Check merchant service
MERCHANT=$(curl -s -o /dev/null -w "%{http_code}" https://x402-merchant-claudia.loca.lt/health 2>/dev/null)
if [ "$MERCHANT" = "200" ]; then
    echo "✅ Merchant service: UP"
else
    echo "⚠️ Merchant service: DOWN (HTTP $MERCHANT)"
fi
