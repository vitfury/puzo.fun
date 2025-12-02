#!/bin/bash
set -e

# ========================================
# PUZO.FUN - Server Initial Setup Script
# ========================================
# Run this script ONCE on a fresh DigitalOcean Droplet
# Usage: bash setup-server.sh

DOMAIN="puzo.fun"
EMAIL="admin@puzo.fun"  # Change this to your email
PROJECT_DIR="/var/www/puzo.fun"
SWAP_SIZE="2G"

echo "========================================="
echo "🚀 PUZO.FUN Server Setup"
echo "========================================="
echo "Domain: $DOMAIN"
echo "Project directory: $PROJECT_DIR"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run as root (use: sudo bash setup-server.sh)"
    exit 1
fi

echo "📦 Step 1/8: Updating system packages..."
apt update && apt upgrade -y

echo "🔧 Step 2/8: Installing required packages..."
apt install -y \
    curl \
    git \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    ufw \
    fail2ban

echo "🐳 Step 3/8: Installing Docker..."
# Remove old Docker versions
apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# Add Docker's official GPG key
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Start Docker
systemctl enable docker
systemctl start docker

echo "✅ Docker installed: $(docker --version)"

echo "📦 Step 4/8: Installing Docker Compose standalone..."
DOCKER_COMPOSE_VERSION="2.24.5"
curl -L "https://github.com/docker/compose/releases/download/v${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
echo "✅ Docker Compose installed: $(docker-compose --version)"

echo "💾 Step 5/8: Creating swap file ($SWAP_SIZE)..."
if [ ! -f /swapfile ]; then
    fallocate -l $SWAP_SIZE /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    echo "✅ Swap created and enabled"
else
    echo "ℹ️  Swap file already exists"
fi

echo "🔒 Step 6/8: Configuring firewall (UFW)..."
ufw --force disable
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
echo "✅ Firewall configured"

echo "🛡️  Step 7/8: Configuring Fail2Ban..."
systemctl enable fail2ban
systemctl start fail2ban
echo "✅ Fail2Ban enabled"

echo "🔐 Step 8/8: Installing Certbot for SSL..."
apt install -y certbot
echo "✅ Certbot installed"

echo ""
echo "========================================="
echo "✅ Server setup complete!"
echo "========================================="
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Clone your repository:"
echo "   cd /var/www"
echo "   git clone https://github.com/YOUR_USERNAME/puzo.fun.git"
echo "   cd puzo.fun"
echo ""
echo "2. Set up environment:"
echo "   cp .env.production backend/.env"
echo "   nano backend/.env  # Edit with secure passwords"
echo ""
echo "3. Run deployment script:"
echo "   bash scripts/deploy.sh"
echo ""
echo "🌐 Make sure your DNS A records point to this server IP:"
echo "   @ (root) -> $(curl -s ifconfig.me)"
echo "   www -> $(curl -s ifconfig.me)"
echo ""
