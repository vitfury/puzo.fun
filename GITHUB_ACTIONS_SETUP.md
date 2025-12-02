# 🤖 GitHub Actions Auto-Deployment Setup

Автоматичний deployment на DigitalOcean при кожному push в `master` branch.

## 📋 Що потрібно

1. ✅ GitHub репозиторій з кодом
2. ✅ DigitalOcean Droplet (налаштований з [DEPLOYMENT.md](DEPLOYMENT.md))
3. ✅ SSH ключ для доступу до сервера

---

## 🔧 Налаштування (Крок за кроком)

### 1️⃣ Створити SSH ключ для GitHub Actions

На вашому **локальному комп'ютері**:

```bash
# Генеруємо новий SSH ключ БЕЗ passphrase
ssh-keygen -t ed25519 -C "github-actions@puzo.fun" -f ~/.ssh/puzo_deploy

# НЕ вводьте passphrase - просто натисніть Enter двічі!
```

**Результат**: Створено 2 файли:
- `~/.ssh/puzo_deploy` - приватний ключ (для GitHub Secrets)
- `~/.ssh/puzo_deploy.pub` - публічний ключ (для сервера)

---

### 2️⃣ Додати публічний ключ на сервер

**Варіант A: Через SSH** (рекомендовано)

```bash
# Копіюємо публічний ключ на сервер
ssh-copy-id -i ~/.ssh/puzo_deploy.pub root@YOUR_DROPLET_IP
```

**Варіант B: Вручну**

```bash
# 1. Показати публічний ключ
cat ~/.ssh/puzo_deploy.pub

# 2. SSH на сервер
ssh root@YOUR_DROPLET_IP

# 3. Додати ключ в authorized_keys
echo "ssh-ed25519 AAAA... github-actions@puzo.fun" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

**Перевірка:**
```bash
# Спробуйте підключитись новим ключем
ssh -i ~/.ssh/puzo_deploy root@YOUR_DROPLET_IP
# Має підключитись БЕЗ пароля!
```

---

### 3️⃣ Налаштувати GitHub Secrets

Перейдіть в налаштування GitHub репозиторію:

```
GitHub Repository → Settings → Secrets and variables → Actions → New repository secret
```

#### Додайте 4 secrets:

**1. `DO_HOST`** - IP адреса вашого Droplet
```
Значення: 123.456.789.012
```

**2. `DO_USERNAME`** - SSH користувач (зазвичай `root`)
```
Значення: root
```

**3. `DO_SSH_KEY`** - Приватний SSH ключ

```bash
# Показати приватний ключ
cat ~/.ssh/puzo_deploy
```

Скопіюйте **ВСЕ** (включаючи `-----BEGIN OPENSSH PRIVATE KEY-----` та `-----END OPENSSH PRIVATE KEY-----`)

```
Значення:
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
...
(весь ключ)
...
-----END OPENSSH PRIVATE KEY-----
```

**4. `DO_SSH_PORT`** - SSH порт (за замовчуванням `22`)
```
Значення: 22
```

*(Якщо ви змінили SSH порт на інший, вкажіть його)*

---

### 4️⃣ Перевірити GitHub Actions

GitHub Actions workflow вже створено в: [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)

#### Як це працює:

```yaml
Тригери:
  ✅ Автоматично при push в master/main branch
  ✅ Вручну через GitHub UI (workflow_dispatch)

Кроки:
  1. Підключається до сервера через SSH
  2. Pulls останній код з git
  3. Rebuilds Docker images
  4. Runs migrations
  5. Builds frontend
  6. Restarts services
  7. Tests health endpoint
  8. Notifies результат
```

---

## 🚀 Тестування Auto-Deployment

### Варіант 1: Push код в master

```bash
# На вашому локальному комп'ютері
git add .
git commit -m "Test auto-deployment"
git push origin master
```

### Варіант 2: Запустити вручну

1. Відкрийте GitHub репозиторій
2. Перейдіть в **Actions** → **Deploy to DigitalOcean**
3. Натисніть **Run workflow** → **Run workflow**

---

## 📊 Моніторинг Deployment

### Переглянути логи в GitHub:

```
GitHub Repository → Actions → [Останній workflow]
```

Ви побачите:
- ✅ Зелена галочка = успішний deployment
- ❌ Червоний хрестик = помилка
- 🟡 Жовте коло = в процесі

### Логи в реальному часі на сервері:

```bash
ssh root@YOUR_DROPLET_IP
cd /var/www/puzo.fun
docker-compose -f docker-compose.prod.yml logs -f
```

---

## 🐛 Troubleshooting

### Помилка: "Permission denied (publickey)"

**Проблема:** GitHub Actions не може підключитись до сервера

**Рішення:**
```bash
# 1. Перевірте що ключ додано на сервері
ssh root@YOUR_DROPLET_IP "cat ~/.ssh/authorized_keys"

# 2. Перевірте формат ключа в GitHub Secrets
# Має бути ВЕСЬ ключ з -----BEGIN----- та -----END-----

# 3. Перевірте права на файли (на сервері)
ssh root@YOUR_DROPLET_IP
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### Помилка: "Health check failed"

**Проблема:** Сервіси не стартують після deployment

**Рішення:**
```bash
ssh root@YOUR_DROPLET_IP
cd /var/www/puzo.fun

# Перевірити статус контейнерів
docker-compose -f docker-compose.prod.yml ps

# Перевірити логи
docker-compose -f docker-compose.prod.yml logs nginx php mysql

# Перезапустити вручну
docker-compose -f docker-compose.prod.yml restart
```

### Помилка: "npm ci failed"

**Проблема:** Недостатньо пам'яті для npm build

**Рішення:**
```bash
# На сервері - збільшити swap
ssh root@YOUR_DROPLET_IP
sudo fallocate -l 4G /swapfile2
sudo chmod 600 /swapfile2
sudo mkswap /swapfile2
sudo swapon /swapfile2
```

### Помилка: "docker-compose command not found"

**Проблема:** Docker Compose не встановлено або неправильний шлях

**Рішення:**
```bash
ssh root@YOUR_DROPLET_IP

# Перевірити чи встановлено Docker Compose
which docker-compose
docker-compose --version

# Якщо немає - встановити
curl -L "https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

---

## 🔐 Security Best Practices

### 1. Використовуйте окремий deploy користувач (опційно)

Замість `root`, створіть окремого користувача для deployment:

```bash
# На сервері
adduser deploy
usermod -aG docker deploy
usermod -aG sudo deploy

# Додайте SSH ключ для deploy користувача
su - deploy
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "ssh-ed25519 AAAA... github-actions@puzo.fun" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# В GitHub Secrets змініть DO_USERNAME на "deploy"
```

### 2. Обмежте доступ SSH ключа

На сервері в `/root/.ssh/authorized_keys` або `/home/deploy/.ssh/authorized_keys`:

```bash
command="cd /var/www/puzo.fun && bash scripts/deploy.sh",no-port-forwarding,no-X11-forwarding,no-agent-forwarding ssh-ed25519 AAAA... github-actions@puzo.fun
```

### 3. Додайте notifications (опційно)

**Slack notification:**

Додайте в `.github/workflows/deploy.yml`:

```yaml
- name: 📢 Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

**Discord notification:**

```yaml
- name: 📢 Notify Discord
  if: always()
  uses: sarisia/actions-status-discord@v1
  with:
    webhook: ${{ secrets.DISCORD_WEBHOOK }}
```

---

## 📈 Advanced: Multi-Environment Deployment

Якщо хочете окремі staging/production середовища:

**Створіть окремі workflows:**

`.github/workflows/deploy-staging.yml`:
```yaml
on:
  push:
    branches:
      - develop
```

`.github/workflows/deploy-production.yml`:
```yaml
on:
  push:
    branches:
      - master
```

**Додайте окремі secrets:**
- `STAGING_HOST`, `STAGING_SSH_KEY`
- `PRODUCTION_HOST`, `PRODUCTION_SSH_KEY`

---

## ✅ Checklist

Після налаштування перевірте:

- [ ] SSH ключ створено БЕЗ passphrase
- [ ] Публічний ключ додано на сервер (`~/.ssh/authorized_keys`)
- [ ] SSH підключення працює без пароля
- [ ] 4 GitHub Secrets налаштовано (DO_HOST, DO_USERNAME, DO_SSH_KEY, DO_SSH_PORT)
- [ ] GitHub Actions workflow файл закомічено (`.github/workflows/deploy.yml`)
- [ ] Тестовий push в master тригерить deployment
- [ ] GitHub Actions показує зелену галочку ✅
- [ ] Сайт доступний на https://puzo.fun після deployment

---

## 🎉 Готово!

Тепер при кожному push в `master`:

1. GitHub Actions автоматично підключається до вашого сервера
2. Pulls останній код
3. Rebuilds Docker containers
4. Runs migrations
5. Builds React frontend
6. Restarts всі сервіси
7. Перевіряє доступність сайту

**Час deployment:** ~3-5 хвилин

**Переглянути історію:** GitHub → Actions

---

**Last updated**: 2025-12-02
**Автор**: Claude Code
