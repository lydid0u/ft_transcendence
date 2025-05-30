# Makefile for Docker Compose Stack (Fastify + Vite + SQLite)
# =============================================================

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
.PHONY: help
help: ## Show this help message
	@echo "$(YELLOW)Available commands:$(NC)"
	@echo "$(BLUE)==================$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

# Development commands
.PHONY: start
start: ## Start all services in detached mode
	@echo "$(YELLOW)Starting $(PROJECT_NAME) services...$(NC)"
	docker-compose -f $(COMPOSE_FILE) up -d --build
	@echo "$(GREEN)Services started successfully!$(NC)"
	@echo "$(BLUE)Frontend: http://localhost:5173$(NC)"
	@echo "$(BLUE)Backend:  http://localhost:3000$(NC)"

.PHONY: start-logs
start-logs: ## Start all services and show logs
	@echo "$(YELLOW)Starting $(PROJECT_NAME) services with logs...$(NC)"
	docker-compose -f $(COMPOSE_FILE) up --build

.PHONY: stop
stop: ## Stop all services
	@echo "$(YELLOW)Stopping $(PROJECT_NAME) services...$(NC)"
	docker-compose -f $(COMPOSE_FILE) stop
	@echo "$(GREEN)Services stopped successfully!$(NC)"

.PHONY: restart
restart: ## Restart all services
	@echo "$(YELLOW)Restarting $(PROJECT_NAME) services...$(NC)"
	docker-compose -f $(COMPOSE_FILE) restart
	@echo "$(GREEN)Services restarted successfully!$(NC)"

.PHONY: restart-build
restart-build: ## Restart all services with rebuild
	@echo "$(YELLOW)Restarting $(PROJECT_NAME) services with rebuild...$(NC)"
	docker-compose -f $(COMPOSE_FILE) down
	docker-compose -f $(COMPOSE_FILE) up -d --build
	@echo "$(GREEN)Services restarted with rebuild successfully!$(NC)"

# Logs commands
.PHONY: logs
logs: ## Show logs from all services
	docker-compose -f $(COMPOSE_FILE) logs -f

.PHONY: logs-backend
logs-backend: ## Show logs from backend service only
	docker-compose -f $(COMPOSE_FILE) logs -f backend

.PHONY: logs-frontend
logs-frontend: ## Show logs from frontend service only
	docker-compose -f $(COMPOSE_FILE) logs -f frontend

.PHONY: logs-db
logs-db: ## Show logs from database service only
	docker-compose -f $(COMPOSE_FILE) logs -f db

# Service management
.PHONY: backend
backend: ## Start only backend service
	@echo "$(YELLOW)Starting backend service...$(NC)"
	docker-compose -f $(COMPOSE_FILE) up -d --build backend db

.PHONY: frontend
frontend: ## Start only frontend service
	@echo "$(YELLOW)Starting frontend service...$(NC)"
	docker-compose -f $(COMPOSE_FILE) up -d --build frontend

.PHONY: db
db: ## Start only database service
	@echo "$(YELLOW)Starting database service...$(NC)"
	docker-compose -f $(COMPOSE_FILE) up -d --build db

# Status and monitoring
.PHONY: status
status: ## Show status of all services
	@echo "$(YELLOW)$(PROJECT_NAME) Services Status:$(NC)"
	docker-compose -f $(COMPOSE_FILE) ps

.PHONY: ps
ps: status ## Alias for status

.PHONY: top
top: ## Show running processes in containers
	docker-compose -f $(COMPOSE_FILE) top

# Shell access
.PHONY: shell-backend
shell-backend: ## Access backend container shell
	docker-compose -f $(COMPOSE_FILE) exec backend sh

.PHONY: shell-frontend
shell-frontend: ## Access frontend container shell
	docker-compose -f $(COMPOSE_FILE) exec frontend sh

.PHONY: shell-db
shell-db: ## Access database container shell
	docker-compose -f $(COMPOSE_FILE) exec db sh

# Database operations
.PHONY: db-shell
db-shell: ## Access SQLite database shell
	docker-compose -f $(COMPOSE_FILE) exec db sqlite3 /data/database.sqlite

.PHONY: db-backup
db-backup: ## Backup database to ./backups/
	@mkdir -p backups
	@echo "$(YELLOW)Creating database backup...$(NC)"
	docker-compose -f $(COMPOSE_FILE) exec db sqlite3 /data/database.sqlite ".backup /data/backup.db"
	docker cp $$(docker-compose -f $(COMPOSE_FILE) ps -q db):/data/backup.db ./backups/database_$$(date +%Y%m%d_%H%M%S).db
	@echo "$(GREEN)Database backup created in ./backups/$(NC)"

.PHONY: db-restore
db-restore: ## Restore database from backup (usage: make db-restore BACKUP=backup_file.db)
	@if [ -z "$(BACKUP)" ]; then echo "$(RED)Usage: make db-restore BACKUP=backup_file.db$(NC)"; exit 1; fi
	@if [ ! -f "./backups/$(BACKUP)" ]; then echo "$(RED)Backup file not found: ./backups/$(BACKUP)$(NC)"; exit 1; fi
	@echo "$(YELLOW)Restoring database from $(BACKUP)...$(NC)"
	docker cp ./backups/$(BACKUP) $$(docker-compose -f $(COMPOSE_FILE) ps -q db):/data/restore.db
	docker-compose -f $(COMPOSE_FILE) exec db sh -c "cp /data/restore.db /data/database.sqlite"
	@echo "$(GREEN)Database restored successfully!$(NC)"

# Cleanup commands
.PHONY: down
down: ## Stop and remove containers, networks
	@echo "$(YELLOW)Taking down $(PROJECT_NAME) services...$(NC)"
	docker-compose -f $(COMPOSE_FILE) down
	@echo "$(GREEN)Services taken down successfully!$(NC)"

.PHONY: clean
clean: ## Stop and remove containers, networks, and volumes
	@echo "$(YELLOW)Cleaning up $(PROJECT_NAME) (containers, networks, volumes)...$(NC)"
	docker-compose -f $(COMPOSE_FILE) down -v
	@echo "$(GREEN)Cleanup completed!$(NC)"

.PHONY: clean-all
clean-all: ## Stop and remove everything including images
	@echo "$(RED)WARNING: This will remove all containers, networks, volumes AND images!$(NC)"
	@echo "$(YELLOW)Press Ctrl+C to cancel, or Enter to continue...$(NC)"
	@read
	docker-compose -f $(COMPOSE_FILE) down -v --rmi all
	@echo "$(GREEN)Complete cleanup finished!$(NC)"

.PHONY: prune
prune: ## Remove unused Docker resources
	@echo "$(YELLOW)Pruning unused Docker resources...$(NC)"
	docker system prune -f
	docker volume prune -f
	@echo "$(GREEN)Docker resources pruned!$(NC)"

# Build commands
.PHONY: build
build: ## Build all services without starting
	@echo "$(YELLOW)Building $(PROJECT_NAME) services...$(NC)"
	docker-compose -f $(COMPOSE_FILE) build

.PHONY: build-no-cache
build-no-cache: ## Build all services without cache
	@echo "$(YELLOW)Building $(PROJECT_NAME) services (no cache)...$(NC)"
	docker-compose -f $(COMPOSE_FILE) build --no-cache

.PHONY: build-backend
build-backend: ## Build only backend service
	docker-compose -f $(COMPOSE_FILE) build backend

.PHONY: build-frontend
build-frontend: ## Build only frontend service
	docker-compose -f $(COMPOSE_FILE) build frontend

# Development helpers
.PHONY: dev
dev: start-logs ## Start development environment with logs

.PHONY: dev-detached
dev-detached: start ## Start development environment in background

.PHONY: install-backend
install-backend: ## Install backend dependencies
	docker-compose -f $(COMPOSE_FILE) exec backend npm install

.PHONY: install-frontend
install-frontend: ## Install frontend dependencies
	docker-compose -f $(COMPOSE_FILE) exec frontend npm install

.PHONY: npm-backend
npm-backend: ## Run npm command in backend (usage: make npm-backend CMD="install package-name")
	@if [ -z "$(CMD)" ]; then echo "$(RED)Usage: make npm-backend CMD=\"install package-name\"$(NC)"; exit 1; fi
	docker-compose -f $(COMPOSE_FILE) exec backend npm $(CMD)

.PHONY: npm-frontend
npm-frontend: ## Run npm command in frontend (usage: make npm-frontend CMD="install package-name")
	@if [ -z "$(CMD)" ]; then echo "$(RED)Usage: make npm-frontend CMD=\"install package-name\"$(NC)"; exit 1; fi
	docker-compose -f $(COMPOSE_FILE) exec frontend npm $(CMD)

# Quick shortcuts
.PHONY: up
up: start ## Alias for start

.PHONY: quit
quit: down ## Alias for down

.PHONY: delete
delete: clean ## Alias for clean

.PHONY: nuke
nuke: clean-all ## Alias for clean-all (nuclear option)

# Health check
.PHONY: health
health: ## Check if services are responding
	@echo "$(YELLOW)Checking service health...$(NC)"
	@echo "$(BLUE)Backend (port 3000):$(NC)"
	@curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 && echo " ✓" || echo " ✗"
	@echo "$(BLUE)Frontend (port 5173):$(NC)"
	@curl -s -o /dev/null -w "%{http_code}" http://localhost:5173 && echo " ✓" || echo " ✗"