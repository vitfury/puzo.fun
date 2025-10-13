.PHONY: help init up down restart build logs shell-app shell-node psql redis clean

# Кольори для виводу
GREEN  := \033[0;32m
YELLOW := \033[0;33m
NC     := \033[0m # No Color

help: ## Показати це повідомлення
	@echo "$(GREEN)Melody Ninja - Доступні команди:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'

init: ## Ініціалізація проєкту (перший запуск)
	@echo "$(GREEN)Копіювання .env файлів...$(NC)"
	@cp -n .env.example .env 2>/dev/null || true
	@cp -n backend/.env.example backend/.env 2>/dev/null || true
	@cp -n frontend/.env.example frontend/.env 2>/dev/null || true
	@echo "$(GREEN)Запуск Docker контейнерів...$(NC)"
	@docker-compose up -d --build
	@echo "$(GREEN)Очікування запуску PostgreSQL...$(NC)"
	@sleep 5
	@echo "$(GREEN)Запуск міграцій...$(NC)"
	@docker-compose exec app php artisan migrate
	@echo "$(GREEN)Створення символічного посилання для storage...$(NC)"
	@docker-compose exec app php artisan storage:link
	@echo "$(GREEN)✓ Проєкт ініціалізовано!$(NC)"
	@echo "Backend API: http://localhost/api"
	@echo "Frontend: http://localhost:5173"

up: ## Запустити всі сервіси
	@echo "$(GREEN)Запуск Docker контейнерів...$(NC)"
	@docker-compose up -d

down: ## Зупинити всі сервіси
	@echo "$(YELLOW)Зупинка Docker контейнерів...$(NC)"
	@docker-compose down

restart: ## Перезапустити всі сервіси
	@echo "$(YELLOW)Перезапуск Docker контейнерів...$(NC)"
	@docker-compose restart

build: ## Побудувати Docker образи
	@echo "$(GREEN)Побудова Docker образів...$(NC)"
	@docker-compose build

logs: ## Показати логи всіх сервісів
	@docker-compose logs -f

logs-app: ## Показати логи Laravel
	@docker-compose logs -f app

logs-node: ## Показати логи React
	@docker-compose logs -f node

logs-nginx: ## Показати логи Nginx
	@docker-compose logs -f nginx

shell-app: ## Увійти в контейнер Laravel
	@docker-compose exec app bash

shell-node: ## Увійти в контейнер Node
	@docker-compose exec node sh

psql: ## Підключитися до PostgreSQL
	@docker-compose exec postgres psql -U melody_ninja -d melody_ninja

redis: ## Підключитися до Redis CLI
	@docker-compose exec redis redis-cli -a changeme_secure_redis_password

migrate: ## Запустити міграції
	@echo "$(GREEN)Запуск міграцій...$(NC)"
	@docker-compose exec app php artisan migrate

migrate-fresh: ## Пересоздати базу даних з міграціями
	@echo "$(YELLOW)Пересоздання бази даних...$(NC)"
	@docker-compose exec app php artisan migrate:fresh

seed: ## Запустити seeders
	@echo "$(GREEN)Запуск seeders...$(NC)"
	@docker-compose exec app php artisan db:seed

migrate-seed: ## Міграції + seeders
	@make migrate
	@make seed

fresh-seed: ## Пересоздати БД + seeders
	@make migrate-fresh
	@make seed

cache-clear: ## Очистити кеш Laravel
	@echo "$(YELLOW)Очистка кешу...$(NC)"
	@docker-compose exec app php artisan cache:clear
	@docker-compose exec app php artisan config:clear
	@docker-compose exec app php artisan route:clear
	@docker-compose exec app php artisan view:clear

composer-install: ## Встановити Composer залежності
	@echo "$(GREEN)Встановлення Composer залежностей...$(NC)"
	@docker-compose exec app composer install

npm-install: ## Встановити NPM залежності
	@echo "$(GREEN)Встановлення NPM залежностей...$(NC)"
	@docker-compose exec node npm install

npm-build: ## Побудувати frontend для production
	@echo "$(GREEN)Побудова frontend...$(NC)"
	@docker-compose exec node npm run build

test: ## Запустити тести Laravel
	@echo "$(GREEN)Запуск тестів...$(NC)"
	@docker-compose exec app php artisan test

test-coverage: ## Запустити тести з coverage
	@docker-compose exec app php artisan test --coverage

artisan: ## Запустити artisan команду (використання: make artisan cmd="route:list")
	@docker-compose exec app php artisan $(cmd)

tinker: ## Відкрити Laravel Tinker
	@docker-compose exec app php artisan tinker

queue-work: ## Запустити queue worker вручну
	@docker-compose exec app php artisan queue:work

horizon: ## Запустити Laravel Horizon
	@docker-compose exec app php artisan horizon

backup-db: ## Створити бекап бази даних
	@echo "$(GREEN)Створення бекапу...$(NC)"
	@docker-compose exec postgres pg_dump -U melody_ninja melody_ninja > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✓ Бекап створено!$(NC)"

restore-db: ## Відновити базу з бекапу (використання: make restore-db file=backup.sql)
	@echo "$(YELLOW)Відновлення з бекапу...$(NC)"
	@docker-compose exec -T postgres psql -U melody_ninja melody_ninja < $(file)
	@echo "$(GREEN)✓ База відновлена!$(NC)"

clean: ## Очистити всі дані (volumes, containers)
	@echo "$(YELLOW)Видалення контейнерів та volumes...$(NC)"
	@docker-compose down -v
	@echo "$(GREEN)✓ Очищено!$(NC)"

stats: ## Показати статистику контейнерів
	@docker-compose stats

ps: ## Показати запущені контейнери
	@docker-compose ps

install-telescope: ## Встановити Laravel Telescope
	@docker-compose exec app composer require laravel/telescope --dev
	@docker-compose exec app php artisan telescope:install
	@docker-compose exec app php artisan migrate
	@echo "$(GREEN)✓ Telescope встановлено! Доступ: http://localhost/telescope$(NC)"

install-horizon: ## Встановити Laravel Horizon
	@docker-compose exec app composer require laravel/horizon
	@docker-compose exec app php artisan horizon:install
	@echo "$(GREEN)✓ Horizon встановлено! Запустіть: make horizon$(NC)"

install-sanctum: ## Встановити Laravel Sanctum
	@docker-compose exec app php artisan install:api
	@echo "$(GREEN)✓ Sanctum встановлено!$(NC)"
