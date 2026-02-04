#!/bin/bash
#
# Quick setup script for first-time users
#

set -e

echo "╔══════════════════════════════════════════════════════════╗"
echo "║         x402 Services Quick Setup                        ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Check if .env exists
if [ -f ".env" ]; then
    echo "✓ .env file already exists"
else
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "✓ Created .env - please edit it with your API keys"
fi

echo ""
echo "Next steps:"
echo ""
echo "1. Edit .env with your credentials:"
echo "   - MERCHANT_ADDRESS: Your Ethereum wallet address"
echo "   - WALLET_PRIVATE_KEY: Your service wallet private key"
echo "   - SERPER_API_KEY: From https://serper.dev"
echo "   - OPENAI_API_KEY: From https://platform.openai.com"
echo ""
echo "2. Deploy with a single command:"
echo "   ./deploy.sh"
echo ""
echo "3. Test your deployment:"
echo "   ./scripts/test-deployment.sh"
echo ""
echo "For help: ./deploy.sh --help"