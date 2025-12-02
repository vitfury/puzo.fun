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

echo "📥 Step 1/10: Pulling latest code from git..."
git fetch origin
git checkout $BRANCH
git pull origin $BRANCH

echo "🛑 Step 2/10: Stopping running containers..."
docker-compose -f $COMPOSE_FILE down || true

echo "🏗️  Step 3/10: Building Docker images..."
docker-compose -f $COMPOSE_FILE build --no-cache

echo "📦 Step 4/10: Installing backend dependencies..."
docker-compose -f $COMPOSE_FILE run --rm php composer install --no-dev --optimize-autoloader

echo "🔑 Step 5/10: Generating application key..."
docker-compose -f $COMPOSE_FILE run --rm php php artisan key:generate --force

echo "🗄️  Step 6/10: Running database migrations..."
docker-compose -f $COMPOSE_FILE up -d mysql redis
echo "Waiting for MySQL to be ready..."
sleep 10
docker-compose -f $COMPOSE_FILE run --rm php php artisan migrate --force

echo "🌱 Step 7/10: Seeding database (if needed)..."
docker-compose -f $COMPOSE_FILE run --rm php php artisan db:seed --force --class=ComprehensiveActivitySeeder || true
docker-compose -f $COMPOSE_FILE run --rm php php artisan db:seed --force --class=GameSettingsSeeder || true
docker-compose -f $COMPOSE_FILE run --rm php php artisan db:seed --force --class=EquipmentSeeder || true

echo "🎨 Step 8/10: Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "🔐 Step 9/10: Setting up SSL certificate..."
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    echo "Getting SSL certificate from Let's Encrypt..."
    docker-compose -f $COMPOSE_FILE stop nginx || true
    certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN --email admin@$DOMAIN --agree-tos --no-eff-email
    echo "✅ SSL certificate obtained"
else
    echo "ℹ️  SSL certificate already exists"
fi

echo "🚀 Step 10/10: Starting all services..."
docker-compose -f $COMPOSE_FILE up -d

echo "🧹 Cleaning up old Docker images..."
docker system prune -f

echo "⏳ Waiting for services to start..."
sleep 5

echo ""
echo "========================================="
echo "✅ Deployment complete!"
echo "========================================="
echo ""
echo "🌐 Your application is now running at:"
echo "   https://$DOMAIN"
echo ""
echo "📊 Check status:"
echo "   docker-compose -f $COMPOSE_FILE ps"
echo ""
echo "📝 View logs:"
echo "   docker-compose -f $COMPOSE_FILE logs -f"
echo ""
echo "🔄 Container management:"
echo "   Restart all: docker-compose -f $COMPOSE_FILE restart"
echo "   Stop all: docker-compose -f $COMPOSE_FILE down"
echo "   Start all: docker-compose -f $COMPOSE_FILE up -d"
echo ""

# Test if site is accessible
echo "🧪 Testing site accessibility..."
sleep 3
if curl -sSf -k https://$DOMAIN/api/v1/health > /dev/null 2>&1; then
    echo "✅ Site is accessible!"
else
    echo "⚠️  Warning: Site may not be accessible yet. Check logs:"
    echo "   docker-compose -f $COMPOSE_FILE logs nginx php"
fi

echo ""
echo "🎉 Deployment finished successfully!"
