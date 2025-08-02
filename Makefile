# Makefile for Docker Compose Stack (Fastify + Vite TypeScript + SQLite)
# =================================================================

# Variables
COMPOSE_FILE = docker-compose.yaml
PROJECT_NAME = fastify-vite-stack

# Colors for output
YELLOW = \033[1;33m
GREEN = \033[1;32m
RED = \033[1;31m
BLUE = \033[1;34m
NC = \033[0m # No Color

# Default target
.DEFAULT_GOAL := help

# Help target - shows available commands
help: ## Show this help message
	@echo "$(YELLOW)Available commands:$(NC)"
	@echo "$(BLUE)==================$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

# Development commands
start: ## Start all services in detached mode
	@echo "$(YELLOW)Starting $(PROJECT_NAME) services...$(NC)"
	docker compose -f $(COMPOSE_FILE) up -d --build
	@echo "$(GREEN)Services started successfully!$(NC)"
	@echo "$(BLUE)Frontend: http://localhost:5173$(NC)"
	@echo "$(BLUE)Backend:  http://localhost:3000$(NC)"

dev: ## Start development environment with logs
	@echo "$(YELLOW)Starting $(PROJECT_NAME) services with logs...$(NC)"
	docker compose -f $(COMPOSE_FILE) up --build

stop: ## Stop all services
	@echo "$(YELLOW)Stopping $(PROJECT_NAME) services...$(NC)"
	docker compose -f $(COMPOSE_FILE) stop
	@echo "$(GREEN)Services stopped successfully!$(NC)"

restart: ## Restart all services with rebuild
	@echo "$(YELLOW)Restarting $(PROJECT_NAME) services with rebuild...$(NC)"
	docker compose -f $(COMPOSE_FILE) down
	docker compose -f $(COMPOSE_FILE) up -d --build
	@echo "$(GREEN)Services restarted successfully!$(NC)"

# Logs commands
logs: ## Show logs from all services
	docker compose -f $(COMPOSE_FILE) logs -f

logs-backend: ## Show logs from backend service only
	docker compose -f $(COMPOSE_FILE) logs -f backend

logs-frontend: ## Show logs from frontend service only
	docker compose -f $(COMPOSE_FILE) logs -f frontend

# Status and monitoring
status: ## Show status of all services
	@echo "$(YELLOW)$(PROJECT_NAME) Services Status:$(NC)"
	docker compose -f $(COMPOSE_FILE) ps

# Shell access
shell-backend: ## Access backend container shell
	docker compose -f $(COMPOSE_FILE) exec backend sh

shell-frontend: ## Access frontend container shell
	docker compose -f $(COMPOSE_FILE) exec frontend sh

# Database operations
db-backup: ## Backup database to ./backups/
	@mkdir -p backups
	@echo "$(YELLOW)Creating database backup...$(NC)"
	docker compose -f $(COMPOSE_FILE) exec db sqlite3 /data/database.sqlite ".backup /data/backup.db"
	docker cp $$(docker compose -f $(COMPOSE_FILE) ps -q db):/data/backup.db ./backups/database_$$(date +%Y%m%d_%H%M%S).db
	@echo "$(GREEN)Database backup created in ./backups/$(NC)"

# Cleanup commands
down: ## Stop and remove containers, networks
	@echo "$(YELLOW)Taking down $(PROJECT_NAME) services...$(NC)"
	docker compose -f $(COMPOSE_FILE) down
	@echo "$(GREEN)Services taken down successfully!$(NC)"

clean: ## Stop and remove containers, networks, and volumes
	@echo "$(YELLOW)Cleaning up $(PROJECT_NAME) (containers, networks, volumes)...$(NC)"
	docker compose -f $(COMPOSE_FILE) down -v
	@echo "$(GREEN)Cleanup completed!$(NC)"

# Build commands
build: ## Build all services without starting
	@echo "$(YELLOW)Building $(PROJECT_NAME) services...$(NC)"
	docker compose -f $(COMPOSE_FILE) build

build-no-cache: ## Build all services without cache
	@echo "$(YELLOW)Building $(PROJECT_NAME) services (no cache)...$(NC)"
	docker compose -f $(COMPOSE_FILE) build --no-cache

# TypeScript helpers
type-check: ## Check TypeScript types in frontend
	docker compose -f $(COMPOSE_FILE) exec frontend npm run type-check

npm-frontend: ## Run npm command in frontend (usage: make npm-frontend CMD="install package-name")
	@if [ -z "$(CMD)" ]; then echo "$(RED)Usage: make npm-frontend CMD=\"install package-name\"$(NC)"; exit 1; fi
	docker compose -f $(COMPOSE_FILE) exec frontend npm $(CMD)

npm-backend: ## Run npm command in backend (usage: make npm-backend CMD="install package-name")
	@if [ -z "$(CMD)" ]; then echo "$(RED)Usage: make npm-backend CMD=\"install package-name\"$(NC)"; exit 1; fi
	docker compose -f $(COMPOSE_FILE) exec backend npm $(CMD)

.PHONY: help start dev stop restart logs logs-backend logs-frontend status shell-backend shell-frontend \
	db-backup down clean build build-no-cache type-check npm-frontend npm-backend