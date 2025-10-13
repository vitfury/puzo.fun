# Melody Ninja - Claude Documentation

## 🎯 Огляд проєкту

**Melody Ninja** — це веб-додаток для геймифікованого музичного навчання та мотивації до фізичної активності. Користувач проходить "дерево розвитку" музичних жанрів (skill tree), відкриваючи нові жанри через щоденні прогулянки з прослуховуванням плейлистів.

**Домен:** melody.ninja
**Стиль:** Темний ніндзя-стиль з геймерською мультяшністю в японському стилі

---

## 🛠 Технологічний стек

### Backend
- **Framework:** Laravel (остання стабільна версія)
- **База даних:** PostgreSQL
- **Cache/Queue:** Redis
- **API аутентифікація:** Laravel Sanctum
- **Шифрування:** Laravel Encryption для sensitive даних

### Frontend
- **Framework:** React
- **Стиль:** CSS/SCSS + темна тема
- **Бібліотеки:**
  - `react-flow` / `vis-network` — візуалізація музичного дерева
  - `react-zoom-pan-pinch` — pan/zoom функціонал
  - Firebase SDK — для push-нотифікацій

### Інфраструктура
- **Контейнеризація:** Docker Compose
  - app (Laravel/PHP-FPM)
  - nginx
  - postgres
  - redis
  - node (для збірки React)
- **Хостинг:** Digital Ocean
- **SSL:** Let's Encrypt (обов'язково для FCM та Service Workers)

### Зовнішні API
1. **Strava API** — трекінг активності, кроків, калорій
2. **YouTube Data API** — інформація про плейлисти
3. **Firebase Cloud Messaging (FCM)** — push-нотифікації
4. **Anthropic Claude API** — розпізнавання їжі та підрахунок калорій

---

## 📁 Структура проєкту

```
melody-ninja/
├── backend/              # Laravel application
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   └── Middleware/
│   │   ├── Models/
│   │   ├── Services/
│   │   ├── Jobs/
│   │   └── Notifications/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   │   ├── api.php
│   │   └── web.php
│   ├── config/
│   └── storage/
│       └── app/
│           └── public/  # uploaded images
├── frontend/             # React application
│   ├── public/
│   │   ├── manifest.json
│   │   └── firebase-messaging-sw.js
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── auth.js
│   │   │   └── firebase.js
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── index.jsx
│   ├── package.json
│   └── vite.config.js
├── docker/
│   ├── nginx/
│   │   └── default.conf
│   ├── php/
│   │   └── Dockerfile
│   └── node/
│       └── Dockerfile
├── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
├── CLAUDE.md            # Цей файл
└── docs/
    └── TECHNICAL_SPEC.md
```

---

## 👥 Система ролей

### Admin
- Повний доступ до управління контентом
- CRUD жанрів, активностей, нагород, челенджів
- Перегляд статистики всіх користувачів
- Управління лімітом калорій користувачів

### User
- Доступ до музичного дерева
- Щоденник активностей
- Щоденник харчування
- Власна статистика
- Порівняння з іншими гравцями

---

## 🗄️ База даних

### Основні таблиці

#### Користувачі та аутентифікація
- `users` — основна інформація про користувачів
- `user_strava_tokens` — OAuth токени Strava (encrypted)
- `user_profiles` — додаткова інформація (daily_calorie_limit)
- `user_fcm_tokens` — токени для push-нотифікацій

#### Музичне дерево
- `genre_nodes` — жанри (parent_id, position_x, position_y, youtube_playlist_url, is_side_quest)
- `user_genre_progress` — прогрес користувача по жанрах
- `user_genre_comments` — коментарі користувачів до жанрів

#### Активності
- `activities` — типи активностей (daily_checkbox, permanent_rule, music_walk)
- `user_daily_activities` — виконання щоденних активностей

#### Фітнес дані
- `user_fitness_data` — кроки, калорії, дистанція (з Strava)
- `user_strava_activities` — детальний лог активностей Strava

#### Щоденник харчування
- `food_log_entries` — записи їжі (text/photo, calories, meal_type)

#### Геймифікація
- `user_points` — баланс та історія очок
- `user_points_history` — детальна історія нарахувань
- `user_streaks` — streak система
- `user_levels` — рівні та титули
- `challenges` — челенджі
- `user_challenges` — прогрес користувачів по челенджам
- `rewards` — доступні нагороди
- `user_rewards` — придбані нагороди
- `badges` — бейджі
- `user_badges` — отримані бейджі

#### Нотифікації
- `user_notification_settings` — налаштування каналів нотифікацій

---

## 🔑 API Endpoints

### Аутентифікація
```
GET  /api/auth/strava              # redirect на Strava OAuth
GET  /api/auth/strava/callback     # обробка callback
POST /api/auth/logout
POST /api/auth/strava/refresh      # оновлення access token
```

### Користувач
```
GET  /api/user/profile
PUT  /api/user/profile
GET  /api/user/stats
GET  /api/user/fitness-data
POST /api/user/fitness-data/sync   # ручна синхронізація Strava
PUT  /api/user/notification-settings
POST /api/user/fcm-token
```

### Щоденник харчування
```
GET    /api/food-log                    # записи з фільтрацією по даті
POST   /api/food-log                    # додати запис
PUT    /api/food-log/{id}
DELETE /api/food-log/{id}
GET    /api/food-log/today-summary      # підсумок за сьогодні
POST   /api/food-log/analyze-text       # Claude API аналіз тексту
POST   /api/food-log/analyze-image      # Claude API аналіз фото
```

### Музичне дерево
```
GET  /api/genres                    # всі жанри
GET  /api/genres/{id}
POST /api/genres/{id}/complete
POST /api/genres/{id}/comment
GET  /api/genres/{id}/comments

# Admin
POST   /api/admin/genres
PUT    /api/admin/genres/{id}
DELETE /api/admin/genres/{id}
```

### Активності
```
GET  /api/activities/daily
POST /api/activities/{id}/complete

# Admin
POST   /api/admin/activities
PUT    /api/admin/activities/{id}
DELETE /api/admin/activities/{id}
```

### Очки та нагороди
```
GET  /api/points/balance
GET  /api/points/history
GET  /api/rewards
POST /api/rewards/{id}/purchase

# Admin
POST   /api/admin/rewards
PUT    /api/admin/rewards/{id}
DELETE /api/admin/rewards/{id}
```

### Челенджі
```
GET /api/challenges
GET /api/challenges/my

# Admin
POST   /api/admin/challenges
PUT    /api/admin/challenges/{id}
DELETE /api/admin/challenges/{id}
```

### Інше
```
GET  /api/comparisons              # порівняння гравців
POST /api/webhooks/strava          # Strava webhook
GET  /api/webhooks/strava/verify   # верифікація webhook
```

---

## ⏰ Laravel Schedule (Cron Jobs)

```php
// Кожні 10 хвилин
- Синхронізація даних з Strava для всіх користувачів

// Кожні 15 хвилин
- Оновлення Strava access tokens (refresh)

// О 6:00 щодня
- Створення щоденних активностей
- Розблокування нових жанрів
- Оновлення streak
- Нарахування бонусних очок за streak milestones

// Кожну годину
- Перевірка виконання челенджів

// Щодня в час користувача
- Щоденне нагадування про прогулянку (FCM)

// О 20:00 щодня
- Попередження про наближення до ліміту калорій (<200 ккал)

// О 22:00 щодня
- Нагадування про незавершені активності

// О 23:00 щодня
- Звіт адмінам про активність користувачів
```

---

## 🔔 Система нотифікацій

### Firebase Cloud Messaging (FCM)
- **Frontend:** Firebase SDK, Service Worker для background notifications
- **Backend:** kreait/firebase-php для відправки
- **iOS:** Потрібен HTTPS, PWA manifest
- **Android:** Service Worker + manifest.json

### Типи нотифікацій для користувача
1. Щоденне нагадування про прогулянку (в час користувача)
2. Нагадування про незавершені активності (22:00)
3. Досягнення нового рівня
4. Розблокування сайд-квесту
5. Нагорода за streak (7, 14, 30 днів)
6. Новий челендж
7. Виконання челенджу
8. Попередження про калорії (<200 ккал до ліміту)
9. Перевищення ліміту калорій

### Типи нотифікацій для адміна
1. Щоденний звіт (23:00)
2. Попередження про неактивність (2 дні)
3. Попередження про перевищення калорій (3 дні поспіль)

### Альтернативні канали
- Email (fallback)
- Strava коментарі (опціонально, через API)

---

## 🎮 Геймифікація

### Джерела очок
- Виконання щоденних активностей (задається адміном)
- Бонус за кроки: +10 очок за кожні 1000 кроків
- Streak бонуси: 7 днів (+50), 14 днів (+100), 30 днів (+300)
- Виконання челенджів
- Щоденний бонус за вхід: +5 очок
- Щоденний бонус за ведення щоденника харчування: +5 очок
- Комбо (всі активності + жанр + >7000 кроків): 3x бонус

### Streak система
- Збільшується на 1 за кожен день виконання всіх активностей
- При пропуску дня скидається на 0
- 3 дні → розблокування сайд-квесту
- 7, 14, 30 днів → бонусні очки

### Рівні та титули
- Базуються на кількості пройдених жанрів
- 1-5 жанрів: Рівень 1 - "Новачок"
- 6-15 жанрів: Рівень 2 - "Меломан"
- 16-30 жанрів: Рівень 3 - "Рок-експерт"
- 31+ жанрів: Рівень 4 - "Легенда"

### Бейджі
- 10 жанрів → "Початківець"
- 50 жанрів → "Експерт"
- 100,000 кроків → "Марафонець"
- 7 днів без перевищення калорій → "Майстер дисципліни"
- 30 днів ведення щоденника → "Відповідальний"

---

## 🎵 Музичне дерево

### Логіка прогресії
1. Користувач починає з кореневого вузла
2. При кліку на жанр відкривається детальна сторінка
3. Жанр автоматично вважається "пройденим" при першому відкритті
4. Наступного дня (після 6:00) відкриваються всі дочірні жанри
5. Якщо пропущено день → нові жанри НЕ відкриваються

### Сайд-квести
- Розблокуються після 3-денного streak
- Музичні групи/виконавці міксових стилів
- `is_side_quest = true` в БД

### Візуалізація
- 2D інтерактивна карта (pan/zoom)
- Статус: заблокований / доступний / пройдений
- Історична прив'язка (year_from, year_to)

---

## 🏃 Інтеграція з Strava

### OAuth 2.0
- Scopes: `activity:read_all`, `profile:read_all`
- Tokens зберігаються encrypted в `user_strava_tokens`
- Автоматичний refresh кожні 15 хв

### Дані
- Кроки (конвертовані з дистанції: ~1300 кроків/км)
- Дистанція (метри)
- Калорії спалені
- Тривалість активності

### Синхронізація
- Автоматична: кожні 10 хв (Laravel Schedule)
- Ручна: кнопка "Оновити дані" в профілі
- Real-time: webhook від Strava (опціонально)

### Deep Links
- `strava://record` — запуск запису активності
- Кнопка "Почати музичну прогулянку":
  1. Відкриває YouTube Music плейліст
  2. Відкриває Strava для запису

### Webhook
```
POST /api/webhooks/strava
GET  /api/webhooks/strava/verify
```
Події: `activity.created`, `activity.updated`

### Rate Limits
- 100 requests per 15 min
- 1000 requests per day per user

---

## 🍽 Щоденник харчування

### Claude API Integration

#### Текстовий аналіз
```javascript
POST https://api.anthropic.com/v1/messages
Model: claude-3-5-sonnet-20241022

Request: "Проаналізуй цю їжу та підрахуй калорії: [userInput]"
Response: {"description": "...", "calories": число, "confidence": "high/medium/low"}
```

#### Аналіз фото
```javascript
POST https://api.anthropic.com/v1/messages
Content: [
  { type: 'image', source: { type: 'base64', data: base64Image } },
  { type: 'text', text: 'Проаналізуй їжу на фото...' }
]
```

### Камера в браузері
- `navigator.mediaDevices.getUserMedia()` для web
- `<input type="file" accept="image/*" capture="camera">` як альтернатива
- Стиснення через Canvas API перед відправкою

### Функціонал
- Додавання текстом або фото
- Типи прийому: сніданок, обід, вечеря, снек
- Ручна корекція калорій після аналізу
- Календар історії
- Статистика та графіки за тиждень/місяць

### Віджет балансу калорій
```
Ліміт на день: 2000 ккал
Спожито:       1500 ккал (з щоденника)
Спалено:       300 ккал (з Strava)
Залишилось:    800 ккал
```

---

## 🎨 UI/UX

### Дизайн
- **Стиль:** Темний ніндзя-стиль з японськими мотивами
- **Кольори:** Чорний, темно-синій + червоний, золотий акценти
- **Шрифти:** Японська каліграфія для заголовків
- **Анімації:** Плавні переходи, паралакс ефекти

### Адаптивність
- Mobile-first (primary use case)
- Повністю responsive
- PWA manifest для "add to home screen"

---

## 🚀 Розгортання

### Docker Compose
```bash
docker-compose up -d
```

Сервіси:
- `app` — Laravel (PHP-FPM)
- `nginx` — веб-сервер
- `postgres` — база даних
- `redis` — кеш/черги
- `node` — збірка React (dev)

### SSL (Let's Encrypt)
```bash
certbot --nginx -d melody.ninja -d www.melody.ninja
```

### Environment Variables
```
# Backend (.env)
APP_URL=https://melody.ninja
DB_CONNECTION=pgsql
REDIS_HOST=redis

STRAVA_CLIENT_ID=
STRAVA_CLIENT_SECRET=
STRAVA_REDIRECT_URI=

YOUTUBE_API_KEY=

FIREBASE_PROJECT_ID=
FIREBASE_SERVER_KEY=

ANTHROPIC_API_KEY=

# Frontend (.env)
VITE_API_URL=https://melody.ninja/api
VITE_FIREBASE_CONFIG={}
```

---

## 📝 Важливі примітки

### Security
- Шифрування Strava tokens (Laravel Encryption)
- Валідація Strava webhook signature
- HTTPS обов'язковий (FCM, Service Workers)
- Rate limiting для API endpoints

### Performance
- Redis для кешування (список жанрів, статистика)
- Laravel Horizon для моніторингу черг
- Оптимізація зображень при upload
- Eager loading для запобігання N+1

### Testing
- Unit тести для бізнес-логіки
- Feature тести для API endpoints
- Seeders для тестових даних

### Monitoring
- Laravel Telescope (dev)
- Laravel Horizon (queues)
- Логування критичних операцій

---

## 🔮 Майбутні можливості

- Інтеграція з Spotify API
- Спільні челенджі між користувачами
- Система рейтингів жанрів
- Експорт статистики в PDF
- React Native мобільний додаток
- Apple Health інтеграція
- Баркод сканер для продуктів
- Розпізнавання мови для харчування
- AI рекомендації меню

---

## 📚 Корисні посилання

### API Documentation
- [Strava API](https://developers.strava.com/)
- [YouTube Data API](https://developers.google.com/youtube/v3)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Anthropic Claude API](https://docs.anthropic.com/)

### Laravel Resources
- [Laravel Documentation](https://laravel.com/docs)
- [Laravel Sanctum](https://laravel.com/docs/sanctum)
- [Laravel Schedule](https://laravel.com/docs/scheduling)
- [Laravel Horizon](https://laravel.com/docs/horizon)

### React Resources
- [React Documentation](https://react.dev/)
- [React Flow](https://reactflow.dev/)
- [Firebase JS SDK](https://firebase.google.com/docs/web/setup)

---

**Версія документації:** 1.0
**Дата оновлення:** 2025-10-14
**Автор:** Vitaliy Omelchenko
