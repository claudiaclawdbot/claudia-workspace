#!/bin/bash
#
# Test deployment script - Verify services are working after deployment
#

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${YELLOW}[TEST]${NC} $1"; }
log_success() { echo -e "${GREEN}[PASS]${NC} $1"; }
log_error() { echo -e "${RED}[FAIL]${NC} $1"; }

# Default URLs
MERCHANT_URL="${MERCHANT_URL:-http://localhost:4020}"
RESEARCH_URL="${RESEARCH_URL:-http://localhost:4021}"

log_info "Testing x402 services..."
log_info "Merchant URL: $MERCHANT_URL"
log_info "Research URL: $RESEARCH_URL"

echo ""

# Test Merchant Service
log_info "Testing Merchant service..."

if curl -s "$MERCHANT_URL/health" > /dev/null; then
    log_success "Merchant health check passed"
else
    log_error "Merchant health check failed"
fi

if curl -s "$MERCHANT_URL/price" | grep -q "basic\|deep\|custom"; then
    log_success "Merchant pricing endpoint working"
else
    log_error "Merchant pricing endpoint failed"
fi

# Test Research Service  
log_info "Testing Research service..."

if curl -s "$RESEARCH_URL/status" > /dev/null; then
    log_success "Research status check passed"
else
    log_error "Research status check failed"
fi

if curl -s "$RESEARCH_URL/pricing" | grep -q "simple\|standard\|deep"; then
    log_success "Research pricing endpoint working"
else
    log_error "Research pricing endpoint failed"
fi

echo ""
log_success "All tests completed!"