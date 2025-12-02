# 🚀 PUZO.FUN - Deployment Guide

Complete guide for deploying Puzo.Fun to DigitalOcean.

## 🤖 Recommended: GitHub Actions Auto-Deployment

**For automated deployment on every push to master**, see: **[GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md)**

This guide covers manual deployment. For CI/CD pipeline with GitHub Actions, follow the auto-deployment guide.

---

## 📋 Prerequisites

- **DigitalOcean Droplet**: Basic ($12/month, 2GB RAM, 1 CPU)
- **Domain**: puzo.fun with DNS configured
- **SSH Access**: Root or sudo user
- **Git Repository**: Code pushed to GitHub/GitLab

## 🌐 DNS Configuration

Before deployment, configure your DNS A records to point to your Droplet IP:

```
A     @      -> YOUR_DROPLET_IP
A     www    -> YOUR_DROPLET_IP
```

**Propagation time**: 5-30 minutes

## 🛠️ Step-by-Step Deployment

### 1️⃣ Initial Server Setup (Run Once)

SSH into your fresh DigitalOcean Droplet:

```bash
ssh root@YOUR_DROPLET_IP
```

Download and run the setup script:

```bash
cd /var/www
git clone https://github.com/YOUR_USERNAME/puzo.fun.git
cd puzo.fun
bash scripts/setup-server.sh
```

**This script will:**
- ✅ Update system packages
- ✅ Install Docker & Docker Compose
- ✅ Create 2GB swap file
- ✅ Configure UFW firewall (ports 22, 80, 443)
- ✅ Install Fail2Ban for security
- ✅ Install Certbot for SSL certificates

**Time**: ~5-10 minutes

---

### 2️⃣ Configure Environment Variables

Create production environment file:

```bash
cd /var/www/puzo.fun
cp .env.production backend/.env
nano backend/.env
```

**Required changes:**

```env
# Generate with: php artisan key:generate
APP_KEY=base64:YOUR_32_CHAR_KEY

# Strong passwords (use: openssl rand -base64 32)
DB_PASSWORD=your_secure_db_password_here
DB_ROOT_PASSWORD=your_secure_root_password_here
REDIS_PASSWORD=your_secure_redis_password_here

# Email configuration (if using Gmail)
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
```

**Save**: `Ctrl+X`, then `Y`, then `Enter`

---

### 3️⃣ Run Automated Deployment

```bash
bash scripts/deploy.sh
```

**This script will:**
1. ✅ Pull latest code from git
2. ✅ Build Docker images
3. ✅ Install PHP dependencies (Composer)
4. ✅ Generate Laravel app key
5. ✅ Run database migrations
6. ✅ Seed initial data (activities, game settings, equipment)
7. ✅ Build React frontend (production bundle)
8. ✅ Obtain SSL certificate from Let's Encrypt
9. ✅ Start all Docker services
10. ✅ Test site accessibility

**Time**: ~10-15 minutes (first deployment)

---

## 🎉 Deployment Complete!

Your application is now running at: **https://puzo.fun**

### ✅ Verify Deployment

```bash
# Check all services are running
docker-compose -f docker-compose.prod.yml ps

# Expected output:
# puzo_nginx       Up      0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
# puzo_php         Up      9000/tcp
# puzo_mysql       Up      3306/tcp
# puzo_redis       Up      6379/tcp
# puzo_queue       Up
# puzo_scheduler   Up
```

### 🧪 Test API Health

```bash
curl https://puzo.fun/api/v1/health
```

**Expected response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-02T12:00:00Z",
  "checks": {
    "database": "ok",
    "redis": "ok",
    "api": "ok"
  }
}
```

---

## 🔄 Updating Your Application

When you push code changes to GitHub:

```bash
ssh root@YOUR_DROPLET_IP
cd /var/www/puzo.fun
bash scripts/deploy.sh
```

**Or deploy a specific branch:**
```bash
bash scripts/deploy.sh develop
```

---

## 📊 Container Management

```bash
# View logs (all services)
docker-compose -f docker-compose.prod.yml logs -f

# View specific service logs
docker-compose -f docker-compose.prod.yml logs -f nginx
docker-compose -f docker-compose.prod.yml logs -f php

# Restart all services
docker-compose -f docker-compose.prod.yml restart

# Restart specific service
docker-compose -f docker-compose.prod.yml restart nginx

# Stop all services
docker-compose -f docker-compose.prod.yml down

# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Execute commands in PHP container
docker-compose -f docker-compose.prod.yml exec php php artisan migrate
docker-compose -f docker-compose.prod.yml exec php php artisan cache:clear
```

---

## 🔐 SSL Certificate Renewal

SSL certificates auto-renew. To manually renew:

```bash
certbot renew
docker-compose -f docker-compose.prod.yml restart nginx
```

---

## 💾 Database Management

### Backup Database

```bash
docker-compose -f docker-compose.prod.yml exec mysql mysqldump \
  -u puzo_user -p puzo_fun > backup_$(date +%Y%m%d).sql
```

### Restore Database

```bash
cat backup_20251202.sql | docker-compose -f docker-compose.prod.yml exec -T mysql \
  mysql -u puzo_user -p puzo_fun
```

### Access MySQL Console

```bash
docker-compose -f docker-compose.prod.yml exec mysql mysql -u root -p
```

---

## 🛡️ Security Best Practices

### 1. Change Default SSH Port (Optional)

```bash
nano /etc/ssh/sshd_config
# Change: Port 22 -> Port 2222
systemctl restart sshd

# Update firewall
ufw allow 2222/tcp
ufw delete allow 22/tcp
```

### 2. Set Up Automatic Backups

```bash
# Add to crontab
crontab -e

# Daily database backup at 3 AM
0 3 * * * cd /var/www/puzo.fun && docker-compose -f docker-compose.prod.yml exec -T mysql mysqldump -u root -p$DB_ROOT_PASSWORD puzo_fun > /backups/db_$(date +\%Y\%m\%d).sql
```

### 3. Monitor Disk Space

```bash
df -h
docker system df
```

### 4. Clean Up Old Docker Images

```bash
docker system prune -a
```

---

## 🐛 Troubleshooting

### Problem: Containers not starting

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Rebuild containers
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

### Problem: SSL certificate error

```bash
# Stop nginx
docker-compose -f docker-compose.prod.yml stop nginx

# Get certificate manually
certbot certonly --standalone -d puzo.fun -d www.puzo.fun

# Start nginx
docker-compose -f docker-compose.prod.yml start nginx
```

### Problem: Database connection error

```bash
# Check MySQL is running
docker-compose -f docker-compose.prod.yml ps mysql

# Check credentials in backend/.env
nano backend/.env

# Restart PHP
docker-compose -f docker-compose.prod.yml restart php
```

### Problem: Frontend not loading

```bash
# Rebuild frontend
cd frontend
npm run build
cd ..

# Check nginx config
docker-compose -f docker-compose.prod.yml exec nginx nginx -t

# Restart nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

---

## 📈 Monitoring & Performance

### Check System Resources

```bash
# CPU and Memory usage
docker stats

# Disk usage
df -h
du -sh /var/www/puzo.fun/*
```

### Check Application Performance

```bash
# PHP slow queries log
docker-compose -f docker-compose.prod.yml exec php tail -f /var/log/php_errors.log

# MySQL slow queries
docker-compose -f docker-compose.prod.yml exec mysql tail -f /var/log/mysql/slow-query.log

# Nginx access log
docker-compose -f docker-compose.prod.yml logs nginx | tail -100
```

---

## 🆘 Emergency Procedures

### Rollback to Previous Version

```bash
cd /var/www/puzo.fun
git log --oneline -10  # Find previous commit hash
git reset --hard <commit-hash>
bash scripts/deploy.sh
```

### Complete System Reset

```bash
# ⚠️ WARNING: This will delete ALL data!
docker-compose -f docker-compose.prod.yml down -v
docker system prune -a
bash scripts/deploy.sh
```

---

## 📞 Support & Resources

- **GitHub Issues**: https://github.com/YOUR_USERNAME/puzo.fun/issues
- **Laravel Docs**: https://laravel.com/docs
- **Docker Docs**: https://docs.docker.com
- **DigitalOcean Community**: https://www.digitalocean.com/community

---

## 📋 Deployment Checklist

Before going live:

- [ ] DNS records configured and propagated
- [ ] `.env` file created with secure passwords
- [ ] SSL certificate obtained
- [ ] All services running (6 containers)
- [ ] API health check returns `200 OK`
- [ ] Frontend loads at `https://puzo.fun`
- [ ] Test user can register/login
- [ ] Activities page loads correctly
- [ ] Database backups configured
- [ ] Firewall rules active (UFW)
- [ ] Fail2Ban monitoring SSH
- [ ] SSL auto-renewal cron job set up

---

**Last updated**: 2025-12-02
**Version**: 1.0
