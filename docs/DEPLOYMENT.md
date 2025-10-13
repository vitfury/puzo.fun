# 🚀 Інструкція з деплою на Digital Ocean

## Підготовка

### 1. Створіть Droplet на Digital Ocean

**Рекомендовані параметри:**
- **OS:** Ubuntu 22.04 LTS
- **Plan:** Basic (4GB RAM / 2 vCPUs / 80GB SSD) - мінімум для старту
- **Datacenter:** Виберіть найближчий до ваших користувачів
- **Additional options:** Виберіть IPv6, Monitoring
- **Authentication:** SSH ключ (рекомендовано) або пароль

**Ціна:** ~$24/місяць (може змінюватись)

### 2. Підключіться до сервера

```bash
ssh root@your_server_ip
```

## Встановлення необхідного ПЗ

### 1. Оновіть систему

```bash
apt update
apt upgrade -y
```

### 2. Встановіть Docker

```bash
# Встановіть залежності
apt install -y apt-transport-https ca-certificates curl software-properties-common

# Додайте Docker GPG ключ
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Додайте Docker репозиторій
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Встановіть Docker
apt update
apt install -y docker-ce docker-ce-cli containerd.io

# Перевірте встановлення
docker --version
```

### 3. Встановіть Docker Compose

```bash
# Завантажте Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Надайте права на виконання
chmod +x /usr/local/bin/docker-compose

# Перевірте встановлення
docker-compose --version
```

### 4. Встановіть Git

```bash
apt install -y git
```

### 5. Створіть користувача для додатку (рекомендовано)

```bash
# Створіть користувача
adduser melody

# Додайте до групи sudo
usermod -aG sudo melody

# Додайте до групи docker
usermod -aG docker melody

# Переключіться на нового користувача
su - melody
```

## Налаштування домену

### 1. Налаштуйте DNS записи

У вашому DNS провайдері (де куплений домен melody.ninja):

```
A Record:    melody.ninja     →  your_server_ip
A Record:    www.melody.ninja →  your_server_ip
```

### 2. Перевірте DNS

```bash
# Перевірте що домен вказує на ваш сервер
dig melody.ninja +short
# Має повернути IP вашого сервера
```

## Деплой додатку

### 1. Клонуйте репозиторій

```bash
cd /home/melody
git clone <your-repository-url> melody-ninja
cd melody-ninja
```

### 2. Налаштуйте .env файли

```bash
# Основний .env
cp .env.example .env
nano .env
```

**Налаштуйте:**
```env
APP_PORT=80
APP_SSL_PORT=443
DB_PASSWORD=<strong_password>
REDIS_PASSWORD=<strong_password>
```

```bash
# Backend .env
cp backend/.env.example backend/.env
nano backend/.env
```

**Налаштуйте:**
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://melody.ninja

DB_PASSWORD=<same_as_above>
REDIS_PASSWORD=<same_as_above>

# Додайте API ключі
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
YOUTUBE_API_KEY=your_api_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_SERVER_KEY=your_server_key
ANTHROPIC_API_KEY=your_api_key
```

```bash
# Frontend .env
cp frontend/.env.example frontend/.env
nano frontend/.env
```

**Налаштуйте:**
```env
VITE_API_URL=https://melody.ninja/api
# Додайте Firebase конфігурацію
```

### 3. Згенеруйте APP_KEY для Laravel

```bash
# Запустіть тимчасовий контейнер для генерації ключа
docker run --rm -v $(pwd)/backend:/app composer:latest sh -c "cd /app && php artisan key:generate"
```

### 4. Встановіть SSL сертифікат (Let's Encrypt)

```bash
# Встановіть Certbot
sudo apt install -y certbot

# Зупиніть Nginx якщо він запущений
docker-compose down

# Отримайте сертифікат
sudo certbot certonly --standalone -d melody.ninja -d www.melody.ninja

# Сертифікати будуть збережені в:
# /etc/letsencrypt/live/melody.ninja/fullchain.pem
# /etc/letsencrypt/live/melody.ninja/privkey.pem
```

### 5. Налаштуйте Nginx для HTTPS

Відредагуйте `docker/nginx/default.conf`:

```bash
nano docker/nginx/default.conf
```

**Розкоментуйте HTTPS блок і оновіть шляхи до сертифікатів.**

### 6. Додайте сертифікати в Docker Compose

Відредагуйте `docker-compose.yml`:

```yaml
nginx:
  # ...
  volumes:
    # Додайте ці рядки:
    - /etc/letsencrypt/live/melody.ninja/fullchain.pem:/etc/nginx/ssl/melody.ninja.crt:ro
    - /etc/letsencrypt/live/melody.ninja/privkey.pem:/etc/nginx/ssl/melody.ninja.key:ro
```

### 7. Запустіть додаток

```bash
# Побудуйте контейнери
docker-compose build

# Запустіть сервіси
docker-compose up -d

# Перевірте статус
docker-compose ps

# Подивіться логи
docker-compose logs -f
```

### 8. Запустіть міграції

```bash
# Почекайте поки PostgreSQL запуститься (5-10 секунд)
sleep 10

# Запустіть міграції
docker-compose exec app php artisan migrate --force

# Створіть символічне посилання для storage
docker-compose exec app php artisan storage:link
```

### 9. Побудуйте frontend

```bash
# Побудуйте React додаток
docker-compose exec node npm run build

# Скопіюйте збудовані файли
docker-compose exec node cp -r dist/* /app/public/frontend/
```

## Автоматичне оновлення SSL сертифікатів

### 1. Створіть скрипт оновлення

```bash
sudo nano /usr/local/bin/renew-ssl.sh
```

Вміст:
```bash
#!/bin/bash
cd /home/melody/melody-ninja
docker-compose down
certbot renew
docker-compose up -d
```

Зробіть виконуваним:
```bash
sudo chmod +x /usr/local/bin/renew-ssl.sh
```

### 2. Додайте в crontab

```bash
sudo crontab -e
```

Додайте:
```
0 0 1 * * /usr/local/bin/renew-ssl.sh >> /var/log/ssl-renewal.log 2>&1
```

Це буде оновлювати сертифікат 1-го числа кожного місяця.

## Налаштування Firewall

```bash
# Встановіть UFW
sudo apt install -y ufw

# Дозвольте SSH
sudo ufw allow 22/tcp

# Дозвольте HTTP та HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Увімкніть firewall
sudo ufw enable

# Перевірте статус
sudo ufw status
```

## Моніторинг та логи

### Перегляд логів

```bash
# Всі логи
docker-compose logs -f

# Laravel логи
docker-compose logs -f app

# Nginx логи
docker-compose logs -f nginx

# PostgreSQL логи
docker-compose logs -f postgres
```

### Моніторинг ресурсів

```bash
# Статистика контейнерів
docker stats

# Використання диску
df -h

# Використання пам'яті
free -h
```

### Laravel Telescope (для debug в production)

```bash
docker-compose exec app composer require laravel/telescope --dev
docker-compose exec app php artisan telescope:install
docker-compose exec app php artisan migrate

# Доступ: https://melody.ninja/telescope
# ВАЖЛИВО: Закрийте доступ через .env або middleware!
```

## Бекапи

### 1. Автоматичний бекап бази даних

Створіть скрипт:
```bash
sudo nano /usr/local/bin/backup-db.sh
```

Вміст:
```bash
#!/bin/bash
BACKUP_DIR="/home/melody/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

cd /home/melody/melody-ninja
docker-compose exec -T postgres pg_dump -U melody_ninja melody_ninja > $BACKUP_DIR/backup_$DATE.sql

# Видалити бекапи старше 7 днів
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete

echo "Backup completed: backup_$DATE.sql"
```

Зробіть виконуваним:
```bash
sudo chmod +x /usr/local/bin/backup-db.sh
```

Додайте в crontab:
```bash
sudo crontab -e
```

```
0 2 * * * /usr/local/bin/backup-db.sh >> /var/log/db-backup.log 2>&1
```

Це створюватиме бекап щодня о 2:00 ночі.

### 2. Відновлення з бекапу

```bash
cd /home/melody/melody-ninja
docker-compose exec -T postgres psql -U melody_ninja melody_ninja < /home/melody/backups/backup_YYYYMMDD_HHMMSS.sql
```

## Оновлення додатку

```bash
cd /home/melody/melody-ninja

# Отримайте останні зміни з Git
git pull origin main

# Перезапустіть контейнери
docker-compose down
docker-compose up -d --build

# Запустіть міграції
docker-compose exec app php artisan migrate --force

# Очистіть кеш
docker-compose exec app php artisan cache:clear
docker-compose exec app php artisan config:clear
docker-compose exec app php artisan route:clear

# Побудуйте frontend
docker-compose exec node npm run build
```

## Troubleshooting

### Проблема: 502 Bad Gateway

```bash
# Перевірте чи запущені всі контейнери
docker-compose ps

# Перевірте логи
docker-compose logs nginx
docker-compose logs app

# Перезапустіть
docker-compose restart
```

### Проблема: Permission denied

```bash
# Надайте права
docker-compose exec app chmod -R 777 storage bootstrap/cache
```

### Проблема: Out of memory

```bash
# Збільште розмір Droplet
# або
# Налаштуйте swap

sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Проблема: Database connection refused

```bash
# Перевірте PostgreSQL
docker-compose logs postgres

# Перевірте .env файли
# Переконайтесь що паролі однакові в .env та backend/.env
```

## Безпека

### 1. Змініть SSH порт (опціонально)

```bash
sudo nano /etc/ssh/sshd_config
# Змініть Port 22 на інший (наприклад, 2222)
sudo systemctl restart ssh

# Не забудьте відкрити новий порт в UFW:
sudo ufw allow 2222/tcp
```

### 2. Вимкніть root login через SSH

```bash
sudo nano /etc/ssh/sshd_config
# Встановіть PermitRootLogin no
sudo systemctl restart ssh
```

### 3. Встановіть fail2ban

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 4. Налаштуйте rate limiting в Nginx

Відредагуйте `docker/nginx/default.conf` і додайте rate limiting.

## Продуктивність

### 1. Увімкніть OPcache (вже налаштовано в docker/php/local.ini)

### 2. Налаштуйте Laravel кеш

```bash
# Config cache
docker-compose exec app php artisan config:cache

# Route cache
docker-compose exec app php artisan route:cache

# View cache
docker-compose exec app php artisan view:cache
```

### 3. Встановіть Redis для cache та sessions

Вже налаштовано в docker-compose.yml

## Підтримка

- Регулярно оновлюйте систему: `sudo apt update && sudo apt upgrade`
- Перевіряйте логи на помилки
- Моніторте використання ресурсів
- Робіть регулярні бекапи

## Корисні команди

```bash
# Перезапуск всіх сервісів
docker-compose restart

# Перегляд використання ресурсів
docker stats

# Очистка Docker
docker system prune -a

# Оновлення залежностей
docker-compose exec app composer update
docker-compose exec node npm update

# Перегляд активних з'єднань
docker-compose exec postgres psql -U melody_ninja -d melody_ninja -c "SELECT * FROM pg_stat_activity;"
```

---

**Готово!** Ваш додаток має бути доступний за адресою https://melody.ninja
