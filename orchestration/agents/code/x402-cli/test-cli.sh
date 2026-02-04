#!/bin/bash

# x402 CLI Test Script
# Demonstrates all CLI functionality

echo "════════════════════════════════════════════════════════════"
echo "  x402 CLI - Quick Test"
echo "════════════════════════════════════════════════════════════"
echo ""

cd /Users/clawdbot/clawd/orchestration/agents/code/x402-cli

echo "1. Show CLI help"
echo "────────────────────────────────────────────────────────────"
node dist/index.js --help
echo ""

echo "2. Show configuration"
echo "────────────────────────────────────────────────────────────"
node dist/index.js config
echo ""

echo "3. List available services"
echo "────────────────────────────────────────────────────────────"
node dist/index.js services
echo ""

echo "4. Get service details (Research)"
echo "────────────────────────────────────────────────────────────"
node dist/index.js service claudia-research
echo ""

echo "5. Get service details (Crypto)"
echo "────────────────────────────────────────────────────────────"
node dist/index.js service claudia-crypto
echo ""

echo "════════════════════════════════════════════════════════════"
echo "  Demo complete!"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "To test payments, you need to:"
echo "  1. Run: x402 wallet setup"
echo "  2. Get testnet ETH from https://docs.base.org/docs/network-info/#base-sepolia"
echo "  3. Get USDC from https://faucet.circle.com/"
echo "  4. Try: x402 price bitcoin"
echo ""
