.PHONY: help up down restart logs install clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

up: ## Start all Docker containers
	docker compose up -d

down: ## Stop all Docker containers
	docker compose down

restart: ## Restart all Docker containers
	docker compose restart

logs: ## Show logs from all containers
	docker compose logs -f

install: ## Install dependencies and set up the project
	@echo "================================================"
	@echo "  🎵 Melody Ninja - Setup Starting..."
	@echo "================================================"
	@echo ""
	@echo "⚙️  Step 1: Checking Docker..."
	@command -v docker >/dev/null 2>&1 || { echo "❌ Docker not found. Please install Docker first."; exit 1; }
	@docker compose version >/dev/null 2>&1 || { echo "❌ Docker Compose not found. Please update Docker."; exit 1; }
	@echo "✅ Docker is ready"
	@echo ""
	@echo "⚙️  Step 2: Setting up environment files..."
	@cp .env.example .env 2>/dev/null || echo "  → .env already exists"
	@cp backend/.env.example backend/.env 2>/dev/null || echo "  → backend/.env already exists"
	@cp frontend/.env.example frontend/.env 2>/dev/null || echo "  → frontend/.env already exists"
	@echo "✅ Environment files ready"
	@echo ""
	@echo "⚙️  Step 3: Starting MySQL and Redis..."
	@docker compose up -d mysql redis
	@echo "✅ Database services starting"
	@echo ""
	@echo "⚙️  Step 4: Waiting for MySQL to be ready..."
	@until docker compose exec mysql mysqladmin ping -h localhost --silent 2>/dev/null; do \
		echo "  → Waiting for MySQL..."; \
		sleep 3; \
	done
	@echo "✅ MySQL is ready"
	@echo ""
	@echo "⚙️  Step 5: Installing backend dependencies..."
	@docker compose run --rm php composer install --no-interaction --prefer-dist
	@echo "✅ Backend dependencies installed"
	@echo ""
	@echo "⚙️  Step 6: Generating application key..."
	@docker compose run --rm php php artisan key:generate --force
	@echo "✅ Application key generated"
	@echo ""
	@echo "⚙️  Step 7: Running database migrations..."
	@docker compose run --rm php php artisan migrate --force
	@echo "✅ Database migrated"
	@echo ""
	@echo "⚙️  Step 8: Installing frontend dependencies..."
	@docker compose run --rm frontend npm install
	@echo "✅ Frontend dependencies installed"
	@echo ""
	@echo "⚙️  Step 9: Starting all services..."
	@docker compose up -d
	@echo "✅ All services running"
	@echo ""
	@echo "================================================"
	@echo "  ✅ Setup Complete!"
	@echo "================================================"
	@echo ""
	@echo "🌐 Access the application:"
	@echo "   Frontend: http://localhost:5173"
	@echo "   Backend:  http://localhost/api/health"
	@echo ""
	@echo "📝 Useful commands:"
	@echo "   make logs      - View all logs"
	@echo "   make down      - Stop services"
	@echo "   make restart   - Restart services"
	@echo ""

clean: ## Remove all containers, volumes, and generated files
	docker compose down -v
	rm -rf backend/vendor backend/.env
	rm -rf frontend/node_modules frontend/.env
	rm -f .env

backend-shell: ## Access backend container shell
	docker compose exec php sh

frontend-shell: ## Access frontend container shell
	docker compose exec frontend sh

db-shell: ## Access MySQL shell
	docker compose exec mysql mysql -u melody_user -pmelody_pass melody_ninja

redis-cli: ## Access Redis CLI
	docker compose exec redis redis-cli

migrate: ## Run database migrations
	docker compose run --rm php php artisan migrate

migrate-fresh: ## Drop all tables and re-run migrations
	docker compose run --rm php php artisan migrate:fresh

seed: ## Run database seeders
	docker compose run --rm php php artisan db:seed

test: ## Run backend tests
	docker compose run --rm php php artisan test

build: ## Rebuild all Docker images
	docker compose build --no-cache

translations: ## View all translations
	docker compose exec php php artisan translations:view

translations-uk: ## View Ukrainian translations only
	docker compose exec php php artisan translations:view --locale=uk

translations-en: ## View English translations only
	docker compose exec php php artisan translations:view --locale=en

translations-edit: ## Edit translations interactively
	docker compose exec php php artisan translations:edit
