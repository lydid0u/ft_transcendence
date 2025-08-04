COMPOSE_FILE = docker-compose.yaml
PROJECT_NAME = fastify-vite-stack

YELLOW = \033[1;33m
GREEN = \033[1;32m
RED = \033[1;31m
BLUE = \033[1;34m
NC = \033[0m

start:
	@echo "$(YELLOW)Starting $(PROJECT_NAME) services...$(NC)"
	docker compose -f $(COMPOSE_FILE) up -d --build
	@echo "$(GREEN)Services started successfully!$(NC)"
	@echo "$(BLUE)Frontend: http://localhost:5173$(NC)"
	@echo "$(BLUE)Backend:  http://localhost:3000$(NC)"

restart:
	@echo "$(YELLOW)Restarting $(PROJECT_NAME) services with rebuild...$(NC)"
	docker compose -f $(COMPOSE_FILE) down
	docker compose -f $(COMPOSE_FILE) up -d --build
	@echo "$(GREEN)Services restarted successfully!$(NC)"

logs: 
	docker compose -f $(COMPOSE_FILE) logs -f

logs-backend: 
	docker compose -f $(COMPOSE_FILE) logs -f backend

clean:
	@echo "$(YELLOW)Cleaning up $(PROJECT_NAME) (containers, networks, volumes)...$(NC)"
	docker compose -f $(COMPOSE_FILE) down -v
	@echo "$(GREEN)Cleanup completed!$(NC)"

.PHONY: help start stop restart logs logs-backend clean