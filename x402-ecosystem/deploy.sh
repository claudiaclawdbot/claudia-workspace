#!/bin/bash
# x402 Ecosystem Deployment Script
# Deploys all three services to Fly.io or Railway

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ECOSYSTEM_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDIA_DIR="$(dirname "$ECOSYSTEM_DIR")"

# Service directories
RESEARCH_DIR="$CLAUDIA_DIR/orchestration/agents/code/x402-research-service"
CRYPTO_DIR="$CLAUDIA_DIR/orchestration/agents/code/x402-crypto-service"
GATEWAY_DIR="$CLAUDIA_DIR/x402-gateway"

# Print banner
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           x402 Ecosystem Deployment                        ║${NC}"
echo -e "${BLUE}║           Deploy services to permanent hosting             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check arguments
PLATFORM=${1:-fly}
ACTION=${2:-all}

if [[ "$PLATFORM" != "fly" && "$PLATFORM" != "railway" ]]; then
    echo -e "${RED}Error: Platform must be 'fly' or 'railway'${NC}"
    echo "Usage: ./deploy.sh [fly|railway] [all|research|crypto|gateway]"
    exit 1
fi

echo -e "${YELLOW}Platform:${NC} $PLATFORM"
echo -e "${YELLOW}Action:${NC} $ACTION"
echo ""

# Function to deploy to Fly.io
deploy_fly() {
    local service=$1
    local dir=$2
    local toml_file=$3
    
    echo -e "${BLUE}Deploying $service to Fly.io...${NC}"
    
    cd "$dir"
    
    # Copy the appropriate fly.toml
    cp "$ECOSYSTEM_DIR/$toml_file" fly.toml
    
    # Check if app exists
    if ! fly apps list | grep -q "x402-$service"; then
        echo -e "${YELLOW}Creating app x402-$service...${NC}"
        fly apps create "x402-$service" || true
    fi
    
    # Deploy
    echo -e "${YELLOW}Deploying...${NC}"
    fly deploy --wait-timeout=300
    
    # Get URL
    local url=$(fly status --json 2>/dev/null | grep -o '"Hostname": "[^"]*"' | cut -d'"' -f4 || echo "x402-$service.fly.dev")
    
    echo -e "${GREEN}✓ $service deployed successfully!${NC}"
    echo -e "${GREEN}  URL: https://$url${NC}"
    echo ""
}

# Function to deploy to Railway
deploy_railway() {
    local service=$1
    local dir=$2
    local config_file=$3
    local dockerfile=$4
    
    echo -e "${BLUE}Deploying $service to Railway...${NC}"
    
    cd "$dir"
    
    # Copy config files
    cp "$ECOSYSTEM_DIR/$config_file" railway.json
    cp "$ECOSYSTEM_DIR/$dockerfile" Dockerfile
    
    # Check if project exists
    if [ ! -f ".railway/config.json" ]; then
        echo -e "${YELLOW}Initializing Railway project...${NC}"
        railway init --name "x402-$service"
    fi
    
    # Deploy
    echo -e "${YELLOW}Deploying...${NC}"
    railway up --detach
    
    echo -e "${GREEN}✓ $service deployed successfully!${NC}"
    echo -e "${YELLOW}  Get URL with: railway domain${NC}"
    echo ""
}

# Deploy function based on platform
deploy_service() {
    if [[ "$PLATFORM" == "fly" ]]; then
        case $1 in
            research)
                deploy_fly "research-service" "$RESEARCH_DIR" "fly.research.toml"
                ;;
            crypto)
                deploy_fly "crypto-service" "$CRYPTO_DIR" "fly.crypto.toml"
                ;;
            gateway)
                deploy_fly "gateway" "$GATEWAY_DIR" "fly.gateway.toml"
                ;;
        esac
    else
        case $1 in
            research)
                deploy_railway "research" "$RESEARCH_DIR" "railway.research.json" "Dockerfile.research"
                ;;
            crypto)
                deploy_railway "crypto" "$CRYPTO_DIR" "railway.crypto.json" "Dockerfile.crypto"
                ;;
            gateway)
                deploy_railway "gateway" "$GATEWAY_DIR" "railway.gateway.json" "Dockerfile.gateway"
                ;;
        esac
    fi
}

# Main deployment logic
case $ACTION in
    all)
        echo -e "${BLUE}Deploying all services...${NC}"
        deploy_service "research"
        deploy_service "crypto"
        deploy_service "gateway"
        echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║           All services deployed!                           ║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
        ;;
    research)
        deploy_service "research"
        ;;
    crypto)
        deploy_service "crypto"
        ;;
    gateway)
        deploy_service "gateway"
        ;;
    *)
        echo -e "${RED}Error: Unknown service '$ACTION'${NC}"
        echo "Valid options: all, research, crypto, gateway"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Verify deployments with health checks:"
echo "   curl https://<service-url>/status"
echo ""
echo "2. Update services.json with new URLs"
echo "3. Test x402 payment flow"
echo ""
echo -e "${YELLOW}See DEPLOYMENT.md for full documentation${NC}"
