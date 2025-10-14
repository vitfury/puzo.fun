# Melody Ninja - Technical Specification

## Project Overview
Melody Ninja is a gamified music discovery and fitness tracking web application designed to motivate a 13-year-old to stay active through music exploration. Users progress through a skill-tree of music genres, earning points for completing daily activities and walks while listening to curated playlists.

**Domain:** melody.ninja  
**Target User:** Teenagers (13+) with focus on fitness motivation through music

## Tech Stack
- **Backend:** Laravel 11+ (PHP 8.2+)
- **Frontend:** React 18+ with TypeScript
- **Database:** MySQL 8+ (or PostgreSQL 15+)
- **Infrastructure:** Docker Compose for local development and deployment
- **Authentication:** Google OAuth 2.0
- **External APIs:** Strava API, Google Fit/Health Connect, YouTube API, Claude AI API
- **Deployment:** Digital Ocean

## Core Features

### 1. Music Genre Skill Tree
- 2D interactive map with pan/zoom navigation (like Google Maps)
- Tree-like structure where genres branch from parent genres
- Each genre node contains: name, markdown/HTML description, YouTube playlist embed, year of origin
- Users unlock new genres by completing the previous day's activity
- Progress tracking per user (completed/available status)
- Admin can create/edit/delete genres with parent-child relationships

### 2. User Roles & Authentication
- **User Role:** Tracks activities, explores music, earns points
- **Admin Role:** Manages activities, genres, challenges, rewards, views all user stats
- Login via Google OAuth (primary)
- Strava connection optional (in profile settings)

### 3. Activity Tracking System
**Three activity types:**
- **Daily Tasks** (checkbox): Morning exercise, breakfast, get fruit, music walk
- **Ongoing Rules** (no checkbox, just reminders): No sugary drinks, water before meals, one portion per meal, max 1 sweet per day
- **Music Walk** (special highlight): Main activity that unlocks genre progression

**Activity Management:**
- Admin can add/remove/edit activities
- Admin can schedule activities to appear on specific dates
- Activities reset daily at 6:00 AM
- Streak tracking (consecutive days completed)

### 4. Fitness Integration
- **Google Fit/Health Connect** (Android): Real-time step count, calories burned (updates every 10 min)
- **Strava** (optional): Activity tracking for walks/runs
- Display in user profile: daily steps, calories, walk duration
- Minimum goal: Complete playlist (40-60 minutes, ~15-20 songs)

### 5. Food Diary & Calorie Tracking
- Users log meals via text or photo (camera access from browser)
- Photos/text sent to Claude AI API for calorie estimation
- Daily calorie limit set by admin per user
- Profile shows remaining calories for the day

### 6. Gamification System
**Points:**
- Admin assigns point values per activity
- Bonus: +10 points per 1,000 steps
- Enhanced rewards for streaks (e.g., 3-day streak unlocks side quests)

**Levels & Titles:**
- User levels up based on completed genres
- Each level has a title (Beginner → Music Lover → Rock Expert → Legend)
- Avatar changes with each new title (ninja-themed)

**Side Quests:**
- Unlocked after 3-day streak
- Feature genre-blending artists/groups
- Same structure as regular genres (description, playlist, etc.)

**Challenges:**
- JSON-configurable challenge system
- Types: streak-based, count-based, activity-based, combined
- Admin assigns challenges to users

**Rewards Shop:**
- Users spend points on rewards (name, price, image)
- Rewards can be purchased multiple times
- Admin manages reward catalog

### 7. Social Features
- Multiple users can view each other's progress (2+ players compete)
- Users can comment on genres they've explored
- Leaderboard showing points, genres completed, streaks

### 8. Notifications
- **PWA** (Progressive Web App) with Web Push API
- Notifications for: daily activity reminders, new genres unlocked, challenge completion
- Fallback: Email notifications if push unavailable

### 9. Admin Dashboard
- Manage users, activities, genres, challenges, rewards
- View all user statistics (steps, calories, completed genres, points)
- Schedule activities for future dates
- Edit genre tree structure

## Design Guidelines
**Theme:** Dark ninja aesthetic with gamified Japanese cartoon style
- Dark color palette with accent colors
- Ninja-themed avatars
- Anime/manga-inspired UI elements
- Mobile-first responsive design
- Smooth animations and transitions

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

## External API Integration Notes
- **YouTube:** Embed playlists via iframe, fetch metadata if needed
- **Strava:** OAuth flow, webhook for activity updates
- **Google Fit:** Health Connect API for Android step/calorie data
- **Claude AI:** Vision API for food image analysis, structured output for calorie estimation

## Deployment
- Docker Compose with services: Laravel (PHP-FPM), Nginx, MySQL, Redis (queue/cache)
- Environment variables for API keys and secrets
- Laravel queue worker for background jobs (API calls, notifications)
- Scheduled tasks (cron) for daily resets at 6:00 AM