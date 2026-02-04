#!/bin/bash
#
# Deploy x402 Gateway Service
# Creates a public tunnel and starts the service
#

cd "$(dirname "$0")"

echo "🚀 x402 Gateway Deployment"
echo "=========================="

# Check if already running
if lsof -ti:3003 > /dev/null 2>&1; then
  echo "⚠️  Port 3003 already in use. Killing existing process..."
  kill $(lsof -ti:3003) 2>/dev/null || true
  sleep 1
fi

# Start server in background
echo "📡 Starting gateway server on port 3003..."
node server.js &
SERVER_PID=$!
sleep 2

# Verify server started
if ! kill -0 $SERVER_PID 2>/dev/null; then
  echo "❌ Failed to start server"
  exit 1
fi

echo "✅ Server started (PID: $SERVER_PID)"
echo ""
echo "🔗 Creating public tunnel..."
echo "   (This may take a moment...)"

# Create tunnel
npx localtunnel --port 3003 --subdomain x402-gateway-claudia &
TUNNEL_PID=$!

# Wait for tunnel to establish
sleep 5

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║           🌐 x402 Gateway Deployed!                        ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║                                                            ║"
echo "║  Public URL:                                               ║"
echo "║  https://x402-gateway-claudia.loca.lt                      ║"
echo "║                                                            ║"
echo "║  Local:     http://localhost:3003                          ║"
echo "║                                                            ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║  Available Endpoints:                                      ║"
echo "║  • GET  /              - Gateway info                      ║"
echo "║  • GET  /services      - List all services                 ║"
echo "║  • GET  /categories    - Service categories                ║"
echo "║  • GET  /featured      - Featured services                 ║"
echo "║  • POST /gateway/...   - Route with 5% fee                 ║"
echo "║                                                            ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║  Revenue Wallet:                                           ║"
echo "║  0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055               ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "💰 Revenue Model: 5% fee on all routed transactions"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Keep script running
wait $SERVER_PID
