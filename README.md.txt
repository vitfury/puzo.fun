# 🥷 Melody Ninja

Веб-додаток для мотивації підлітка до фізичної активності через геймифіковане музичне навчання.

## 🎯 Концепція

Користувач проходить "дерево розвитку" музичних жанрів (skill tree), відкриваючи нові жанри через щоденні прогулянки з прослуховуванням плейлистів. Паралельно ведеться журнал активностей та щоденник харчування з трекінгом калорій.

**Домен:** melody.ninja  
**Стиль:** Темний ніндзя-стиль з геймерською мультяшністю в японському стилі

## 🛠 Технічний стек

- **Backend:** Laravel (останньої стабільної версії)
- **Frontend:** React
- **База даних:** PostgreSQL
- **Інфраструктура:** Docker Compose
- **Хостинг:** Digital Ocean

## 🔌 Зовнішні інтеграції

- **Strava API** - трекінг активності, кроків та калорій
- **YouTube Data API** - інформація про плейлисти
- **Firebase Cloud Messaging** - push-нотифікації
- **Anthropic Claude API** - розпізнавання їжі та підрахунок калорій

## 📁 Структура проекту

```
melody-ninja/
├── backend/              # Laravel API
├── frontend/             # React SPA
├── docker-compose.yml
├── docs/                 # Документація
│   ├── TECHNICAL_SPEC.md
│   ├── API.md
│   └── DEVELOPMENT.md
└── README.md
```

## 🚀 Швидкий старт

### Передумови

- Docker & Docker Compose
- Node.js 18+
- PHP 8.2+
- Composer

### Встановлення

```bash
# Клонувати репозиторій
git clone https://github.com/yourusername/melody-ninja.git
cd melody-ninja

# Запустити Docker контейнери
docker-compose up -d

# Встановити залежності Laravel
cd backend
composer install
cp .env.example .env
php artisan key:generate

# Міграції та seeders
php artisan migrate --seed

# Встановити залежності React
cd ../frontend
npm install

# Запустити dev сервер
npm run dev
```

Додаток буде доступний на:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## 📚 Документація

Детальна технічна документація знаходиться в папці `docs/`:

- [Технічне завдання](docs/TECHNICAL_SPEC.md) - повна специфікація
- [API документація](docs/API.md) - endpoints та приклади
- [Гайд розробника](docs/DEVELOPMENT.md) - налаштування середовища

## 🔑 Налаштування API ключів

Створи `.env` файл в папці `backend/` та додай:

```env
# Strava OAuth
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret
STRAVA_REDIRECT_URI=https://melody.ninja/auth/strava/callback

# YouTube Data API
YOUTUBE_API_KEY=your_api_key

# Firebase Cloud Messaging
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# Claude API
ANTHROPIC_API_KEY=your_api_key
```

## 👥 Система ролей

- **Admin** - повний доступ до управління контентом
- **User** - доступ до музичного дерева та особистої статистики

## 🎮 Основні функції

### Для користувачів:
- 🎵 Інтерактивне музичне дерево жанрів
- 🏃 Інтеграція з Strava для трекінгу активності
- 📊 Щоденник харчування з AI аналізом
- 🏆 Система очок, рівнів та челенджів
- 🔔 Push-нотифікації про досягнення
- 📈 Порівняння прогресу з іншими гравцями

### Для адміністраторів:
- 🎛 Управління музичним деревом
- 📋 Налаштування активностей
- 👥 Моніторинг статистики користувачів
- 🏅 Управління нагородами та челенджами

## 🔄 CI/CD

Проект використовує GitHub Actions для автоматичного деплою на Digital Ocean.

## 📝 Ліцензія

Цей проект створений для приватного використання.

## 🤝 Підтримка

Для питань та проблем створюйте Issues в цьому репозиторії.