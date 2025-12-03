# 🔐 GitHub Secrets - Швидка інструкція

## ❌ Помилка: "missing server host"

Ця помилка означає, що в GitHub репозиторії не налаштовані потрібні secrets.

---

## ✅ Що потрібно зробити:

### 1️⃣ Відкрити налаштування Secrets

1. Перейдіть на GitHub репозиторій: `https://github.com/YOUR_USERNAME/music.ninja`
2. Натисніть **Settings** (вгорі справа)
3. В лівому меню: **Secrets and variables** → **Actions**
4. Натисніть **New repository secret**

---

### 2️⃣ Додати 4 обов'язкові Secrets

#### Secret 1: `DO_HOST`
- **Name:** `DO_HOST`
- **Value:** IP адреса вашого DigitalOcean Droplet
  - Приклад: `123.456.789.012`
  - Знайти IP можна в DigitalOcean Dashboard → Droplets → ваш droplet

#### Secret 2: `DO_USERNAME`
- **Name:** `DO_USERNAME`
- **Value:** SSH користувач (зазвичай `root`)
  - Приклад: `root`

#### Secret 3: `DO_SSH_KEY`
- **Name:** `DO_SSH_KEY`
- **Value:** Приватний SSH ключ (весь ключ, включаючи BEGIN/END)

**Як отримати SSH ключ:**

```bash
# Якщо у вас вже є SSH ключ для сервера:
cat ~/.ssh/id_rsa

# АБО створити новий ключ БЕЗ passphrase:
ssh-keygen -t ed25519 -C "github-actions@music.ninja" -f ~/.ssh/music_deploy
# НЕ вводьте passphrase - просто натисніть Enter двічі!

# Показати приватний ключ:
cat ~/.ssh/music_deploy

# Скопіюйте ВСЕ, включаючи:
# -----BEGIN OPENSSH PRIVATE KEY-----
# ... весь ключ ...
# -----END OPENSSH PRIVATE KEY-----
```

**Важливо:** Публічний ключ потрібно додати на сервер:

```bash
# Скопіювати публічний ключ на сервер
ssh-copy-id -i ~/.ssh/music_deploy.pub root@YOUR_DROPLET_IP

# АБО вручну:
cat ~/.ssh/music_deploy.pub
# Потім на сервері:
ssh root@YOUR_DROPLET_IP
echo "ssh-ed25519 AAAA... github-actions@music.ninja" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

#### Secret 4: `DO_SSH_PORT`
- **Name:** `DO_SSH_PORT`
- **Value:** SSH порт (за замовчуванням `22`)
  - Приклад: `22`
  - Якщо змінили порт - вкажіть ваш порт

---

### 3️⃣ Перевірка

Після додавання всіх 4 secrets, перевірте:

1. В GitHub → Settings → Secrets and variables → Actions
2. Має бути 4 secrets:
   - ✅ `DO_HOST`
   - ✅ `DO_USERNAME`
   - ✅ `DO_SSH_KEY`
   - ✅ `DO_SSH_PORT`

---

### 4️⃣ Тестування

**Варіант 1: Push в master**
```bash
git add .
git commit -m "Test deployment"
git push origin master
```

**Варіант 2: Запустити вручну**
1. GitHub → Actions
2. Виберіть workflow "Deploy to DigitalOcean"
3. Натисніть "Run workflow" → "Run workflow"

---

## 🐛 Troubleshooting

### Помилка: "Permission denied (publickey)"

**Проблема:** SSH ключ не додано на сервер або неправильний формат

**Рішення:**
```bash
# 1. Перевірити що ключ додано на сервері
ssh root@YOUR_DROPLET_IP "cat ~/.ssh/authorized_keys"

# 2. Перевірити формат ключа в GitHub Secrets
# Має бути ВЕСЬ ключ з -----BEGIN----- та -----END-----

# 3. Перевірити права на файли (на сервері)
ssh root@YOUR_DROPLET_IP
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### Помилка: "Host key verification failed"

**Рішення:** Додати в workflow файл опцію `host_key_checking: false` (небезпечно) або додати host key в secrets.

---

## 📋 Checklist

- [ ] SSH ключ створено БЕЗ passphrase
- [ ] Публічний ключ додано на сервер (`~/.ssh/authorized_keys`)
- [ ] SSH підключення працює без пароля: `ssh -i ~/.ssh/music_deploy root@YOUR_DROPLET_IP`
- [ ] 4 GitHub Secrets налаштовано:
  - [ ] `DO_HOST` - IP адреса сервера
  - [ ] `DO_USERNAME` - SSH користувач (root)
  - [ ] `DO_SSH_KEY` - Приватний SSH ключ (весь)
  - [ ] `DO_SSH_PORT` - SSH порт (22)
- [ ] Тестовий push в master тригерить deployment
- [ ] GitHub Actions показує зелену галочку ✅

---

## 🎉 Готово!

Після налаштування всіх secrets, GitHub Actions автоматично деплоїтиме ваш код при кожному push в `master` branch.

**Час deployment:** ~3-5 хвилин

**Переглянути історію:** GitHub → Actions

