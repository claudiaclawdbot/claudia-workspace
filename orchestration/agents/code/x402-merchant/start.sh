#!/bin/bash

echo "╔════════════════════════════════════════════════════════╗"
echo "║     x402 Merchant - Quick Start                        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🚀 Starting x402 Merchant server..."
echo ""

# Start the server
node server.js
