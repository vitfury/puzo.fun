# 🥷 Melody Ninja

Веб-додаток для геймифікованого музичного навчання та мотивації до фізичної активності.

## 🚀 Швидкий старт

### Вимоги
- Docker Desktop
- Git

### Встановлення

1. **Клонуйте репозиторій**
```bash
git clone <repository-url>
cd music.ninja
```

2. **Налаштуйте environment змінні**
```bash
# Основні налаштування Docker
cp .env.example .env

# Backend налаштування
cp backend/.env.example backend/.env

# Frontend налаштування
cp frontend/.env.example frontend/.env
```

3. **Відредагуйте .env файли**
- Змініть паролі бази даних та Redis
- Додайте API ключі (Strava, YouTube, Firebase, Anthropic)

4. **Запустіть проєкт**
```bash
# Перший запуск - побудова контейнерів
docker-compose up -d --build

# Подальші запуски
docker-compose up -d
```

5. **Перевірте роботу**
- Backend API: http://localhost/api
- Frontend: http://localhost:5173
- Postgres: localhost:5432
- Redis: localhost:6379

### Зупинка проєкту
```bash
docker-compose down
```

### Зупинка з видаленням даних
```bash
docker-compose down -v
```

## 📋 Доступні команди

### Backend (Laravel)

```bash
# Увійти в контейнер
docker-compose exec app bash

# Міграції
docker-compose exec app php artisan migrate

# Створити міграцію
docker-compose exec app php artisan make:migration create_table_name

# Seeders
docker-compose exec app php artisan db:seed

# Composer
docker-compose exec app composer install
docker-compose exec app composer require package-name

# Artisan
docker-compose exec app php artisan [command]

# Очистити кеш
docker-compose exec app php artisan cache:clear
docker-compose exec app php artisan config:clear
docker-compose exec app php artisan route:clear

# Перегляд черг (Horizon)
docker-compose exec app php artisan horizon

# Перегляд логів
docker-compose logs -f app
```

### Frontend (React)

```bash
# Увійти в контейнер
docker-compose exec node sh

# NPM команди
docker-compose exec node npm install
docker-compose exec node npm install package-name
docker-compose exec node npm run build

# Перегляд логів
docker-compose logs -f node
```

### База даних

```bash
# Підключитися до PostgreSQL
docker-compose exec postgres psql -U melody_ninja -d melody_ninja

# Бекап бази даних
docker-compose exec postgres pg_dump -U melody_ninja melody_ninja > backup.sql

# Відновити бекап
docker-compose exec -T postgres psql -U melody_ninja melody_ninja < backup.sql
```

### Redis

```bash
# Підключитися до Redis CLI
docker-compose exec redis redis-cli -a changeme_secure_redis_password

# Очистити весь кеш
docker-compose exec redis redis-cli -a changeme_secure_redis_password FLUSHALL
```

## 🏗 Структура проєкту

```
music.ninja/
├── backend/              # Laravel application
│   ├── app/              # Application logic
│   ├── database/         # Migrations, seeders
│   ├── routes/           # API routes
│   └── ...
├── frontend/             # React application
│   ├── src/              # Source code
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   └── services/     # API services
│   └── ...
├── docker/               # Docker configuration
│   ├── nginx/           # Nginx config
│   ├── php/             # PHP-FPM Dockerfile
│   └── node/            # Node.js Dockerfile
├── docs/                # Documentation
├── docker-compose.yml   # Docker services
└── README.md           # This file
```

## 🔧 Розробка

### Перший запуск після клонування

```bash
# 1. Встановити залежності
docker-compose -f docker-compose.init.yml up

# 2. Запустити міграції
docker-compose exec app php artisan migrate

# 3. Створити символічне посилання для storage
docker-compose exec app php artisan storage:link

# 4. Запустити seeders (якщо є)
docker-compose exec app php artisan db:seed
```

### Hot Reload

- **Frontend**: Vite автоматично перезавантажує зміни (http://localhost:5173)
- **Backend**: Змініть файли в `backend/` - зміни застосовуються автоматично

### Debugging

**Backend (Laravel Telescope)**
```bash
# Встановити Telescope
docker-compose exec app composer require laravel/telescope --dev
docker-compose exec app php artisan telescope:install
docker-compose exec app php artisan migrate

# Доступ: http://localhost/telescope
```

**Backend (Logs)**
```bash
# Подивитись логи Laravel
docker-compose exec app tail -f storage/logs/laravel.log
```

## 🌐 Зовнішні API

### Strava API
1. Зареєструйте додаток: https://www.strava.com/settings/api
2. Додайте в `backend/.env`:
   - `STRAVA_CLIENT_ID`
   - `STRAVA_CLIENT_SECRET`

### YouTube Data API
1. Створіть проєкт в Google Cloud Console
2. Увімкніть YouTube Data API v3
3. Створіть API ключ
4. Додайте в `backend/.env`: `YOUTUBE_API_KEY`

### Firebase Cloud Messaging
1. Створіть проєкт в Firebase Console
2. Додайте Web App
3. Завантажте service account credentials
4. Додайте конфігурацію в `backend/.env` та `frontend/.env`

### Anthropic Claude API
1. Отримайте API ключ: https://console.anthropic.com/
2. Додайте в `backend/.env`: `ANTHROPIC_API_KEY`

## 🔐 Безпека

### Production налаштування

1. **Змініть паролі**
   - Database password
   - Redis password
   - APP_KEY (згенеруйте новий: `php artisan key:generate`)

2. **Налаштуйте SSL**
   - Встановіть Let's Encrypt сертифікати
   - Розкоментуйте HTTPS блок в `docker/nginx/default.conf`

3. **Environment**
   - Встановіть `APP_ENV=production`
   - Встановіть `APP_DEBUG=false`

4. **CORS**
   - Налаштуйте дозволені домени в `config/cors.php`

## 📚 Документація

- [Технічна специфікація](docs/TECHNICAL_SPEC.md)
- [Claude Documentation](CLAUDE.md)
- [Laravel Documentation](https://laravel.com/docs)
- [React Documentation](https://react.dev/)

## 🐛 Troubleshooting

### Проблема: "Connection refused" до PostgreSQL
```bash
# Перевірте чи запущений контейнер
docker-compose ps

# Перезапустіть
docker-compose restart postgres
```

### Проблема: "Permission denied" в Laravel
```bash
# Надайте права на запис
docker-compose exec app chmod -R 777 storage bootstrap/cache
```

### Проблема: Node modules помилки
```bash
# Перевстановіть залежності
docker-compose exec node rm -rf node_modules
docker-compose exec node npm install
```

### Проблема: Redis connection failed
```bash
# Перевірте пароль в .env
# Перевірте чи запущений Redis
docker-compose restart redis
```

## 📝 Ліцензія

[Вкажіть вашу ліцензію]

## 👥 Автори

- Vitaliy Omelchenko

## 🙏 Подяки

- Laravel Framework
- React
- Strava API
- YouTube API
- Firebase
- Anthropic Claude
