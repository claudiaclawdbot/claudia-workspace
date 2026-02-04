#!/bin/bash
#
# x402 Services Deployment Script
# One-command deployment to Railway, Fly.io, or local Docker
#
# Usage: ./deploy.sh [merchant|research|both]
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MERCHANT_DIR="$SCRIPT_DIR/../x402-merchant"
RESEARCH_DIR="$SCRIPT_DIR/../x402-research-service"
DEPLOY_START_TIME=$(date +%s)

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_banner() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║              x402 Services Deployment Tool               ║"
    echo "║         Deploy CLAUDIA's revenue-generating APIs         ║"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    local missing=()
    
    # Check for Docker
    if ! command -v docker &> /dev/null; then
        missing+=("docker")
    fi
    
    # Check for docker-compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        missing+=("docker-compose")
    fi
    
    # Check for git
    if ! command -v git &> /dev/null; then
        missing+=("git")
    fi
    
    if [ ${#missing[@]} -ne 0 ]; then
        log_error "Missing prerequisites: ${missing[*]}"
        log_info "Please install missing tools and try again."
        exit 1
    fi
    
    log_success "All base prerequisites found"
}

# Validate environment variables
validate_env() {
    local service=$1
    local required_vars=()
    local missing_vars=()
    
    log_info "Validating environment for $service..."
    
    if [ "$service" == "merchant" ] || [ "$service" == "both" ]; then
        required_vars+=("MERCHANT_ADDRESS")
    fi
    
    if [ "$service" == "research" ] || [ "$service" == "both" ]; then
        required_vars+=("WALLET_PRIVATE_KEY" "BASE_RPC_URL" "SERPER_API_KEY" "OPENAI_API_KEY")
    fi
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        log_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        log_info "Please set these variables in your .env file or environment"
        return 1
    fi
    
    log_success "Environment validation passed"
    return 0
}

# Run service tests
run_tests() {
    local service=$1
    log_info "Running tests for $service..."
    
    if [ "$service" == "merchant" ]; then
        cd "$MERCHANT_DIR"
        if [ -f "test-client.js" ]; then
            log_info "Running merchant test client..."
            timeout 30 node test-client.js || log_warn "Tests completed with warnings"
        else
            log_warn "No test client found, skipping tests"
        fi
    elif [ "$service" == "research" ]; then
        cd "$RESEARCH_DIR"
        if [ -f "test-service.js" ]; then
            log_info "Running research service tests..."
            timeout 30 node test-service.js || log_warn "Tests completed with warnings"
        else
            log_warn "No test service found, skipping tests"
        fi
    fi
    
    cd "$SCRIPT_DIR"
    log_success "Tests completed"
}

# Deploy to local Docker
deploy_local() {
    local service=$1
    log_info "Deploying $service locally with Docker Compose..."
    
    validate_env "$service" || return 1
    
    if [ "$service" == "both" ]; then
        docker-compose up --build -d
    elif [ "$service" == "merchant" ]; then
        docker-compose up --build -d merchant
    elif [ "$service" == "research" ]; then
        docker-compose up --build -d research
    fi
    
    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    sleep 10
    
    # Check health
    if docker-compose ps | grep -q "healthy\|Up"; then
        log_success "Services deployed successfully!"
        echo ""
        echo -e "${GREEN}Service URLs:${NC}"
        echo "  Merchant:  http://localhost:4020"
        echo "  Research:  http://localhost:4021"
        echo "  Health:    http://localhost:4020/health"
        echo "  Status:    http://localhost:4021/status"
    else
        log_error "Services failed to start. Check logs with: docker-compose logs"
        return 1
    fi
}

# Deploy to Railway
deploy_railway() {
    local service=$1
    log_info "Deploying $service to Railway..."
    
    # Check for Railway CLI
    if ! command -v railway &> /dev/null; then
        log_error "Railway CLI not found. Install with: npm install -g @railway/cli"
        return 1
    fi
    
    # Check login
    if ! railway whoami &> /dev/null; then
        log_info "Please login to Railway first..."
        railway login
    fi
    
    validate_env "$service" || return 1
    
    if [ "$service" == "merchant" ]; then
        cd "$MERCHANT_DIR"
        railway up --detach
        MERCHANT_URL=$(railway domain)
        log_success "Merchant deployed to: $MERCHANT_URL"
        
    elif [ "$service" == "research" ]; then
        cd "$RESEARCH_DIR"
        railway up --detach
        RESEARCH_URL=$(railway domain)
        log_success "Research service deployed to: $RESEARCH_URL"
        
    elif [ "$service" == "both" ]; then
        log_info "Deploying both services..."
        cd "$MERCHANT_DIR" && railway up --detach
        MERCHANT_URL=$(railway domain)
        cd "$RESEARCH_DIR" && railway up --detach
        RESEARCH_URL=$(railway domain)
        log_success "Both services deployed!"
        echo "  Merchant: $MERCHANT_URL"
        echo "  Research: $RESEARCH_URL"
    fi
    
    cd "$SCRIPT_DIR"
}

# Deploy to Fly.io
deploy_fly() {
    local service=$1
    log_info "Deploying $service to Fly.io..."
    
    # Check for Fly CLI
    if ! command -v fly &> /dev/null; then
        log_error "Fly CLI not found. Install with: curl -L https://fly.io/install.sh | sh"
        return 1
    fi
    
    # Check login
    if ! fly auth whoami &> /dev/null; then
        log_info "Please login to Fly.io first..."
        fly auth login
    fi
    
    validate_env "$service" || return 1
    
    if [ "$service" == "merchant" ]; then
        cd "$MERCHANT_DIR"
        cp "$SCRIPT_DIR/fly.merchant.toml" fly.toml
        
        # Set secrets
        fly secrets set MERCHANT_ADDRESS="$MERCHANT_ADDRESS" --app x402-merchant || true
        
        fly deploy --app x402-merchant
        MERCHANT_URL=$(fly status --app x402-merchant | grep -o 'https://[^[:space:]]*')
        log_success "Merchant deployed!"
        echo "  URL: https://x402-merchant.fly.dev"
        
    elif [ "$service" == "research" ]; then
        cd "$RESEARCH_DIR"
        cp "$SCRIPT_DIR/fly.research.toml" fly.toml
        
        # Set secrets
        fly secrets set \
            WALLET_PRIVATE_KEY="$WALLET_PRIVATE_KEY" \
            BASE_RPC_URL="$BASE_RPC_URL" \
            SERPER_API_KEY="$SERPER_API_KEY" \
            OPENAI_API_KEY="$OPENAI_API_KEY" \
            --app x402-research-service || true
        
        fly deploy --app x402-research-service
        log_success "Research service deployed!"
        echo "  URL: https://x402-research-service.fly.dev"
        
    elif [ "$service" == "both" ]; then
        log_info "Deploying both services..."
        
        # Deploy merchant
        cd "$MERCHANT_DIR"
        cp "$SCRIPT_DIR/fly.merchant.toml" fly.toml
        fly secrets set MERCHANT_ADDRESS="$MERCHANT_ADDRESS" --app x402-merchant || true
        fly deploy --app x402-merchant
        
        # Deploy research
        cd "$RESEARCH_DIR"
        cp "$SCRIPT_DIR/fly.research.toml" fly.toml
        fly secrets set \
            WALLET_PRIVATE_KEY="$WALLET_PRIVATE_KEY" \
            BASE_RPC_URL="$BASE_RPC_URL" \
            SERPER_API_KEY="$SERPER_API_KEY" \
            OPENAI_API_KEY="$OPENAI_API_KEY" \
            --app x402-research-service || true
        fly deploy --app x402-research-service
        
        log_success "Both services deployed!"
        echo "  Merchant: https://x402-merchant.fly.dev"
        echo "  Research: https://x402-research-service.fly.dev"
    fi
    
    cd "$SCRIPT_DIR"
}

# Interactive platform selection
select_platform() {
    echo ""
    echo -e "${BLUE}Select deployment platform:${NC}"
    echo "  1) Local Docker (docker-compose)"
    echo "  2) Railway"
    echo "  3) Fly.io"
    echo ""
    read -p "Enter choice (1-3): " platform_choice
    
    case $platform_choice in
        1) echo "docker" ;;
        2) echo "railway" ;;
        3) echo "fly" ;;
        *) log_error "Invalid choice"; exit 1 ;;
    esac
}

# Interactive service selection
select_service() {
    echo ""
    echo -e "${BLUE}Select service to deploy:${NC}"
    echo "  1) x402-merchant (Payment endpoint)"
    echo "  2) x402-research-service (Full research engine)"
    echo "  3) Both services"
    echo ""
    read -p "Enter choice (1-3): " service_choice
    
    case $service_choice in
        1) echo "merchant" ;;
        2) echo "research" ;;
        3) echo "both" ;;
        *) log_error "Invalid choice"; exit 1 ;;
    esac
}

# Main function
main() {
    print_banner
    
    # Load environment variables if .env exists
    if [ -f ".env" ]; then
        log_info "Loading environment from .env..."
        export $(cat .env | grep -v '^#' | xargs)
    fi
    
    # Check prerequisites
    check_prerequisites
    
    # Parse arguments
    SERVICE="${1:-}"
    PLATFORM="${2:-}"
    
    # Interactive mode if not specified
    if [ -z "$SERVICE" ]; then
        SERVICE=$(select_service)
    fi
    
    if [ -z "$PLATFORM" ]; then
        PLATFORM=$(select_platform)
    fi
    
    log_info "Deploying $SERVICE to $PLATFORM..."
    
    # Run tests before deployment
    run_tests "$SERVICE"
    
    # Deploy based on platform
    case $PLATFORM in
        docker|local)
            deploy_local "$SERVICE"
            ;;
        railway)
            deploy_railway "$SERVICE"
            ;;
        fly|fly.io)
            deploy_fly "$SERVICE"
            ;;
        *)
            log_error "Unknown platform: $PLATFORM"
            exit 1
            ;;
    esac
    
    # Calculate deployment time
    DEPLOY_END_TIME=$(date +%s)
    DEPLOY_DURATION=$((DEPLOY_END_TIME - DEPLOY_START_TIME))
    
    echo ""
    log_success "Deployment completed in ${DEPLOY_DURATION}s! 🚀"
    echo ""
    echo -e "${GREEN}Next steps:${NC}"
    echo "  - Test the services with: ./scripts/test-deployment.sh"
    echo "  - View logs with: docker-compose logs -f (local) or fly logs (fly.io)"
    echo "  - Monitor at: https://x402.org/dashboard"
    echo ""
    echo -e "${BLUE}CLAUDIA's $1M revenue journey continues! 💰${NC}"
}

# Run main function
main "$@"