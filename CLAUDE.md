# Melody Ninja - Technical Specification

## Project Overview
Melody Ninja is a gamified music discovery and fitness tracking web application designed to motivate a 13-year-old to stay active through music exploration. Users progress through a skill-tree of music genres, earning points for completing daily activities and walks while listening to curated playlists.

**Domain:** melody.ninja  
**Target User:** Teenagers (13+) with focus on fitness motivation through music

## Tech Stack
- **Backend:** Laravel 11.46.1 (PHP 8.3-FPM) ✅
- **Frontend:** React 18 + TypeScript + Vite ✅
- **Internationalization:** i18next + react-i18next (EN/UK) ✅
- **Database:** MySQL 8.0 ✅
- **Cache/Queue:** Redis 7 ✅
- **Web Server:** Nginx (reverse proxy) ✅
- **Infrastructure:** Docker Compose (7 services) ✅
- **Authentication:** Laravel Sanctum (ready for Google OAuth)
- **External APIs:** Strava, Google Fit, YouTube, Claude AI
- **Deployment:** Digital Ocean


## Design Guidelines
**Theme:** Dark ninja aesthetic with gamified Japanese cartoon style
- Dark color palette with accent colors
- Ninja-themed avatars
- Anime/manga-inspired UI elements
- Mobile-first responsive design
- Smooth animations and transitions

**Internationalization (CRITICAL!):**
- **ALL UI must be bilingual: English (EN) and Ukrainian (UK)**
- Use i18next/react-i18next for translations
- All user-facing text MUST come from translation files
- Language switcher with flag icons (🇬🇧 / 🇺🇦) in navigation
- Store language preference in localStorage
- Translation files: `/frontend/src/i18n/locales/{en,uk}.json`
- NEVER hardcode user-facing strings - always use `t('key')`

## Database Schema Principles
**Key tables:**
- `users` (id, name, email, role, google_id, strava_id, avatar_level, total_points, daily_calorie_limit)
- `genres` (id, parent_id, name, description, playlist_url, year, order_index)
- `user_genre_progress` (user_id, genre_id, completed_at, is_available)
- `activities` (id, name, type, points, active_from, active_to)
- `user_activity_log` (user_id, activity_id, completed_at)
- `daily_stats` (user_id, date, steps, calories_burned, calories_consumed)
- `food_log` (user_id, entry_text, image_url, estimated_calories, created_at)
- `rewards` (id, name, price, image_url)
- `user_rewards` (user_id, reward_id, purchased_at)
- `challenges` (id, name, type, config_json, points_reward)
- `user_challenges` (user_id, challenge_id, progress, completed_at)
- `genre_comments` (user_id, genre_id, comment, created_at)

## Code Style & Conventions
- **Laravel:** Follow PSR-12, use service classes for business logic, repositories for data access
- **React:** Functional components with hooks, TypeScript strict mode, organized by feature folders
- **Naming:** camelCase (JS/TS), snake_case (PHP/DB), PascalCase (components/classes)
- **API:** RESTful endpoints, use Laravel API resources for responses
- **State Management:** React Context API for global state, React Query for server state
- **Components:** Atomic design (atoms/molecules/organisms)

## Development Priorities
1. **Iterative development:** Build features incrementally, starting with core functionality
2. **Database-first:** Design schema to accommodate future features without major refactoring
3. **Reusable components:** Build UI components that can be extended/styled rather than rewritten
4. **API-first backend:** Design endpoints to support current and planned features
5. **Mobile-first UI:** Ensure all features work seamlessly on mobile devices

## Important Notes for Claude
- Always consider the end-goal architecture when implementing features
- Write code that can be extended without major refactoring
- Prioritize mobile UX in all frontend decisions
- Keep backend API endpoints flexible and well-documented
- Use TypeScript interfaces that match Laravel API resources
- Implement proper error handling and loading states
- Consider offline functionality for PWA features
- Write clean, self-documenting code with minimal comments
- Focus on performance (lazy loading, code splitting, optimized queries)

## API Conventions (IMPORTANT!)
⚠️ **See [API_CHECKLIST.md](API_CHECKLIST.md) for detailed reference**

**Frontend API Client:**
- `apiClient` baseURL is `http://localhost/api/v1` (includes `/api/v1`)
- All API methods should use paths WITHOUT `/v1/` prefix
- ✅ Correct: `apiClient.get('/activities/today')`
- ❌ Wrong: `apiClient.get('/v1/activities/today')` → causes `/api/v1/v1/` double prefix

**Backend Routes:**
- All routes in `routes/api.php` are wrapped in `Route::prefix('v1')`
- Define routes WITHOUT `/v1/` prefix
- ✅ Correct: `Route::get('/activities/today', ...)`
- ❌ Wrong: `Route::get('/v1/activities/today', ...)`


## Current Setup (Features 1.1, 1.2, 2.1-2.3, 3.1-3.5 Complete)

### Docker Services (All Running ✅)
1. **nginx** - Reverse proxy (ports 80, 443)
2. **php** - Laravel 11 with PHP 8.3-FPM
3. **mysql** - MySQL 8.0 database
4. **redis** - Cache and queue backend
5. **frontend** - Vite dev server with HMR (port 5173)
6. **queue** - Laravel queue worker
7. **scheduler** - Cron tasks (daily reset at 6:00 AM)

### API Structure ✅
- **Base URL:** `/api/v1/...`
- **Health Check:** GET `/api/v1/health` (checks DB, Redis, API)
- **CORS:** Configured for React frontend (localhost:5173)
- **Authentication:** Laravel Sanctum (email/password login) ✅
  - POST `/api/v1/auth/register` - Register new user
  - POST `/api/v1/auth/login` - Login with email/password
  - POST `/api/v1/auth/logout` - Logout (protected)
  - GET `/api/v1/auth/me` - Get current user (protected)
- **Protected Routes:** Use `auth:sanctum` middleware

### Quick Start
```bash
make install  # First time setup
make up       # Start services
make logs     # View logs
```

### Access Points
- Frontend: http://localhost:5173
- Backend API: http://localhost/api/v1/health

### Authentication & User System ✅
**Backend:**
- User model with roles (user/admin), avatar_level, total_points
- Sanctum authentication (Bearer tokens)
- Auth endpoints: register, login, logout, me
- Validation: LoginRequest, RegisterRequest
- UserResource for API responses

**Frontend:**
- AuthContext for global auth state
- ProtectedRoute component for route guards
- Pages: LoginPage, RegisterPage, ProfilePage
- API client with axios interceptors
- Dark ninja-themed UI with Tailwind CSS
- Bilingual UI with language switcher (EN/UK) ✅

**Test Accounts:**
- Regular User: test@melody.ninja / password
- Admin User: admin@melody.ninja / admin123

### Activity System ✅
**Backend:**
- Models: Activity, UserActivityLog, DailyStat
- Activity types: daily_task, ongoing_rule, music_walk
- Endpoints: `/api/v1/activities/today`, `/api/v1/activities/{id}/complete`, `/api/v1/activities/history`
- Admin CRUD: `/api/v1/admin/activities` (index, store, show, update, destroy)
- Points tracking, daily stats aggregation
- 8 seeded activities (5 daily tasks, 2 ongoing rules, 1 music walk)
- **Streak tracking**: current_streak, longest_streak, last_activity_date
- **Daily reset command**: `activities:daily-reset` runs at 6:00 AM
- Automatic streak calculation and break detection
- **Activity scheduling**: `active_from` and `active_to` date fields for time-based availability
- Automatic filtering by date in `/activities/today` endpoint

**Frontend:**
- ActivitiesPage with daily checklist
- Components: ActivityCheckbox, ActivityGroup, DailyActivityChecklist
- Real-time points update on completion
- Grouped by type with progress stats
- **Streak display**: 🔥 indicator on activities and profile pages
- Route: /activities

**Admin Panel:** ✅
- AdminActivitiesPage with full CRUD
- Calendar-based scheduling with native HTML5 date inputs
- Date range picker (active_from, active_to) with validation
- Dark-themed date picker UI
- Inline editing and creation forms
- Clear date buttons for easy reset
- Bilingual interface (EN/UK)
- Route: /admin/activities
- See [ADMIN_ACTIVITIES_GUIDE.md](ADMIN_ACTIVITIES_GUIDE.md) for details

## Next Development Steps
- Feature 2.4: Google OAuth Integration
- Feature 4.x: Genre System (skill tree)
- Feature 5.x: Food Diary & Calorie Tracking