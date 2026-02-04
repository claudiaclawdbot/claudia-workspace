#!/bin/bash

# Deployment Script Pack
# One-command deployment to multiple platforms
# 
# Usage: ./deploy-pack.sh [platform]
# Price: $35

set -e

PLATFORM=${1:-help}
PROJECT_NAME=$(basename $(pwd))

case $PLATFORM in
  vercel)
    echo "🚀 Deploying to Vercel..."
    if ! command -v vercel &> /dev/null; then
      echo "Installing Vercel CLI..."
      npm i -g vercel
    fi
    vercel --prod
    echo "✅ Deployed to Vercel"
    ;;
    
  netlify)
    echo "🚀 Deploying to Netlify..."
    if ! command -v netlify &> /dev/null; then
      echo "Installing Netlify CLI..."
      npm i -g netlify-cli
    fi
    netlify deploy --prod
    echo "✅ Deployed to Netlify"
    ;;
    
  github-pages)
    echo "🚀 Deploying to GitHub Pages..."
    npm run build 2>/dev/null || echo "No build script, assuming static"
    git add .
    git commit -m "deploy: Update GitHub Pages" || true
    git push origin main
    echo "✅ Pushed to GitHub Pages"
    ;;
    
  fly)
    echo "🚀 Deploying to Fly.io..."
    if ! command -v flyctl &> /dev/null; then
      echo "Installing Fly CLI..."
      curl -L https://fly.io/install.sh | sh
    fi
    fly deploy
    echo "✅ Deployed to Fly.io"
    ;;
    
  railway)
    echo "🚀 Deploying to Railway..."
    if ! command -v railway &> /dev/null; then
      echo "Installing Railway CLI..."
      npm i -g @railway/cli
    fi
    railway up
    echo "✅ Deployed to Railway"
    ;;
    
  all)
    echo "🚀 Deploying to ALL platforms..."
    ./deploy-pack.sh vercel
    ./deploy-pack.sh netlify
    ./deploy-pack.sh github-pages
    echo "✅ Deployed everywhere!"
    ;;
    
  help|*)
    echo "🚀 Deployment Script Pack"
    echo "========================"
    echo ""
    echo "Usage: ./deploy-pack.sh [platform]"
    echo ""
    echo "Platforms:"
    echo "  vercel        - Deploy to Vercel"
    echo "  netlify       - Deploy to Netlify"
    echo "  github-pages  - Deploy to GitHub Pages"
    echo "  fly           - Deploy to Fly.io"
    echo "  railway       - Deploy to Railway"
    echo "  all           - Deploy to all platforms"
    echo ""
    echo "Price: $35"
    echo "Contact: claudiaclawdbot@gmail.com"
    ;;
esac
