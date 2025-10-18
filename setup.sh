#!/bin/bash

set -e

echo "================================================"
echo "  Melody Ninja - Docker Environment Setup"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker Desktop first."
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please update Docker Desktop."
    exit 1
fi

echo "${YELLOW}Step 1:${NC} Setting up environment files..."
cp -n .env.example .env 2>/dev/null || echo "  → .env already exists"
cp -n backend/.env.example backend/.env 2>/dev/null || echo "  → backend/.env already exists"
cp -n frontend/.env.example frontend/.env 2>/dev/null || echo "  → frontend/.env already exists"
echo "${GREEN}✓${NC} Environment files ready"
echo ""

echo "${YELLOW}Step 2:${NC} Starting MySQL and Redis..."
docker compose up -d mysql redis
echo "${GREEN}✓${NC} Database services starting"
echo ""

echo "${YELLOW}Step 3:${NC} Waiting for MySQL to be ready..."
until docker compose exec mysql mysqladmin ping -h localhost --silent 2>/dev/null; do
    echo "  → Waiting for MySQL..."
    sleep 3
done
echo "${GREEN}✓${NC} MySQL is ready"
echo ""

echo "${YELLOW}Step 4:${NC} Installing backend dependencies..."
docker compose run --rm php composer install --no-interaction --prefer-dist
echo "${GREEN}✓${NC} Backend dependencies installed"
echo ""

echo "${YELLOW}Step 5:${NC} Generating application key..."
docker compose run --rm php php artisan key:generate --force
echo "${GREEN}✓${NC} Application key generated"
echo ""

echo "${YELLOW}Step 6:${NC} Running database migrations..."
docker compose run --rm php php artisan migrate --force
echo "${GREEN}✓${NC} Database migrated"
echo ""

echo "${YELLOW}Step 7:${NC} Installing frontend dependencies..."
docker compose run --rm frontend npm install
echo "${GREEN}✓${NC} Frontend dependencies installed"
echo ""

echo "${YELLOW}Step 8:${NC} Starting all services..."
docker compose up -d
echo "${GREEN}✓${NC} All services running"
echo ""

echo "================================================"
echo "${GREEN}✓ Setup Complete!${NC}"
echo "================================================"
echo ""
echo "Access the application:"
echo "  Frontend: ${GREEN}http://localhost:5173${NC}"
echo "  Backend:  ${GREEN}http://localhost/api${NC}"
echo ""
echo "Useful commands:"
echo "  docker compose logs -f        # View logs"
echo "  docker compose down           # Stop services"
echo "  docker compose restart        # Restart services"
echo ""
echo "Or use Make commands:"
echo "  make logs                     # View logs"
echo "  make down                     # Stop services"
echo "  make restart                  # Restart services"
echo ""
