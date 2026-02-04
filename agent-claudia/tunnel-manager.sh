#!/usr/bin/env bash
#===============================================================================
#
#          FILE: tunnel-manager.sh
#
#         USAGE: ./tunnel-manager.sh
#
#   DESCRIPTION: Keeps cloudflared tunnels running for x402 services
#
#===============================================================================

# Tunnel URLs (update these when restarting)
RESEARCH_TUNNEL="https://likely-alert-mailing-crops.trycloudflare.com"
CRYPTO_TUNNEL="https://medieval-rider-stylish-noble.trycloudflare.com"

# Local ports
RESEARCH_PORT=4020
CRYPTO_PORT=3002

# Log files
RESEARCH_LOG=/tmp/research-tunnel.log
CRYPTO_LOG=/tmp/crypto-tunnel.log

# PIDs
RESEARCH_PID=""
CRYPTO_PID=""

start_tunnels() {
    echo "Starting tunnels..."
    
    # Kill existing
    pkill -f "cloudflared tunnel --url http://localhost:$RESEARCH_PORT" 2>/dev/null
    pkill -f "cloudflared tunnel --url http://localhost:$CRYPTO_PORT" 2>/dev/null
    sleep 2
    
    # Start research tunnel
    cd /Users/clawdbot/clawd/orchestration/agents/code/x402-research-service
    nohup cloudflared tunnel --url http://localhost:$RESEARCH_PORT > $RESEARCH_LOG 2>&1 &
    RESEARCH_PID=$!
    
    # Start crypto tunnel
    cd /Users/clawdbot/clawd/orchestration/agents/code/x402-crypto-service
    nohup cloudflared tunnel --url http://localhost:$CRYPTO_PORT > $CRYPTO_LOG 2>&1 &
    CRYPTO_PID=$!
    
    echo "Research tunnel PID: $RESEARCH_PID"
    echo "Crypto tunnel PID: $CRYPTO_PID"
    
    # Wait for tunnels to establish
    sleep 10
    
    # Extract URLs
    RESEARCH_URL=$(grep "trycloudflare.com" $RESEARCH_LOG | tail -1 | grep -o 'https://[^"]*')
    CRYPTO_URL=$(grep "trycloudflare.com" $CRYPTO_LOG | tail -1 | grep -o 'https://[^"]*')
    
    echo ""
    echo "=== TUNNELS ACTIVE ==="
    echo "Research: $RESEARCH_URL"
    echo "Crypto:   $CRYPTO_URL"
    echo ""
    
    # Update health checker
    sed -i '' "s|RESEARCH_URL=.*|RESEARCH_URL=\"${RESEARCH_URL}/status\"|" /Users/clawdbot/clawd/agent-claudia/health-check.sh
    sed -i '' "s|PRICE_URL=.*|PRICE_URL=\"${CRYPTO_URL}/status\"|" /Users/clawdbot/clawd/agent-claudia/health-check.sh
}

check_health() {
    echo "Checking service health..."
    
    RESEARCH_URL=$(grep "RESEARCH_URL=" /Users/clawdbot/clawd/agent-claudia/health-check.sh | head -1 | cut -d'"' -f2)
    CRYPTO_URL=$(grep "PRICE_URL=" /Users/clawdbot/clawd/agent-claudia/health-check.sh | head -1 | cut -d'"' -f2)
    
    echo "Research: $(curl -s $RESEARCH_URL 2>/dev/null | grep -o '"status":"[^"]*"' | cut -d'"' -f4 || echo 'DOWN')"
    echo "Crypto:   $(curl -s $CRYPTO_URL 2>/dev/null | grep -o '"status":"[^"]*"' | cut -d'"' -f4 || echo 'DOWN')"
}

# Main
case "${1:-}" in
    start)
        start_tunnels
        ;;
    check)
        check_health
        ;;
    *)
        echo "Usage: $0 {start|check}"
        exit 1
        ;;
esac
