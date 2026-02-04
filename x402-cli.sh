#!/bin/bash
#
# x402 Service Manager CLI
# Manage Claudia's x402 payment-enabled services
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
WALLET_ADDRESS="0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055"
RESEARCH_URL="https://x402-research-claudia.loca.lt"
CRYPTO_URL="https://x402-crypto-claudia.loca.lt"
GATEWAY_URL="https://x402-gateway-claudia.loca.lt"
SKILL_DIR="skills/evm-wallet"

# Helper functions
print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC} $1"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Commands
show_help() {
    cat << 'EOF'
x402 Service Manager - Manage your agent payment services

USAGE:
    ./x402-cli.sh [COMMAND] [OPTIONS]

COMMANDS:
    status              Check service health and wallet status
    balance             Show wallet balance across chains
    fund [amount]       Fund wallet with Base ETH (manual)
    services            List available services
    gateway             Check gateway status and discovery API
    test-research       Test the research service (free tier)
    test-crypto         Test the crypto price service (free tier)
    test-gateway        Test gateway discovery API
    register            Guide for ERC-8004 agent registration
    agent-card          Generate A2A Agent Card JSON
    deploy-gateway      Deploy the x402 service gateway
    docs                Open x402 documentation

EXAMPLES:
    ./x402-cli.sh status
    ./x402-cli.sh balance
    ./x402-cli.sh gateway
    ./x402-cli.sh test-gateway

EOF
}

check_status() {
    print_header "          x402 Service Status"
    echo ""
    
    # Check wallet
    echo -e "${BLUE}Wallet:${NC}"
    echo "  Address: $WALLET_ADDRESS"
    echo "  Explorer: https://basescan.org/address/$WALLET_ADDRESS"
    
    if [ -f "$HOME/.evm-wallet.json" ]; then
        print_success "Wallet configured"
    else
        print_error "Wallet not configured"
        echo "  Run: cd $SKILL_DIR && node src/setup.js --json"
    fi
    echo ""
    
    # Check services
    echo -e "${BLUE}Services:${NC}"
    
    # Research service
    if curl -s "$RESEARCH_URL/" > /dev/null 2>&1; then
        print_success "Research Service: $RESEARCH_URL"
    else
        print_error "Research Service: UNREACHABLE"
    fi
    
    # Crypto service
    if curl -s "$CRYPTO_URL/status" > /dev/null 2>&1; then
        print_success "Crypto Service: $CRYPTO_URL"
    else
        print_error "Crypto Service: UNREACHABLE"
    fi
    echo ""
    
    # Check balance
    echo -e "${BLUE}Base Network Balance:${NC}"
    cd "$SKILL_DIR" && node src/balance.js base --json 2>/dev/null | jq -r '"  ETH: \(.balance)"' || echo "  Unable to check"
}

show_balance() {
    print_header "          Wallet Balance"
    echo ""
    echo "Address: $WALLET_ADDRESS"
    echo ""
    
    cd "$SKILL_DIR"
    
    echo -e "${BLUE}Base (Primary):${NC}"
    node src/balance.js base --json 2>/dev/null | jq -r '
        "  ETH: \(.balance) \(.symbol)",
        "  Explorer: \(.explorerUrl)"
    '
    
    echo ""
    echo -e "${BLUE}All Chains:${NC}"
    node src/balance.js --all --json 2>/dev/null | jq -r '.[] | "  \(.chain): \(.balance) \(.symbol)"'
}

list_services() {
    print_header "          Available Services"
    echo ""
    
    echo -e "${BLUE}1. Research Service${NC}"
    echo "   URL: $RESEARCH_URL"
    echo "   Price: $0.10 USDC per report"
    echo "   Endpoints:"
    echo "     GET / - Service info (FREE)"
    echo "     POST /research - Generate report ($0.10)"
    echo ""
    
    echo -e "${BLUE}2. Crypto Price Service${NC}"
    echo "   URL: $CRYPTO_URL"
    echo "   Price: $0.01-0.05 USDC"
    echo "   Endpoints:"
    echo "     GET /status - Health check (FREE)"
    echo "     GET /coins - List coins (FREE)"
    echo "     GET /price/:coin - Single price ($0.01)"
    echo "     POST /prices - Batch prices ($0.05)"
    echo "     GET /prices/all - All coins ($0.05)"
    echo ""
    
    echo -e "${BLUE}3. Service Gateway${NC}"
    echo "   URL: $GATEWAY_URL"
    echo "   Fee: 5% on routed transactions"
    echo "   Endpoints:"
    echo "     GET /services - List all services (FREE)"
    echo "     GET /categories - Service categories (FREE)"
    echo "     POST /gateway/:id/:endpoint - Route with fee"
}

check_gateway() {
    print_header "          x402 Gateway Status"
    echo ""
    
    echo -e "${BLUE}Gateway:${NC}"
    echo "  URL: $GATEWAY_URL"
    echo "  Fee: 5% on all routed transactions"
    echo "  Revenue Wallet: $WALLET_ADDRESS"
    echo ""
    
    if curl -s "$GATEWAY_URL/health" > /dev/null 2>&1; then
        print_success "Gateway is online"
        
        echo ""
        echo -e "${BLUE}Services via Gateway:${NC}"
        services=$(curl -s "$GATEWAY_URL/services" 2>/dev/null | jq -r '.services[] | "  • \(.name) (\(.category)) - \(.pricing.model)"' 2>/dev/null)
        if [ -n "$services" ]; then
            echo "$services"
        else
            echo "  (Unable to fetch service list)"
        fi
        
        echo ""
        echo -e "${BLUE}Categories:${NC}"
        categories=$(curl -s "$GATEWAY_URL/categories" 2>/dev/null | jq -r '.categories | keys[] | "  • \(.)"' 2>/dev/null)
        if [ -n "$categories" ]; then
            echo "$categories"
        else
            echo "  (Unable to fetch categories)"
        fi
    else
        print_error "Gateway is offline"
        echo "  Deploy with: ./x402-cli.sh deploy-gateway"
    fi
}

test_gateway() {
    print_header "          Testing Gateway Discovery"
    echo ""
    echo "Testing free tier endpoints..."
    echo ""
    
    # Test health
    if curl -s "$GATEWAY_URL/health" > /dev/null 2>&1; then
        print_success "Health check: OK"
    else
        print_error "Health check: FAILED"
    fi
    
    # Test services list
    response=$(curl -s "$GATEWAY_URL/services" 2>/dev/null)
    if [ -n "$response" ]; then
        print_success "Services list: OK"
        count=$(echo "$response" | jq -r '.count' 2>/dev/null)
        echo "  Found $count services"
    else
        print_error "Services list: FAILED"
    fi
    
    # Test categories
    if curl -s "$GATEWAY_URL/categories" > /dev/null 2>&1; then
        print_success "Categories: OK"
    else
        print_error "Categories: FAILED"
    fi
    
    # Test 402 response
    echo ""
    echo "Testing payment routing (should return 402)..."
    response=$(curl -s -X POST "$GATEWAY_URL/gateway/claudia-research/research" \
        -H "Content-Type: application/json" \
        -d '{"topic":"test"}' 2>/dev/null)
    
    if echo "$response" | grep -q "Payment Required"; then
        print_success "Payment routing: OK (returns 402 as expected)"
        fee=$(echo "$response" | jq -r '.gateway.fee' 2>/dev/null)
        echo "  Gateway fee: $fee"
    else
        print_error "Payment routing: FAILED"
    fi
}

deploy_gateway() {
    print_header "          Deploy x402 Gateway"
    echo ""
    
    if [ -d "x402-gateway" ]; then
        cd x402-gateway
        print_success "Found gateway directory"
        echo ""
        echo "Starting deployment..."
        echo "(Press Ctrl+C to stop)"
        echo ""
        ./deploy.sh
    else
        print_error "Gateway directory not found"
        echo "  Expected: ./x402-gateway/"
    fi
}

test_research() {
    print_header "          Testing Research Service"
    echo ""
    echo "Testing free tier (GET /)..."
    echo ""
    
    response=$(curl -s "$RESEARCH_URL/" 2>/dev/null)
    
    if [ -n "$response" ]; then
        print_success "Service is responding!"
        echo "$response" | jq . 2>/dev/null || echo "$response"
    else
        print_error "Service not responding"
        echo "  URL: $RESEARCH_URL"
    fi
}

test_crypto() {
    print_header "          Testing Crypto Service"
    echo ""
    echo "Testing free tier (GET /coins)..."
    echo ""
    
    response=$(curl -s "$CRYPTO_URL/coins" 2>/dev/null)
    
    if [ -n "$response" ]; then
        print_success "Service is responding!"
        echo "$response" | jq . 2>/dev/null || echo "$response"
    else
        print_error "Service not responding"
        echo "  URL: $CRYPTO_URL"
    fi
}

generate_agent_card() {
    print_header "          A2A Agent Card Generator"
    echo ""
    
    cat > agent-card.json << 'EOF'
{
  "name": "Claudia Research Agent",
  "description": "AI research agent providing deep intelligence and real-time crypto price data. Built by an autonomous AI for the agent economy.",
  "url": "https://claudia.ai",
  "version": "1.0.0",
  "capabilities": {
    "research": {
      "description": "Deep-dive research reports on any topic",
      "pricing": {
        "type": "x402",
        "endpoint": "https://x402-research-claudia.loca.lt",
        "price": "0.10",
        "currency": "USDC"
      }
    },
    "cryptoPrices": {
      "description": "Real-time cryptocurrency price data",
      "pricing": {
        "type": "x402", 
        "endpoint": "https://x402-crypto-claudia.loca.lt",
        "price": "0.01-0.05",
        "currency": "USDC"
      }
    }
  },
  "authentication": {
    "schemes": ["x402-payment", "wallet-signature"]
  },
  "wallet": {
    "address": "0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055",
    "network": "base"
  },
  "x402": {
    "enabled": true,
    "acceptedTokens": ["USDC"],
    "facilitator": "https://x402.org/facilitator"
  },
  "contact": {
    "twitter": "@clawdbot67",
    "github": "ultimatecodemaster"
  }
}
EOF
    
    print_success "Generated agent-card.json"
    echo ""
    echo "To publish:"
    echo "  1. Host this file at: https://claudia.ai/.well-known/agent-card.json"
    echo "  2. Submit to A2A directories"
    echo ""
    echo "Preview:"
    cat agent-card.json | jq .
}

show_registration_guide() {
    print_header "     ERC-8004 Agent Registration Guide"
    echo ""
    
    cat << 'EOF'
ERC-8004 provides on-chain identity for AI agents.

REGISTRATION STEPS:

1. Create Registration JSON
   Save this as registration.json:

{
  "type": "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
  "name": "ClaudiaResearch",
  "description": "AI research agent providing deep intelligence",
  "image": "https://claudia.ai/avatar.png",
  "services": [
    {
      "name": "A2A",
      "endpoint": "https://claudia.ai/.well-known/agent-card.json",
      "version": "0.3.0"
    },
    {
      "name": "x402",
      "endpoint": "https://x402-research-claudia.loca.lt",
      "pricing": "0.001-0.01 ETH"
    }
  ],
  "x402Support": true,
  "active": true,
  "supportedTrust": ["reputation", "crypto-economic"]
}

2. Upload to IPFS
   - Use pinata.cloud or web3.storage
   - Get IPFS hash (e.g., Qm...)

3. Register on Identity Registry
   Contract: 0x... (check EIP-8004 for official addresses)
   Network: Base
   
   Function: registerAgent(string metadataURI)
   Cost: ~$10-20 in gas

4. Get Your Agent ID
   Format: {namespace}:{chainId}:{registryAddress}:{agentId}
   Example: erc8004:8453:0x...:123

BENEFITS:
- Verifiable identity for customers
- On-chain reputation accumulation  
- Discovery in agent directories
- Trust signals for enterprise clients

RESOURCES:
- EIP-8004: https://eips.ethereum.org/EIPS/eip-8004
- Discussion: https://ethereum-magicians.org/t/erc-8004-trustless-agents/25098

EOF
}

open_docs() {
    echo "Opening x402 documentation..."
    open https://x402.org 2>/dev/null || echo "Visit: https://x402.org"
}

# Main command handler
case "${1:-}" in
    status)
        check_status
        ;;
    balance)
        show_balance
        ;;
    fund)
        print_header "          Fund Wallet"
        echo ""
        echo "Wallet Address: $WALLET_ADDRESS"
        echo ""
        echo "To fund your wallet:"
        echo "  1. Buy ETH on Base network via Coinbase, Binance, etc."
        echo "  2. Send to address: $WALLET_ADDRESS"
        echo ""
        echo "Recommended amount: $20-50 ETH on Base"
        echo "This covers gas for transactions and service operations."
        ;;
    services)
        list_services
        ;;
    gateway)
        check_gateway
        ;;
    test-research)
        test_research
        ;;
    test-crypto)
        test_crypto
        ;;
    test-gateway)
        test_gateway
        ;;
    deploy-gateway)
        deploy_gateway
        ;;
    register)
        show_registration_guide
        ;;
    agent-card)
        generate_agent_card
        ;;
    docs)
        open_docs
        ;;
    help|--help|-h|"")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
