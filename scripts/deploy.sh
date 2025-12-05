#!/bin/bash
set -e

# ========================================
# PUZO.FUN - Automated Deployment Script
# ========================================
# Run this script to deploy/update the application
# Usage: bash scripts/deploy.sh

DOMAIN="puzo.fun"
PROJECT_DIR="/var/www/puzo.fun"
COMPOSE_FILE="docker-compose.prod.yml"
BRANCH="${1:-master}"

echo "========================================="
echo "🚀 PUZO.FUN Deployment"
echo "========================================="
echo "Branch: $BRANCH"
echo "Domain: $DOMAIN"
echo ""

# Check if running in project directory
if [ ! -f "$COMPOSE_FILE" ]; then
    echo "❌ Error: $COMPOSE_FILE not found!"
    echo "Please run this script from the project root directory."
    exit 1
fi

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo "❌ Error: backend/.env not found!"
    echo "Please create it from .env.production:"
    echo "  cp .env.production backend/.env"
    echo "  nano backend/.env  # Edit with your credentials"
    exit 1
fi

echo "📥 Step 1/6: Pulling latest code from git..."
git fetch origin
git checkout $BRANCH
git pull origin $BRANCH

echo "🗄️  Step 2/6: Ensuring database is running..."
docker-compose -f $COMPOSE_FILE up -d mysql redis
sleep 5

echo "🏗️  Step 3/6: Building Docker images (with cache)..."
docker-compose -f $COMPOSE_FILE build php queue scheduler

echo "📦 Step 4/6: Installing backend dependencies..."
docker-compose -f $COMPOSE_FILE run --rm php composer install --no-dev --optimize-autoloader --no-interaction

echo "🗄️  Step 5/6: Running database migrations..."
docker-compose -f $COMPOSE_FILE run --rm php php artisan migrate --force

echo "🎨 Step 6/6: Building frontend..."
cd frontend
npm install
export NODE_OPTIONS="--max-old-space-size=512"
export NODE_ENV=production
npm run build
cd ..

# Inject version into nginx config if available
if [ -f frontend/dist/.version ]; then
    BUILD_VERSION=$(cat frontend/dist/.version)
    sed -i "s/BUILD_VERSION/$BUILD_VERSION/g" docker/nginx/nginx.prod.conf
fi

echo "🚀 Restarting services..."
docker-compose -f $COMPOSE_FILE up -d --no-deps php queue scheduler nginx
docker-compose -f $COMPOSE_FILE exec -T nginx nginx -s reload 2>/dev/null || true
sleep 3

echo ""
echo "========================================="
echo "✅ Deployment complete!"
echo "========================================="
echo "🌐 https://$DOMAIN"

# Quick health check
if curl -sSf -k https://$DOMAIN/api/v1/health > /dev/null 2>&1; then
    echo "✅ Site is accessible!"
fi
