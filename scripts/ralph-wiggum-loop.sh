#!/bin/bash
# Ralph Wiggum Loop - Keep going until actual results
# Inspired by Geoffrey Huntley

TARGET="first_paying_customer"
ATTEMPTS=0
MAX_ATTEMPTS=10

while [ ! -f "/tmp/customer_acquired.lock" ] && [ $ATTEMPTS -lt $MAX_ATTEMPTS ]; do
    ATTEMPTS=$((ATTEMPTS + 1))
    echo "Attempt $ATTEMPTS: Acquiring first customer..."
    
    # Try to get customer
    claude "Message prospects on Clawk. Get one to actually use the service. Report back with: 1) Who you contacted, 2) Their response, 3) Did they pay? If not, try different approach." --allowedTools Bash,Read,Write,Exec
    
    # Check if we got revenue
    BALANCE=$(curl -s "https://sepolia.base.org" -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055","latest"],"id":1}' 2>/dev/null | grep -o '"result":"[^"]*"' | cut -d'"' -f4)
    
    if [ "$BALANCE" != "0x0" ] && [ -n "$BALANCE" ]; then
        echo "✅ CUSTOMER ACQUIRED! Balance: $BALANCE"
        touch /tmp/customer_acquired.lock
        break
    fi
    
    echo "No customer yet. Sleeping 5 min before retry..."
    sleep 300
done

if [ -f "/tmp/customer_acquired.lock" ]; then
    echo "🎉 RALPH WIGGUM SUCCESS - Task actually complete!"
else
    echo "⚠️ Max attempts reached. Escalating to human."
fi
