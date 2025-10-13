# 📋 Implementation Checklist для Claude Code

## Етап 1: Інфраструктура ✅

### Docker Setup
- [ ] Створити `docker/Dockerfile.backend` для Laravel
- [ ] Створити `docker/Dockerfile.frontend` для React
- [ ] Створити `docker/nginx.conf`
- [ ] Налаштувати `docker-compose.yml`
- [ ] Додати `.dockerignore` файли

### Backend Structure
- [ ] Ініціалізувати Laravel проект в `backend/`
- [ ] Налаштувати `.env` з усіма змінними
- [ ] Встановити необхідні пакети:
  - `laravel/sanctum` - API auth
  - `kreait/firebase-php` - FCM
  - `guzzlehttp/guzzle` - HTTP клієнт
  - `laravel/horizon` - queue monitoring
  - `spatie/laravel-permission` - roles (опціонально)

### Frontend Structure
- [ ] Ініціалізувати React проект в `frontend/`
- [ ] Налаштувати `.env` з API URL
- [ ] Встановити необхідні пакети:
  - `react-router-dom` - routing
  - `axios` - HTTP клієнт
  - `react-flow-renderer` або `reactflow` - для музичного дерева
  - `firebase` - FCM
  - `tailwindcss` - styling
  - `react-query` або `swr` - data fetching (опціонально)

## Етап 2: База даних ✅

### Міграції (всі таблиці з ТЗ)
- [ ] `users` - користувачі
- [ ] `user_profiles` - профілі з ліміт калорій
- [ ] `user_strava_tokens` - Strava OAuth токени
- [ ] `user_fcm_tokens` - Firebase токени
- [ ] `user_notification_settings` - налаштування нотифікацій
- [ ] `genre_nodes` - музичні жанри
- [ ] `user_genre_progress` - прогрес користувача по жанрах
- [ ] `user_genre_comments` - коментарі до жанрів
- [ ] `activities` - активності
- [ ] `user_daily_activities` - виконання щоденних активностей
- [ ] `user_fitness_data` - дані з Strava (кроки, калорії)
- [ ] `user_strava_activities` - деталі активностей Strava
- [ ] `food_log_entries` - щоденник харчування
- [ ] `user_points` - баланс очок
- [ ] `user_points_history` - історія нарахувань
- [ ] `user_streaks` - streak система
- [ ] `user_levels` - рівні та титули
- [ ] `challenges` - челенджі
- [ ] `user_challenges` - прогрес по челенджах
- [ ] `rewards` - нагороди
- [ ] `user_rewards` - покупки нагород
- [ ] `badges` - бейджі
- [ ] `user_badges` - отримані бейджі
- [ ] `user_comparisons` - порівняння гравців

### Seeders
- [ ] Адмін користувач
- [ ] Тестові користувачі
- [ ] Базові активності
- [ ] Приклади жанрів (10-15 для тесту)
- [ ] Базові челенджі
- [ ] Базові нагороди
- [ ] Бейджі

## Етап 3: Backend API ✅

### Authentication
- [ ] `POST /api/auth/strava` - redirect на OAuth
- [ ] `GET /api/auth/strava/callback` - обробка callback
- [ ] `POST /api/auth/logout`
- [ ] `POST /api/auth/strava/refresh` - оновлення токена
- [ ] Middleware для перевірки auth

### User Routes
- [ ] `GET /api/user/profile`
- [ ] `PUT /api/user/profile`
- [ ] `GET /api/user/stats`
- [ ] `GET /api/user/fitness-data`
- [ ] `POST /api/user/fitness-data/sync`
- [ ] `PUT /api/user/notification-settings`
- [ ] `POST /api/user/fcm-token`

### Genre Tree Routes
- [ ] `GET /api/genres` - список жанрів (з прогресом)
- [ ] `GET /api/genres/{id}` - деталі жанру
- [ ] `POST /api/genres/{id}/complete` - відмітити пройдений
- [ ] `POST /api/genres/{id}/comment` - додати коментар
- [ ] `GET /api/genres/{id}/comments`

### Admin Genre Routes
- [ ] `POST /api/admin/genres`
- [ ] `PUT /api/admin/genres/{id}`
- [ ] `DELETE /api/admin/genres/{id}`

### Activities Routes
- [ ] `GET /api/activities/daily` - щоденні активності
- [ ] `POST /api/activities/{id}/complete`

### Admin Activities Routes
- [ ] `POST /api/admin/activities`
- [ ] `PUT /api/admin/activities/{id}`
- [ ] `DELETE /api/admin/activities/{id}`

### Food Log Routes
- [ ] `GET /api/food-log` - записи (з фільтром по даті)
- [ ] `POST /api/food-log` - додати запис
- [ ] `PUT /api/food-log/{id}` - редагувати
- [ ] `DELETE /api/food-log/{id}` - видалити
- [ ] `GET /api/food-log/today-summary` - підсумок
- [ ] `POST /api/food-log/analyze-text` - аналіз через Claude
- [ ] `POST /api/food-log/analyze-image` - аналіз фото

### Points & Rewards Routes
- [ ] `GET /api/points/balance`
- [ ] `GET /api/points/history`
- [ ] `GET /api/rewards`
- [ ] `POST /api/rewards/{id}/purchase`

### Admin Rewards Routes
- [ ] `POST /api/admin/rewards`
- [ ] `PUT /api/admin/rewards/{id}`
- [ ] `DELETE /api/admin/rewards/{id}`

### Challenges Routes
- [ ] `GET /api/challenges`
- [ ] `GET /api/challenges/my`

### Admin Challenges Routes
- [ ] `POST /api/admin/challenges`
- [ ] `PUT /api/admin/challenges/{id}`
- [ ] `DELETE /api/admin/challenges/{id}`

### Comparisons Routes
- [ ] `GET /api/comparisons` - порівняння гравців

### Webhooks
- [ ] `POST /api/webhooks/strava` - Strava webhook
- [ ] `GET /api/webhooks/strava/verify` - верифікація

## Етап 4: Services ✅

### StravaService
- [ ] OAuth flow (authorize, callback, refresh token)
- [ ] Fetch athlete profile
- [ ] Fetch activities (з фільтром по даті)
- [ ] Calculate steps from distance
- [ ] Aggregate daily data
- [ ] Post comments to activities (опціонально)
- [ ] Handle webhook events

### YouTubeService
- [ ] Extract playlist ID from URL
- [ ] Fetch playlist info
- [ ] Fetch playlist tracks
- [ ] Generate embed URL

### ClaudeService
- [ ] Analyze food from text
- [ ] Analyze food from image (base64)
- [ ] Parse response and extract calories
- [ ] Handle errors and low confidence

### FCMService
- [ ] Send push notification
- [ ] Send to single token
- [ ] Send to multiple tokens
- [ ] Handle invalid tokens
- [ ] Send data payload

### PointsService
- [ ] Award points (з reason та related entity)
- [ ] Deduct points
- [ ] Check balance
- [ ] Calculate level from genres count
- [ ] Check and award streak bonuses

### StreakService
- [ ] Update streak (increment/reset)
- [ ] Check milestone achievements
- [ ] Award streak bonuses
- [ ] Unlock side quests at 3-day streak

### ChallengeService
- [ ] Check challenge completion
- [ ] Update progress
- [ ] Award challenge rewards
- [ ] Trigger notifications

## Етап 5: Jobs ✅

### Scheduled Jobs (Laravel Schedule)
- [ ] `SyncStravaData` - кожні 10 хв
- [ ] `RefreshStravaTokens` - кожні 15 хв
- [ ] `CreateDailyActivities` - о 6:00
- [ ] `UnlockNewGenres` - о 6:00
- [ ] `UpdateStreaks` - о 6:00
- [ ] `AwardStreakBonuses` - о 6:00
- [ ] `CheckChallenges` - кожну годину
- [ ] `SendDailyReminders` - за розкладом користувача
- [ ] `SendIncompleteActivitiesReminder` - о 22:00
- [ ] `SendAdminDailyReport` - о 23:00
- [ ] `CheckCalorieLimitWarning` - о 20:00

### Queue Jobs
- [ ] `SendPushNotification` - для асинхронної відправки FCM
- [ ] `AnalyzeFoodImage` - для Claude API
- [ ] `ProcessStravaWebhook` - обробка webhook

## Етап 6: Notifications ✅

### User Notifications
- [ ] `DailyReminderNotification` - щоденне нагадування
- [ ] `IncompleteActivitiesNotification` - незавершені активності
- [ ] `NewLevelAchievedNotification` - новий рівень
- [ ] `SideQuestUnlockedNotification` - сайд-квест
- [ ] `StreakBonusNotification` - бонус за streak
- [ ] `NewChallengeNotification` - новий челендж
- [ ] `ChallengeCompletedNotification` - виконаний челендж
- [ ] `CalorieLimitWarningNotification` - попередження
- [ ] `CalorieLimitExceededNotification` - перевищення

### Admin Notifications
- [ ] `UserDailyReportNotification` - звіт про активність
- [ ] `UserInactivityWarningNotification` - неактивність 2 дні
- [ ] `CalorieOverageWarningNotification` - перевищення 3 дні

### Custom Notification Channels
- [ ] `FCMChannel` - для Firebase push
- [ ] `StravaCommentChannel` - для коментарів в Strava (опціонально)

## Етап 7: Frontend Components ✅

### Layout Components
- [ ] `Layout` - основний layout з navigation
- [ ] `Header` - header з user menu
- [ ] `Sidebar` - sidebar navigation (для десктопу)
- [ ] `BottomNav` - bottom navigation (для мобільного)
- [ ] `LoadingSpinner` - loader
- [ ] `ErrorBoundary` - error handling

### Auth Components
- [ ] `LoginPage` - сторінка логіну з Strava
- [ ] `StravaCallback` - обробка OAuth callback
- [ ] `ProtectedRoute` - захищені роути

### Dashboard Components
- [ ] `Dashboard` - головна сторінка
- [ ] `UserStatsWidget` - рівень, очки, streak
- [ ] `CalorieBalanceWidget` - баланс калорій
- [ ] `FitnessDataWidget` - кроки, дистанція з Strava
- [ ] `DailyActivitiesWidget` - чекбокси активностей
- [ ] `PermanentRulesWidget` - безстрокові правила

### Genre Tree Components
- [ ] `GenreTreePage` - сторінка з деревом
- [ ] `GenreTreeCanvas` - 2D canvas з React Flow
- [ ] `GenreNode` - окремий вузол дерева
- [ ] `GenreDetailModal` - модальне вікно з деталями
- [ ] `YouTubePlayer` - вбудований плеєр
- [ ] `StartMusicWalkButton` - кнопка запуску прогулянки
- [ ] `GenreComments` - секція коментарів
- [ ] `CommentForm` - форма додавання коментаря

### Food Log Components
- [ ] `FoodLogPage` - сторінка щоденника
- [ ] `FoodLogForm` - форма додавання
- [ ] `TextInput` - текстовий ввід
- [ ] `PhotoInput` - камера/завантаження фото
- [ ] `MealTypeSelector` - вибір типу прийому їжі
- [ ] `AnalysisResult` - результат аналізу Claude
- [ ] `FoodLogEntry` - окремий запис
- [ ] `FoodLogList` - список записів
- [ ] `DailySummary` - підсумок за день
- [ ] `CalorieChart` - графік калорій
- [ ] `CalendarView` - календар для історії

### Profile Components
- [ ] `ProfilePage` - сторінка профілю
- [ ] `UserAvatar` - аватар користувача
- [ ] `LevelBadge` - бейдж рівня
- [ ] `StatsCard` - картка статистики
- [ ] `PointsHistory` - історія очок
- [ ] `StravaActivityChart` - графік активностей
- [ ] `NotificationSettings` - налаштування нотифікацій
- [ ] `ManualSyncButton` - кнопка синхронізації

### Gamification Components
- [ ] `RewardsPage` - магазин нагород
- [ ] `RewardCard` - картка нагороди
- [ ] `PurchaseModal` - модальне вікно покупки
- [ ] `ChallengesPage` - сторінка челенджів
- [ ] `ChallengeCard` - картка челенджу
- [ ] `ProgressBar` - прогрес бар
- [ ] `BadgesPage` - сторінка бейджів
- [ ] `BadgeCard` - картка бейджа

### Comparison Components
- [ ] `ComparisonPage` - порівняння гравців
- [ ] `PlayerCard` - картка гравця
- [ ] `ComparisonTable` - таблиця порівняння

### Admin Components
- [ ] `AdminLayout` - layout для адміна
- [ ] `AdminDashboard` - панель адміна
- [ ] `GenreManager` - управління жанрами
- [ ] `GenreEditor` - редактор жанру
- [ ] `GenreTreeEditor` - візуальний редактор дерева
- [ ] `ActivityManager` - управління активностями
- [ ] `ActivityEditor` - редактор активності
- [ ] `RewardManager` - управління нагородами
- [ ] `RewardEditor` - редактор нагороди
- [ ] `ChallengeManager` - управління челенджами
- [ ] `ChallengeEditor` - редактор челенджу
- [ ] `UserStatsViewer` - статистика користувачів
- [ ] `UserDetailsModal` - деталі користувача
- [ ] `UserFoodLogViewer` - перегляд щоденника

## Етап 8: Styling ✅

### Theme Setup
- [ ] Налаштувати TailwindCSS config
- [ ] Створити темну палітру кольорів (ninja style)
- [ ] Додати японські шрифти
- [ ] Налаштувати breakpoints для адаптивності

### Custom Styles
- [ ] Стилі для ninja theme (темний + червоний/золотий)
- [ ] Анімації та transitions
- [ ] Паралакс ефекти
- [ ] Японські орнаменти (SVG)
- [ ] Кастомні іконки ніндзя

### Responsive Design
- [ ] Mobile-first підхід
- [ ] Breakpoints: mobile, tablet, desktop
- [ ] Touch-friendly елементи
- [ ] Adaptive navigation

## Етап 9: PWA Setup ✅

### Service Worker
- [ ] Створити `service-worker.js`
- [ ] Налаштувати кешування
- [ ] Обробка offline режиму
- [ ] Background sync для форм
- [ ] FCM message handling

### Manifest
- [ ] `manifest.json` з метаданими
- [ ] Іконки різних розмірів (192x192, 512x512)
- [ ] Theme color та background color
- [ ] Display mode: standalone
- [ ] Start URL

### Firebase Setup
- [ ] Ініціалізація Firebase SDK
- [ ] Запит дозволу на нотифікації
- [ ] Отримання FCM token
- [ ] Відправка token на backend
- [ ] Слухання foreground messages

## Етап 10: Integration & Testing ✅

### Integration Tests
- [ ] Strava OAuth flow
- [ ] Strava data sync
- [ ] YouTube API integration
- [ ] Claude API (text and image)
- [ ] FCM push delivery
- [ ] Webhook processing

### Unit Tests
- [ ] Services tests
- [ ] Model tests
- [ ] Controller tests
- [ ] Points calculation logic
- [ ] Streak logic
- [ ] Challenge completion logic

### E2E Tests (опціонально)
- [ ] User registration flow
- [ ] Complete daily activities
- [ ] Add food log entry
- [ ] Purchase reward
- [ ] Complete challenge

### Manual Testing Checklist
- [ ] OAuth login працює
- [ ] Дані з Strava синхронізуються
- [ ] Музичне дерево відображається
- [ ] Жанри розблоковуються правильно
- [ ] Щоденні активності створюються
- [ ] Очки нараховуються коректно
- [ ] Streak оновлюється
- [ ] Челенджі перевіряються
- [ ] Нотифікації приходять
- [ ] Фото їжі аналізується
- [ ] Калорії рахуються правильно
- [ ] Адмін панель працює

## Етап 11: Documentation ✅

### Technical Docs
- [ ] `docs/API.md` - повна API документація з прикладами
- [ ] `docs/DEVELOPMENT.md` - гайд розробника
- [ ] `docs/DEPLOYMENT.md` - інструкції деплою
- [ ] `docs/ARCHITECTURE.md` - архітектура системи

### Code Documentation
- [ ] PHPDoc для всіх public методів
- [ ] JSDoc для складних функцій
- [ ] README для кожного модуля
- [ ] Inline коментарі для складної логіки

### Deployment Docs
- [ ] Інструкції налаштування Digital Ocean
- [ ] SSL сертифікат setup
- [ ] Environment variables setup
- [ ] Database backup strategy
- [ ] Monitoring та logging

## Етап 12: Optimization ✅

### Backend Optimization
- [ ] Database indexing (всі foreign keys, часто запитувані поля)
- [ ] Query optimization (eager loading)
- [ ] Redis caching (жанри, статистика)
- [ ] Queue optimization (пріоритети)
- [ ] API rate limiting

### Frontend Optimization
- [ ] Code splitting по роутах
- [ ] Lazy loading компонентів
- [ ] Image optimization (WebP, compression)
- [ ] Bundle size optimization
- [ ] React.memo для важких компонентів

### Performance Monitoring
- [ ] Laravel Telescope (для dev)
- [ ] Laravel Horizon (для queues)
- [ ] Sentry для error tracking (опціонально)
- [ ] Google Analytics (опціонально)

## Етап 13: Security ✅

### Backend Security
- [ ] CORS налаштування
- [ ] Rate limiting на API
- [ ] Input validation всюди
- [ ] SQL injection prevention (Eloquent)
- [ ] XSS prevention
- [ ] CSRF protection (Sanctum)
- [ ] Encryption для sensitive data (Strava tokens)

### Frontend Security
- [ ] Secure storage для tokens (httpOnly cookies ідеально)
- [ ] XSS prevention в React
- [ ] Content Security Policy
- [ ] HTTPS only
- [ ] Secure Service Worker

### API Keys Security
- [ ] Всі ключі в .env
- [ ] Не commit .env в git
- [ ] Rotate keys періодично
- [ ] Monitor API usage

## Final Checklist 🎯

### Pre-deployment
- [ ] Всі environment variables налаштовані
- [ ] SSL сертифікат встановлений
- [ ] Database backed up
- [ ] All tests passing
- [ ] Performance tested
- [ ] Security audit done

### Deployment
- [ ] Deploy на Digital Ocean
- [ ] Setup domain (melody.ninja)
- [ ] Configure firewall
- [ ] Setup monitoring
- [ ] Setup automated backups

### Post-deployment
- [ ] Test production environment
- [ ] Monitor logs
- [ ] Check FCM delivery
- [ ] Verify webhooks
- [ ] Test all integrations

---

## 🚀 Готово до старту!

Використовуй цей checklist як дорожню карту. Після кожного виконаного пункту ставь ✅.

**Порада:** Починай з MVP (Фази 1-2), тестуй, потім додавай наступні фази.