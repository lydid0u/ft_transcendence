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
help: ## Show this help message
	@echo "$(YELLOW)Available commands:$(NC)"
	@echo "$(BLUE)==================$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

# Development commands
start: ## Start all services in detached mode
	@echo "$(YELLOW)Starting $(PROJECT_NAME) services...$(NC)"
	docker-compose -f $(COMPOSE_FILE) up -d --build
	@echo "$(GREEN)Services started successfully!$(NC)"
	@echo "$(BLUE)Frontend: http://localhost:5173$(NC)"
	@echo "$(BLUE)Backend:  http://localhost:3000$(NC)"

start-logs: ## Start all services and show logs
	@echo "$(YELLOW)Starting $(PROJECT_NAME) services with logs...$(NC)"
	docker-compose -f $(COMPOSE_FILE) up --build

stop: ## Stop all services
	@echo "$(YELLOW)Stopping $(PROJECT_NAME) services...$(NC)"
	docker-compose -f $(COMPOSE_FILE) stop
	@echo "$(GREEN)Services stopped successfully!$(NC)"

restart: ## Restart all services
	@echo "$(YELLOW)Restarting $(PROJECT_NAME) services...$(NC)"
	docker-compose -f $(COMPOSE_FILE) restart
	@echo "$(GREEN)Services restarted successfully!$(NC)"

restart-build: ## Restart all services with rebuild
	@echo "$(YELLOW)Restarting $(PROJECT_NAME) services with rebuild...$(NC)"
	docker-compose -f $(COMPOSE_FILE) down
	docker-compose -f $(COMPOSE_FILE) up -d --build
	@echo "$(GREEN)Services restarted with rebuild successfully!$(NC)"

# Logs commands
logs: ## Show logs from all services
	docker-compose -f $(COMPOSE_FILE) logs -f

logs-backend: ## Show logs from backend service only
	docker-compose -f $(COMPOSE_FILE) logs -f backend

logs-frontend: ## Show logs from frontend service only
	docker-compose -f $(COMPOSE_FILE) logs -f frontend

logs-db: ## Show logs from database service only
	docker-compose -f $(COMPOSE_FILE) logs -f db

# Service management
backend: ## Start only backend service
	@echo "$(YELLOW)Starting backend service...$(NC)"
	docker-compose -f $(COMPOSE_FILE) up -d --build backend db

frontend: ## Start only frontend service
	@echo "$(YELLOW)Starting frontend service...$(NC)"
	docker-compose -f $(COMPOSE_FILE) up -d --build frontend

db: ## Start only database service
	@echo "$(YELLOW)Starting database service...$(NC)"
	docker-compose -f $(COMPOSE_FILE) up -d --build db

# Status and monitoring
status: ## Show status of all services
	@echo "$(YELLOW)$(PROJECT_NAME) Services Status:$(NC)"
	docker-compose -f $(COMPOSE_FILE) ps

top: ## Show running processes in containers
	docker-compose -f $(COMPOSE_FILE) top

# Shell access
shell-backend: ## Access backend container shell
	docker-compose -f $(COMPOSE_FILE) exec backend sh

shell-frontend: ## Access frontend container shell
	docker-compose -f $(COMPOSE_FILE) exec frontend sh

shell-db: ## Access database container shell
	docker-compose -f $(COMPOSE_FILE) exec db sh

# Database operations
db-shell: ## Access SQLite database shell
	docker-compose -f $(COMPOSE_FILE) exec db sqlite3 /data/database.sqlite

db-backup: ## Backup database to ./backups/
	@mkdir -p backups
	@echo "$(YELLOW)Creating database backup...$(NC)"
	docker-compose -f $(COMPOSE_FILE) exec db sqlite3 /data/database.sqlite ".backup /data/backup.db"
	docker cp $$(docker-compose -f $(COMPOSE_FILE) ps -q db):/data/backup.db ./backups/database_$$(date +%Y%m%d_%H%M%S).db
	@echo "$(GREEN)Database backup created in ./backups/$(NC)"

db-restore: ## Restore database from backup (usage: make db-restore BACKUP=backup_file.db)
	@if [ -z "$(BACKUP)" ]; then echo "$(RED)Usage: make db-restore BACKUP=backup_file.db$(NC)"; exit 1; fi
	@if [ ! -f "./backups/$(BACKUP)" ]; then echo "$(RED)Backup file not found: ./backups/$(BACKUP)$(NC)"; exit 1; fi
	@echo "$(YELLOW)Restoring database from $(BACKUP)...$(NC)"
	docker cp ./backups/$(BACKUP) $$(docker-compose -f $(COMPOSE_FILE) ps -q db):/data/restore.db
	docker-compose -f $(COMPOSE_FILE) exec db sh -c "cp /data/restore.db /data/database.sqlite"
	@echo "$(GREEN)Database restored successfully!$(NC)"

# Cleanup commands
down: ## Stop and remove containers, networks
	@echo "$(YELLOW)Taking down $(PROJECT_NAME) services...$(NC)"
	docker-compose -f $(COMPOSE_FILE) down
	@echo "$(GREEN)Services taken down successfully!$(NC)"

clean: ## Stop and remove containers, networks, and volumes
	@echo "$(YELLOW)Cleaning up $(PROJECT_NAME) (containers, networks, volumes)...$(NC)"
	docker-compose -f $(COMPOSE_FILE) down -v
	@echo "$(GREEN)Cleanup completed!$(NC)"

clean-all: ## Stop and remove everything including images
	@echo "$(RED)WARNING: This will remove all containers, networks, volumes AND images!$(NC)"
	@echo "$(YELLOW)Press Ctrl+C to cancel, or Enter to continue...$(NC)"
	@read
	docker-compose -f $(COMPOSE_FILE) down -v --rmi all
	@echo "$(GREEN)Complete cleanup finished!$(NC)"

prune: ## Remove unused Docker resources
	@echo "$(YELLOW)Pruning unused Docker resources...$(NC)"
	docker system prune -f
	docker volume prune -f
	@echo "$(GREEN)Docker resources pruned!$(NC)"

# Build commands
build: ## Build all services without starting
	@echo "$(YELLOW)Building $(PROJECT_NAME) services...$(NC)"
	docker-compose -f $(COMPOSE_FILE) build

build-no-cache: ## Build all services without cache
	@echo "$(YELLOW)Building $(PROJECT_NAME) services (no cache)...$(NC)"
	docker-compose -f $(COMPOSE_FILE) build --no-cache

# Development helpers
dev: start-logs ## Start development environment with logs

npm-backend: ## Run npm command in backend (usage: make npm-backend CMD="install package-name")
	@if [ -z "$(CMD)" ]; then echo "$(RED)Usage: make npm-backend CMD=\"install package-name\"$(NC)"; exit 1; fi
	docker-compose -f $(COMPOSE_FILE) exec backend npm $(CMD)

npm-frontend: ## Run npm command in frontend (usage: make npm-frontend CMD="install package-name")
	@if [ -z "$(CMD)" ]; then echo "$(RED)Usage: make npm-frontend CMD=\"install package-name\"$(NC)"; exit 1; fi
	docker-compose -f $(COMPOSE_FILE) exec frontend npm $(CMD)

.PHONY: help start start-logs stop restart restart-build logs logs-backend logs-frontend logs-db \
	backend frontend db status top shell-backend shell-frontend shell-db db-shell db-backup db-restore \
	down clean clean-all prune build build-no-cache dev npm-backend npm-frontend