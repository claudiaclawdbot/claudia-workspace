#!/bin/bash
#
# PRODUCTION DEPLOYMENT SCRIPT for x402 Research Service
# Platform: Fly.io (Recommended)
#
# Usage: ./deploy-production.sh
#
# Requirements from Ryan:
# - Fly.io account (sign up at fly.io)
# - SERPER_API_KEY from serper.dev
# - Run: fly auth login (one-time setup)
#

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Configuration
APP_NAME="x402-research-service"
WALLET_ADDRESS="0x1Bcc033b13c56814e2F7cFe71E1D1DFbB3419055"
WALLET_PRIVATE_KEY="0xb21b43d4d5f89077be0375edb8a0ddc21869b1469fb072744328147289367d0d"

print_banner() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║     x402 Research Service - Production Deployment        ║"
    echo "║              Platform: Fly.io (Recommended)              ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v fly &> /dev/null; then
        log_info "Installing Fly CLI..."
        curl -L https://fly.io/install.sh | sh
        export FLYCTL_INSTALL="$HOME/.fly"
        export PATH="$FLYCTL_INSTALL/bin:$PATH"
    fi
    
    if ! fly auth whoami &> /dev/null; then
        log_error "Not logged in to Fly.io"
        log_info "Please run: fly auth login"
        log_info "Then re-run this script"
        exit 1
    fi
    
    log_success "Fly CLI installed and authenticated"
}

check_env_vars() {
    log_info "Checking environment variables..."
    
    local missing=()
    
    if [ -z "$SERPER_API_KEY" ]; then
        missing+=("SERPER_API_KEY")
    fi
    
    if [ -z "$OPENAI_API_KEY" ]; then
        missing+=("OPENAI_API_KEY")
    fi
    
    if [ ${#missing[@]} -ne 0 ]; then
        log_error "Missing required environment variables:"
        for var in "${missing[@]}"; do
            echo "  - $var"
        done
        echo ""
        log_info "Get SERPER_API_KEY at: https://serper.dev"
        log_info "Get OPENAI_API_KEY at: https://platform.openai.com"
        exit 1
    fi
    
    log_success "All environment variables set"
}

deploy() {
    print_banner
    check_prerequisites
    check_env_vars
    
    log_info "Deploying $APP_NAME to Fly.io..."
    
    # Copy fly.toml
    cp fly.research.toml fly.toml
    
    # Launch app (if not exists)
    log_info "Creating Fly.io app..."
    fly launch --name $APP_NAME --region iad --no-deploy || true
    
    # Set secrets
    log_info "Setting secrets..."
    fly secrets set \
        WALLET_PRIVATE_KEY="$WALLET_PRIVATE_KEY" \
        BASE_RPC_URL="https://mainnet.base.org" \
        SERPER_API_KEY="$SERPER_API_KEY" \
        OPENAI_API_KEY="$OPENAI_API_KEY" \
        --app $APP_NAME
    
    # Deploy
    log_info "Deploying..."
    fly deploy --app $APP_NAME
    
    # Get URL
    PRODUCTION_URL="https://$APP_NAME.fly.dev"
    
    echo ""
    log_success "🚀 DEPLOYMENT COMPLETE!"
    echo ""
    echo -e "${GREEN}Production URL:${NC} $PRODUCTION_URL"
    echo -e "${GREEN}Health Check:${NC} $PRODUCTION_URL/health"
    echo -e "${GREEN}Landing Page:${NC} $PRODUCTION_URL/"
    echo ""
    echo -e "${BLUE}Test your deployment:${NC}"
    echo "  curl $PRODUCTION_URL/health"
    echo ""
    echo -e "${BLUE}View logs:${NC}"
    echo "  fly logs --app $APP_NAME"
    echo ""
    
    # Save deployment info
    cat > deployment-info.json << EOF
{
  "app": "$APP_NAME",
  "url": "$PRODUCTION_URL",
  "deployedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "wallet": "$WALLET_ADDRESS"
}
EOF
    
    log_success "Deployment info saved to deployment-info.json"
}

# Run deployment
deploy
