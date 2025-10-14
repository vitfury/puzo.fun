# Melody Ninja - Epic Breakdown

## Priority Legend
- 🔴 **P0** - Critical MVP, must have first
- 🟠 **P1** - Important, needed for launch
- 🟡 **P2** - Nice to have, can wait
- 🟢 **P3** - Future enhancement

---

## Epic 1: Project Setup & Infrastructure 🔴 P0

### Feature 1.1: Docker Environment Setup
**Goal:** Create reproducible development environment
- Set up Docker Compose with Laravel, MySQL, Redis, Nginx
- Configure PHP 8.2+, Node 18+
- Add hot-reload for React development
- Create `.env.example` with all required variables
- Write `README.md` with setup instructions

**Deliverable:** `docker-compose up` runs entire stack

---

### Feature 1.2: Laravel Base Project
**Goal:** Initialize Laravel backend with authentication
- Install Laravel 11 with API scaffolding
- Configure database connections
- Set up CORS for React frontend
- Install Laravel Sanctum for API authentication
- Create base API structure (`/api/v1/...`)

**Deliverable:** Laravel API responds to health check endpoint

---

### Feature 1.3: React Frontend Setup
**Goal:** Initialize React app with routing and basic layout
- Create React + TypeScript + Vite project
- Install React Router, Axios, TanStack Query
- Set up Tailwind CSS with dark theme configuration
- Create base layout component (header, sidebar, main)
- Configure API client with baseURL

**Deliverable:** React app loads with routing and API connectivity

---

## Epic 2: Authentication & User Management 🔴 P0

### Feature 2.1: Google OAuth Backend
**Goal:** Enable Google login
- Set up Google OAuth 2.0 credentials
- Create Laravel Socialite integration
- Implement `/auth/google` and `/auth/google/callback` endpoints
- Generate JWT/Sanctum tokens on successful login
- Create `users` table migration (id, email, name, role, google_id)

**Deliverable:** API endpoint that accepts Google OAuth and returns auth token

---

### Feature 2.2: Google OAuth Frontend
**Goal:** Login page with Google button
- Create login page component
- Implement Google OAuth flow (redirect → callback)
- Store auth token in localStorage
- Add protected route wrapper
- Create logout functionality

**Deliverable:** Users can log in with Google and access protected routes

---

### Feature 2.3: User Profile Page (Basic)
**Goal:** Display user information
- Create profile page component
- Show user name, email, avatar
- Display role (User/Admin)
- Add logout button

**Deliverable:** Profile page shows authenticated user data

---

## Epic 3: Activity System 🔴 P0

### Feature 3.1: Activity Database Schema
**Goal:** Design activity tracking system
- Create `activities` table (id, name, type, points, active_from, active_to)
- Create `user_activity_log` table (user_id, activity_id, completed_at, date)
- Create `daily_stats` table (user_id, date, steps, calories_burned, calories_consumed, created_at)
- Add type enum: 'daily_task', 'ongoing_rule', 'music_walk'

**Deliverable:** Migrations create activity tables

---

### Feature 3.2: Activity API Endpoints
**Goal:** CRUD operations for activities
- `GET /api/v1/activities/today` - Get user's activities for today
- `POST /api/v1/activities/{id}/complete` - Mark activity as complete
- `GET /api/v1/activities/history` - Get completion history
- Admin endpoints: `POST/PUT/DELETE /api/v1/admin/activities`

**Deliverable:** API endpoints for activity management

---

### Feature 3.3: Daily Activity Checklist UI
**Goal:** Display today's tasks
- Create activity list component with checkboxes
- Group by type (Daily Tasks, Ongoing Rules, Music Walk)
- Highlight music walk activity
- Add check/uncheck functionality
- Show points earned per activity

**Deliverable:** Users see and can complete daily activities

---

### Feature 3.4: Activity Reset Scheduler
**Goal:** Reset activities at 6 AM daily
- Create Laravel scheduled command
- Reset daily activities at 6:00 AM
- Keep completion history in logs
- Calculate and update daily stats

**Deliverable:** Activities auto-reset every morning

---

### Feature 3.5: Streak Tracking
**Goal:** Track consecutive completion days
- Add `current_streak` and `longest_streak` to users table
- Calculate streaks in daily reset job
- Display streak counter in UI (🔥 3 days)
- Show streak history graph

**Deliverable:** Users see their current streak

---

## Epic 4: Points & Gamification 🟠 P1

### Feature 4.1: Points System Backend
**Goal:** Award and track points
- Add `total_points` to users table
- Create `point_transactions` table (user_id, amount, reason, created_at)
- Create service class for point management
- Update activity completion to award points
- Add bonus points calculation (+10 per 1k steps)

**Deliverable:** Users earn points for activities

---

### Feature 4.2: Points Display UI
**Goal:** Show points in profile
- Add points counter to header/profile
- Create points history page
- Show point breakdown (activities, steps, bonuses)
- Add animations for point gains

**Deliverable:** Users see their total points and recent transactions

---

### Feature 4.3: Levels & Titles System
**Goal:** User progression with titles
- Add `level` and `title` to users table
- Create `levels` config (level requirements, title names)
- Calculate level based on completed genres (added later)
- Display level badge in profile
- Show progress to next level

**Deliverable:** Users have levels and titles (initially level 1)

---

### Feature 4.4: Avatar System
**Goal:** Visual representation of level
- Add `avatar_url` to users table
- Create avatar component
- Store avatar images for each level
- Update avatar on level up
- Display avatar in profile and leaderboard

**Deliverable:** Users have ninja-themed avatars that change with level

---

## Epic 5: Genre Skill Tree 🔴 P0

### Feature 5.1: Genre Database Schema
**Goal:** Create genre tree structure
- Create `genres` table (id, parent_id, name, description, playlist_url, year, x_position, y_position, order_index)
- Create `user_genre_progress` table (user_id, genre_id, completed_at, is_available)
- Create `genre_comments` table (user_id, genre_id, comment, created_at)

**Deliverable:** Migrations create genre tables

---

### Feature 5.2: Genre API Endpoints
**Goal:** CRUD and progression endpoints
- `GET /api/v1/genres/tree` - Get full genre tree with user progress
- `GET /api/v1/genres/{id}` - Get single genre details
- `POST /api/v1/genres/{id}/complete` - Mark genre as explored
- `POST /api/v1/genres/{id}/comments` - Add comment
- Admin endpoints: `POST/PUT/DELETE /api/v1/admin/genres`

**Deliverable:** API for genre management and progress tracking

---

### Feature 5.3: Genre Unlock Logic
**Goal:** Progressive unlocking based on activity completion
- Check if user completed music walk today
- Unlock child genres of completed genres
- Prevent unlocking if previous day was skipped
- Create service class for unlock logic

**Deliverable:** Genres unlock after daily completion

---

### Feature 5.4: Admin Genre Manager UI
**Goal:** Interface to create/edit genres
- Create admin dashboard page
- Genre creation form (name, description editor, playlist URL, year, parent selection)
- Description editor with markdown/HTML support and image upload
- Visual tree preview
- Drag-and-drop to set position on map

**Deliverable:** Admin can manage genre tree without touching database

---

### Feature 5.5: 2D Genre Map (Basic)
**Goal:** Display genre tree as interactive map
- Create map component with pan/zoom (use react-zoom-pan-pinch or similar)
- Display genre nodes as cards/circles
- Show locked/unlocked states
- Draw lines connecting parent-child relationships
- Add timeline on left side (year indicators)

**Deliverable:** Users see genre map and can navigate it

---

### Feature 5.6: Genre Detail Modal
**Goal:** Show genre information
- Create modal component
- Display genre name, year, description (render markdown/HTML)
- Embed YouTube playlist (iframe)
- Show "Mark as Explored" button
- Display comments section

**Deliverable:** Users can view genre details and playlists

---

### Feature 5.7: Genre Comments
**Goal:** Social feature for genre feedback
- Add comment form in genre modal
- Display all comments with user names
- Real-time updates (optional: WebSocket or polling)
- Admin can moderate/delete comments

**Deliverable:** Users can comment on genres

---

## Epic 6: Fitness Integration 🟠 P1

### Feature 6.1: Strava OAuth Connection
**Goal:** Connect Strava account
- Set up Strava OAuth app credentials
- Add `strava_id`, `strava_access_token`, `strava_refresh_token` to users table
- Create `/auth/strava` and `/auth/strava/callback` endpoints
- Add "Connect Strava" button in profile settings
- Store tokens securely

**Deliverable:** Users can connect Strava accounts

---

### Feature 6.2: Google Fit Integration
**Goal:** Fetch step count and calories
- Set up Google Fit API credentials
- Implement Health Connect API for Android
- Create service to fetch daily steps/calories every 10 minutes
- Store data in `daily_stats` table
- Create Laravel job for periodic sync

**Deliverable:** Step count and calories auto-update in profile

---

### Feature 6.3: Fitness Dashboard Widget
**Goal:** Display fitness stats in profile
- Create widget component showing today's steps, calories burned
- Add progress bar to daily step goal (e.g., 5,000 steps)
- Display walk duration (calculated from Strava activities)
- Add mini-chart for last 7 days

**Deliverable:** Users see real-time fitness data in profile

---

### Feature 6.4: Step-Based Point Bonuses
**Goal:** Reward walking with points
- Calculate bonus points: +10 per 1,000 steps
- Award points automatically when syncing steps
- Display step bonus in point transactions
- Add notification for milestone steps (5k, 10k)

**Deliverable:** Users earn bonus points for walking

---

## Epic 7: Food Diary & Calorie Tracking 🟠 P1

### Feature 7.1: Food Log Database
**Goal:** Store food entries
- Create `food_log` table (user_id, entry_text, image_url, estimated_calories, created_at)
- Add `daily_calorie_limit` to users table
- Migration to set default limits

**Deliverable:** Database ready for food logging

---

### Feature 7.2: Food Diary UI (Manual Entry)
**Goal:** Let users log food as text
- Create food diary page
- Add text input form for meal description
- Display today's entries in a list
- Show remaining calories counter at top
- Show daily calorie limit vs consumed

**Deliverable:** Users can manually log meals

---

### Feature 7.3: Camera Integration for Food Photos
**Goal:** Capture food images
- Add camera button to food diary
- Implement browser camera API (MediaDevices.getUserMedia)
- Allow photo capture directly from browser
- Upload photo to server storage
- Display photo in food log entry

**Deliverable:** Users can take photos of meals

---

### Feature 7.4: Claude AI Calorie Estimation
**Goal:** Automatic calorie calculation
- Set up Claude AI API integration
- Send food text/image to Claude API
- Parse response to extract calorie estimate
- Update food log entry with estimated calories
- Add "Recalculate" button for manual override

**Deliverable:** AI estimates calories from food descriptions/photos

---

### Feature 7.5: Daily Calorie Summary
**Goal:** Track daily intake
- Calculate total calories consumed today
- Show remaining calories (limit - consumed)
- Add warning if over limit (red color)
- Display calorie history graph (last 7 days)

**Deliverable:** Users see daily calorie intake vs limit

---

### Feature 7.6: Admin Calorie Limit Management
**Goal:** Set individual user limits
- Add calorie limit field to user edit form in admin
- Allow admin to update limits per user
- Log limit changes for history

**Deliverable:** Admin can set custom calorie limits

---

## Epic 8: Challenges System 🟡 P2

### Feature 8.1: Challenge Database Schema
**Goal:** Flexible challenge system
- Create `challenges` table (id, name, description, type, config_json, points_reward, icon)
- Create `user_challenges` table (user_id, challenge_id, progress, completed_at, assigned_at)
- Define challenge types: streak, count, activity, combined

**Deliverable:** Database supports various challenge types

---

### Feature 8.2: Challenge Configuration
**Goal:** JSON-based challenge setup
- Create challenge config JSON schema
- Examples: `{"type": "streak", "days": 7}`, `{"type": "count", "genres": 15}`
- Create Laravel service to validate and process configs
- Add seeders with sample challenges

**Deliverable:** Challenges can be configured via JSON

---

### Feature 8.3: Challenge Assignment API
**Goal:** Admin assigns challenges to users
- `POST /api/v1/admin/challenges` - Create new challenge
- `POST /api/v1/admin/challenges/{id}/assign` - Assign to user(s)
- `GET /api/v1/challenges/my` - Get user's active challenges
- Create background job to check challenge completion

**Deliverable:** Admin can assign challenges, users can view them

---

### Feature 8.4: Challenge Progress Tracking
**Goal:** Update progress automatically
- Hook into activity completion to update challenge progress
- Hook into genre completion for count-based challenges
- Hook into streak updates for streak-based challenges
- Award points when challenge completed

**Deliverable:** Challenge progress updates in real-time

---

### Feature 8.5: Challenge UI
**Goal:** Display active challenges
- Create challenges page/section
- Show active, completed, and available challenges
- Progress bars for each challenge
- Completion animations and notifications

**Deliverable:** Users see their challenges and progress

---

## Epic 9: Side Quests 🟡 P2

### Feature 9.1: Side Quest Database Schema
**Goal:** Separate side quest system
- Create `side_quests` table (id, name, description, playlist_url, unlock_requirement)
- Create `user_side_quest_progress` table (user_id, side_quest_id, unlocked_at, completed_at)

**Deliverable:** Database supports side quests

---

### Feature 9.2: Side Quest Unlock Logic
**Goal:** Unlock after 3-day streak
- Check user streak daily
- Auto-unlock side quests when streak >= 3
- Notify user of new side quest availability

**Deliverable:** Side quests unlock at 3-day streaks

---

### Feature 9.3: Side Quest UI
**Goal:** Display side quests separately from main tree
- Add side quests section to map/separate tab
- Display as special nodes (different visual style)
- Same modal structure as genres (description, playlist)
- Mark as completed functionality

**Deliverable:** Users can explore side quests

---

## Epic 10: Rewards Shop 🟠 P1

### Feature 10.1: Rewards Database
**Goal:** Store available rewards
- Create `rewards` table (id, name, description, price, image_url, is_active)
- Create `user_rewards_purchases` table (user_id, reward_id, purchased_at, points_spent)

**Deliverable:** Database stores rewards catalog

---

### Feature 10.2: Rewards Shop UI
**Goal:** Display purchasable rewards
- Create shop page with reward cards
- Show reward name, image, price
- Display user's current points balance
- Disable purchase button if insufficient points
- Confirmation modal before purchase

**Deliverable:** Users can browse rewards shop

---

### Feature 10.3: Reward Purchase Flow
**Goal:** Complete purchase transaction
- `POST /api/v1/rewards/{id}/purchase` endpoint
- Deduct points from user balance
- Record purchase in `user_rewards_purchases`
- Send notification to admin
- Show success message to user

**Deliverable:** Users can buy rewards with points

---

### Feature 10.4: Admin Reward Management
**Goal:** Manage reward catalog
- Add reward creation/edit form in admin
- Upload reward images
- Set prices and descriptions
- Activate/deactivate rewards
- View purchase history

**Deliverable:** Admin can manage rewards without code changes

---

### Feature 10.5: Purchase History
**Goal:** Users see their purchases
- Create purchase history page
- Display all purchased rewards with dates
- Show points spent
- Option to "redeem" rewards (mark as claimed)

**Deliverable:** Users can track reward purchases

---

## Epic 11: Social & Leaderboard 🟡 P2

### Feature 11.1: Leaderboard API
**Goal:** Rank users by various metrics
- `GET /api/v1/leaderboard?sort=points` - Top users by points
- Support sorting: points, genres_completed, current_streak, level
- Return top 10 or all users
- Include user's own rank

**Deliverable:** API provides leaderboard data

---

### Feature 11.2: Leaderboard UI
**Goal:** Display competitive rankings
- Create leaderboard page
- Show top users with avatars, names, stats
- Highlight current user's position
- Add filter tabs (points, streaks, genres)
- Responsive design for mobile

**Deliverable:** Users can view leaderboards

---

### Feature 11.3: User Comparison View
**Goal:** Compare stats with other users
- Create comparison page/modal
- Select 2+ users to compare
- Show side-by-side stats (points, genres, streaks, activities)
- Visual charts for comparison

**Deliverable:** Users can compare their progress

---

## Epic 12: Notifications 🟠 P1

### Feature 12.1: PWA Setup
**Goal:** Make app installable
- Create `manifest.json` with app metadata
- Add service worker for offline support
- Configure app icons for mobile
- Add install prompt

**Deliverable:** App can be installed as PWA

---

### Feature 12.2: Web Push Notifications Backend
**Goal:** Send push notifications
- Set up Web Push API with VAPID keys
- Create notifications table (user_id, title, body, sent_at)
- Implement Laravel notification channel for Web Push
- Create notification templates (daily reminder, genre unlocked, challenge completed)

**Deliverable:** Backend can send push notifications

---

### Feature 12.3: Push Notification Frontend
**Goal:** Receive notifications in browser/PWA
- Request notification permission from user
- Subscribe to push notifications (service worker)
- Handle incoming notifications
- Show notification badge/count
- Add notification settings page (enable/disable types)

**Deliverable:** Users receive push notifications

---

### Feature 12.4: Email Notifications Fallback
**Goal:** Alternative to push
- Configure Laravel mail driver
- Create email templates matching push notification types
- Send emails if push notifications unavailable
- Add email preference toggle in settings

**Deliverable:** Users receive email notifications as fallback

---

### Feature 12.5: Daily Activity Reminders
**Goal:** Remind users to complete activities
- Schedule daily reminder notification (e.g., 8 PM)
- Check which activities are incomplete
- Send personalized reminder with activity list
- Skip if all activities completed

**Deliverable:** Users get daily reminders for incomplete tasks

---

## Epic 13: Admin Dashboard 🟠 P1

### Feature 13.1: Admin Overview Page
**Goal:** Dashboard with key metrics
- Total users, active today, average streak
- Total genres, completed genres (all users)
- Points distributed, rewards purchased
- Recent activity feed
- Quick links to management pages

**Deliverable:** Admin sees high-level stats at a glance

---

### Feature 13.2: User Management
**Goal:** Admin can view/edit all users
- User list with search/filter
- View individual user details (stats, progress, history)
- Edit user properties (role, calorie limit, points adjustment)
- Deactivate/activate users

**Deliverable:** Admin has full user management

---

### Feature 13.3: Activity Schedule Management
**Goal:** Plan future activities
- Calendar view for scheduled activities
- Create activity with future start date
- Drag-and-drop to reschedule
- Bulk edit multiple activities

**Deliverable:** Admin can schedule activities in advance

---

### Feature 13.4: Analytics & Reports
**Goal:** Insights into user behavior
- User engagement metrics (daily active, completion rates)
- Most popular genres
- Average daily steps/calories
- Export reports as CSV

**Deliverable:** Admin can analyze platform usage

---

## Epic 14: UI/UX Polish 🟡 P2

### Feature 14.1: Dark Ninja Theme
**Goal:** Apply consistent dark theme
- Implement Tailwind dark theme tokens
- Create color palette (dark grays, accent colors)
- Design ninja-themed UI components
- Add subtle animations and transitions
- Ensure accessibility (contrast ratios)

**Deliverable:** App has cohesive dark ninja aesthetic

---

### Feature 14.2: Mobile Optimization
**Goal:** Perfect mobile experience
- Optimize touch targets (min 44x44px)
- Implement swipe gestures where appropriate
- Ensure all modals/dialogs are mobile-friendly
- Test on various Android/iOS devices
- Add haptic feedback for interactions

**Deliverable:** App works flawlessly on mobile

---

### Feature 14.3: Loading States & Animations
**Goal:** Smooth user experience
- Skeleton loaders for all data fetching
- Smooth transitions between pages
- Loading spinners with ninja theme
- Success/error toast notifications
- Animated progress bars and counters

**Deliverable:** No jarring loading experiences

---

### Feature 14.4: Onboarding Flow
**Goal:** Welcome new users
- Create multi-step onboarding wizard
- Explain app features with visuals
- Connect Strava/Google Fit during onboarding
- Set initial preferences
- Show tutorial for genre map

**Deliverable:** New users understand how to use app

---

## Epic 15: Testing & Deployment 🟢 P3

### Feature 15.1: Backend Testing
**Goal:** Ensure API reliability
- Write unit tests for services (points, unlocking, challenges)
- Integration tests for API endpoints
- Test authentication flows
- Test scheduled jobs

**Deliverable:** Backend has 70%+ test coverage

---

### Feature 15.2: Frontend Testing
**Goal:** Ensure UI works correctly
- Write component tests (React Testing Library)
- Test user flows (login, activity completion, genre exploration)
- Test responsive layouts
- Accessibility tests

**Deliverable:** Frontend has 60%+ test coverage

---

### Feature 15.3: Production Deployment Setup
**Goal:** Deploy to Digital Ocean
- Configure production Docker Compose
- Set up reverse proxy (Nginx)
- Configure SSL certificates (Let's Encrypt)
- Set up database backups
- Configure Laravel queue worker and scheduler

**Deliverable:** App runs in production environment

---

### Feature 15.4: Monitoring & Logging
**Goal:** Track app health
- Set up error tracking (Sentry or similar)
- Configure Laravel logs
- Add performance monitoring
- Set up uptime monitoring
- Create admin alerts for critical errors

**Deliverable:** Ops team can monitor app health

---

## Implementation Order Recommendation

**Phase 1 - MVP Core (4-6 weeks):**
- Epic 1: Infrastructure (1.1, 1.2, 1.3)
- Epic 2: Authentication (2.1, 2.2, 2.3)
- Epic 3: Activity System (3.1, 3.2, 3.3, 3.4)
- Epic 5: Genre Tree (5.1, 5.2, 5.3, 5.5, 5.6)

**Phase 2 - Gamification (2-3 weeks):**
- Epic 4: Points & Gamification (all features)
- Epic 3: Streak Tracking (3.5)
- Epic 5: Admin Genre Manager (5.4)

**Phase 3 - Integrations (2-3 weeks):**
- Epic 6: Fitness Integration (all features)
- Epic 7: Food Diary (7.1, 7.2, 7.3, 7.4, 7.5)

**Phase 4 - Advanced Features (3-4 weeks):**
- Epic 10: Rewards Shop (all features)
- Epic 12: Notifications (12.1, 12.2, 12.3, 12.4, 12.5)
- Epic 5: Genre Comments (5.7)
- Epic 13: Admin Dashboard (13.1, 13.2)

**Phase 5 - Social & Extended (2-3 weeks):**
- Epic 9: Side Quests (all features)
- Epic 8: Challenges (all features)
- Epic 11: Leaderboard (all features)
- Epic 7: Admin Calorie Management (7.6)

**Phase 6 - Polish & Launch (2-3 weeks):**
- Epic 14: UI/UX Polish (all features)
- Epic 13: Admin Analytics (13.3, 13.4)
- Epic 15: Testing (15.1, 15.2)
- Epic 15: Production Deployment (15.3, 15.4)

---

## Feature Dependency Map

```
Infrastructure Setup (1.1, 1.2, 1.3)
    ↓
Authentication (2.1, 2.2, 2.3)
    ↓
    ├─→ Activity System (3.1, 3.2, 3.3) ─→ Streak (3.5) ─→ Side Quests (9.x)
    ├─→ Points System (4.1, 4.2) ─→ Levels (4.3, 4.4) ─→ Rewards (10.x)
    ├─→ Genre System (5.1, 5.2, 5.3) ─→ Genre Map (5.5, 5.6) ─→ Admin Manager (5.4)
    ├─→ Fitness Integration (6.1, 6.2) ─→ Fitness Display (6.3, 6.4)
    ├─→ Food Diary Base (7.1, 7.2) ─→ Camera (7.3) ─→ AI Calories (7.4)
    └─→ Admin Dashboard (13.1, 13.2)

Activity Reset (3.4) ─→ Required for daily operations
Challenges (8.x) ─→ Requires: Activities, Genres, Streaks
Leaderboard (11.x) ─→ Requires: Points, Levels, Genres
PWA + Notifications (12.x) ─→ Can be added anytime
```

---

## Critical Implementation Notes

### For Each Feature Development:

1. **Start with database schema** - Ensure tables support future features
2. **Build API endpoints** - Complete backend logic before UI
3. **Create TypeScript interfaces** - Match Laravel API resources
4. **Build UI components** - Mobile-first, reusable components
5. **Test integration** - Verify full flow works
6. **Document API** - Add endpoint descriptions

### Testing Strategy per Feature:

- **Backend:** Write tests for new service methods and endpoints
- **Frontend:** Test main user flow for the feature
- **Integration:** Test end-to-end feature flow
- **Manual:** Test on mobile device (Android)

### Git Workflow:

- Create feature branch: `feature/epic-X-feature-Y`
- Commit frequently with clear messages
- Open PR when feature complete
- Merge to `develop` branch
- Deploy to staging for testing
- Merge to `main` for production

---

## API Endpoints Reference (Quick Index)

### Authentication
- `POST /api/v1/auth/google` - Google OAuth login
- `POST /api/v1/auth/google/callback` - OAuth callback
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/user` - Get current user

### Activities
- `GET /api/v1/activities/today` - Today's activities
- `POST /api/v1/activities/{id}/complete` - Complete activity
- `GET /api/v1/activities/history` - Activity history
- `GET /api/v1/activities/streak` - Current streak info

### Genres
- `GET /api/v1/genres/tree` - Full genre tree with progress
- `GET /api/v1/genres/{id}` - Genre details
- `POST /api/v1/genres/{id}/complete` - Mark as explored
- `POST /api/v1/genres/{id}/comments` - Add comment
- `GET /api/v1/genres/{id}/comments` - Get comments

### Points & Levels
- `GET /api/v1/points/balance` - Current points
- `GET /api/v1/points/transactions` - Point history
- `GET /api/v1/levels/current` - Current level info

### Fitness
- `GET /api/v1/fitness/today` - Today's stats (steps, calories)
- `GET /api/v1/fitness/history` - Historical data
- `POST /api/v1/fitness/sync` - Manual sync trigger

### Food Diary
- `GET /api/v1/food-log/today` - Today's entries
- `POST /api/v1/food-log` - Create entry (text or image)
- `GET /api/v1/food-log/summary` - Daily calorie summary

### Challenges
- `GET /api/v1/challenges/my` - User's active challenges
- `GET /api/v1/challenges/{id}` - Challenge details
- `GET /api/v1/challenges/{id}/progress` - Progress tracking

### Side Quests
- `GET /api/v1/side-quests/available` - Unlocked side quests
- `GET /api/v1/side-quests/{id}` - Side quest details
- `POST /api/v1/side-quests/{id}/complete` - Mark complete

### Rewards
- `GET /api/v1/rewards` - Available rewards
- `POST /api/v1/rewards/{id}/purchase` - Purchase reward
- `GET /api/v1/rewards/purchases` - Purchase history

### Leaderboard
- `GET /api/v1/leaderboard?sort={metric}` - Rankings
- `GET /api/v1/leaderboard/me` - User's rank

### Admin - Activities
- `POST /api/v1/admin/activities` - Create activity
- `PUT /api/v1/admin/activities/{id}` - Update activity
- `DELETE /api/v1/admin/activities/{id}` - Delete activity

### Admin - Genres
- `POST /api/v1/admin/genres` - Create genre
- `PUT /api/v1/admin/genres/{id}` - Update genre
- `DELETE /api/v1/admin/genres/{id}` - Delete genre
- `POST /api/v1/admin/genres/{id}/reorder` - Change position

### Admin - Users
- `GET /api/v1/admin/users` - List all users
- `GET /api/v1/admin/users/{id}` - User details
- `PUT /api/v1/admin/users/{id}` - Update user
- `POST /api/v1/admin/users/{id}/adjust-points` - Adjust points

### Admin - Rewards
- `POST /api/v1/admin/rewards` - Create reward
- `PUT /api/v1/admin/rewards/{id}` - Update reward
- `DELETE /api/v1/admin/rewards/{id}` - Delete reward

### Admin - Challenges
- `POST /api/v1/admin/challenges` - Create challenge
- `POST /api/v1/admin/challenges/{id}/assign` - Assign to users
- `DELETE /api/v1/admin/challenges/{id}` - Delete challenge

### Admin - Analytics
- `GET /api/v1/admin/analytics/overview` - Dashboard stats
- `GET /api/v1/admin/analytics/users` - User engagement metrics
- `GET /api/v1/admin/analytics/genres` - Genre popularity

---

## Component Architecture (Frontend)

```
src/
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   ├── Card.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── Avatar.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── MainLayout.tsx
│   ├── activities/
│   │   ├── ActivityList.tsx
│   │   ├── ActivityItem.tsx
│   │   └── StreakCounter.tsx
│   ├── genres/
│   │   ├── GenreMap.tsx
│   │   ├── GenreNode.tsx
│   │   ├── GenreModal.tsx
│   │   └── GenreComments.tsx
│   ├── fitness/
│   │   ├── StatsWidget.tsx
│   │   ├── StepCounter.tsx
│   │   └── CalorieTracker.tsx
│   ├── food/
│   │   ├── FoodDiary.tsx
│   │   ├── FoodEntryForm.tsx
│   │   └── CalorieSummary.tsx
│   ├── rewards/
│   │   ├── RewardsShop.tsx
│   │   ├── RewardCard.tsx
│   │   └── PurchaseHistory.tsx
│   ├── leaderboard/
│   │   ├── Leaderboard.tsx
│   │   └── UserComparison.tsx
│   └── admin/
│       ├── Dashboard.tsx
│       ├── UserManager.tsx
│       ├── GenreEditor.tsx
│       └── ActivityScheduler.tsx
├── pages/
│   ├── LoginPage.tsx
│   ├── ProfilePage.tsx
│   ├── GenreMapPage.tsx
│   ├── ActivitiesPage.tsx
│   ├── FoodDiaryPage.tsx
│   ├── RewardsShopPage.tsx
│   ├── LeaderboardPage.tsx
│   └── admin/
│       └── AdminDashboardPage.tsx
├── services/
│   ├── api.ts
│   ├── auth.ts
│   ├── activities.ts
│   ├── genres.ts
│   └── notifications.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useActivities.ts
│   ├── useGenres.ts
│   └── useNotifications.ts
├── contexts/
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
└── types/
    ├── user.ts
    ├── activity.ts
    ├── genre.ts
    └── api.ts
```

---

## Database Schema Quick Reference

### Core Tables
- `users` - User accounts, roles, points, levels
- `activities` - Activity definitions
- `user_activity_log` - Completed activities
- `daily_stats` - Daily fitness/calorie stats
- `genres` - Music genre tree
- `user_genre_progress` - Genre completion tracking
- `genre_comments` - User comments on genres

### Gamification Tables
- `point_transactions` - Point history
- `challenges` - Challenge definitions
- `user_challenges` - User challenge progress
- `side_quests` - Special genre groups
- `user_side_quest_progress` - Side quest tracking
- `rewards` - Reward catalog
- `user_rewards_purchases` - Purchase history

### Integration Tables
- `food_log` - Food diary entries
- `notifications` - Notification queue

---

## Environment Variables Checklist

```bash
# Application
APP_NAME=MelodyNinja
APP_ENV=production
APP_URL=https://melody.ninja

# Database
DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=melody_ninja
DB_USERNAME=root
DB_PASSWORD=

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

# Strava
STRAVA_CLIENT_ID=
STRAVA_CLIENT_SECRET=
STRAVA_REDIRECT_URI=

# Google Fit
GOOGLE_FIT_CLIENT_ID=
GOOGLE_FIT_CLIENT_SECRET=

# Claude AI
CLAUDE_API_KEY=

# YouTube
YOUTUBE_API_KEY=

# Push Notifications
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=

# Mail
MAIL_MAILER=smtp
MAIL_HOST=
MAIL_PORT=
MAIL_USERNAME=
MAIL_PASSWORD=

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
```

---

## Success Metrics

### User Engagement
- Daily Active Users (DAU)
- Average session duration
- Activity completion rate
- Genre exploration rate

### Health Metrics
- Average daily steps
- Average daily calories logged
- User streak distribution

### Gamification Metrics
- Average points per user
- Reward purchase rate
- Challenge completion rate
- Leaderboard participation

### Technical Metrics
- API response time (< 200ms p95)
- Error rate (< 1%)
- Uptime (> 99.5%)
- Push notification delivery rate

---

## Next Steps After MVP

1. **Analytics Dashboard** - Deep dive into user behavior
2. **Social Features** - Friends, groups, challenges between friends
3. **More Integrations** - Spotify, Apple Music, other fitness apps
4. **Mobile App** - Native iOS/Android for better performance
5. **AI Recommendations** - Personalized genre suggestions
6. **Playlist Generation** - AI-curated playlists based on user taste
7. **Community Features** - Forums, genre discussions
8. **Merchandise Shop** - Real merch with virtual currency