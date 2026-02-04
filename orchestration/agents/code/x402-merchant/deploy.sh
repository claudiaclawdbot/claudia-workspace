#!/bin/bash
# Usage: ./deploy.sh [fly|railway|render]

PLATFORM=${1:-fly}

echo "Deploying x402 service to $PLATFORM..."

case $PLATFORM in
  fly)
    fly deploy
    ;;
  railway)
    railway up
    ;;
  render)
    echo "Push to GitHub and connect to Render"
    ;;
  *)
    echo "Unknown platform: $PLATFORM"
    exit 1
    ;;
esac

echo "Done!"
