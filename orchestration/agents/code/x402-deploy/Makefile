# Makefile for x402 Services Deployment
# Usage: make deploy, make test, make logs, etc.

.PHONY: help setup deploy deploy-local deploy-railway deploy-fly test logs stop clean status

# Default target
help:
	@echo "x402 Services Deployment Commands:"
	@echo ""
	@echo "  make setup          - First-time setup"
	@echo "  make deploy         - Interactive deployment"
	@echo "  make deploy-local   - Deploy locally with Docker"
	@echo "  make deploy-railway - Deploy to Railway"
	@echo "  make deploy-fly     - Deploy to Fly.io"
	@echo "  make test           - Test deployment"
	@echo "  make logs           - View logs"
	@echo "  make stop           - Stop services"
	@echo "  make clean          - Clean up everything"
	@echo "  make status         - Check service status"
	@echo ""

# Setup
setup:
	@./scripts/setup.sh

# Deploy commands
deploy:
	@./deploy.sh

deploy-local:
	@./deploy.sh both docker

deploy-railway:
	@./deploy.sh both railway

deploy-fly:
	@./deploy.sh both fly

# Service-specific deployments
deploy-merchant:
	@./deploy.sh merchant docker

deploy-research:
	@./deploy.sh research docker

# Testing
test:
	@./scripts/test-deployment.sh

# Logs
logs:
	@docker-compose logs -f

logs-merchant:
	@docker-compose logs -f merchant

logs-research:
	@docker-compose logs -f research

# Management
stop:
	@docker-compose down

clean:
	@docker-compose down -v
	@docker system prune -f

status:
	@docker-compose ps

# Development
dev:
	@docker-compose up --build

dev-detached:
	@docker-compose up --build -d