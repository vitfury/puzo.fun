# Melody Ninja

Gamified music discovery and fitness tracking web application built with Laravel 11 and React 18.

## Features

- **Music Genre Skill Tree**: Interactive 2D map with pan/zoom navigation
- **Activity Tracking**: Daily tasks, music walks, and fitness goals
- **Fitness Integration**: Google Fit, Health Connect, and Strava support
- **Food Diary**: AI-powered calorie tracking with Claude API
- **Gamification**: Points, levels, streaks, side quests, and rewards
- **Social Features**: Leaderboards, comments, and multi-user progress tracking
- **PWA Support**: Progressive Web App with push notifications

## Tech Stack

### Backend
- Laravel 11 (PHP 8.2+)
- MySQL 8.0
- Redis (Cache & Queue)
- Laravel Sanctum (API Authentication)
- Laravel Socialite (OAuth)

### Frontend
- React 18 with TypeScript
- Vite (Build tool with HMR)
- TailwindCSS (Styling)
- React Query (Server state)
- Framer Motion (Animations)
- PWA Support

### Infrastructure
- Docker & Docker Compose
- Nginx (Reverse proxy)
- PHP-FPM 8.3

## Prerequisites

- Docker Desktop (20.10+)
- Docker Compose (2.0+)
- Make (optional, for convenience commands)

## Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd music.ninja
```

### 2. Automated setup (recommended)

```bash
make install
```

This will:
- Copy environment files
- Start MySQL and Redis
- Install backend dependencies (Composer)
- Generate application key
- Run database migrations
- Install frontend dependencies (npm)
- Start all services

### 3. Manual setup (alternative)

If you don't have `make`, follow these steps:

```bash
# Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start Docker containers
docker-compose up -d

# Install backend dependencies
docker-compose exec php composer install

# Generate Laravel application key
docker-compose exec php php artisan key:generate

# Run database migrations
docker-compose exec php php artisan migrate

# Install frontend dependencies
docker-compose exec frontend npm install
```

## Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost/api
- **API Health Check**: http://localhost/api/health

## Docker Services

The application runs the following services:

| Service | Port | Description |
|---------|------|-------------|
| nginx | 80, 443 | Web server & reverse proxy |
| php | 9000 | PHP-FPM for Laravel |
| mysql | 3306 | MySQL database |
| redis | 6379 | Cache & queue backend |
| frontend | 5173 | Vite dev server with HMR |
| queue | - | Laravel queue worker |
| scheduler | - | Laravel task scheduler |

## Development Commands

### Using Make (recommended)

```bash
make up              # Start all containers
make down            # Stop all containers
make restart         # Restart all containers
make logs            # View logs from all containers
make clean           # Remove all containers and volumes

make backend-shell   # Access PHP container shell
make frontend-shell  # Access Node container shell
make db-shell        # Access MySQL shell
make redis-cli       # Access Redis CLI

make migrate         # Run database migrations
make migrate-fresh   # Drop all tables and re-run migrations
make seed            # Run database seeders
make test            # Run backend tests
make build           # Rebuild Docker images
```

### Using Docker Compose directly

```bash
docker-compose up -d                    # Start containers
docker-compose down                     # Stop containers
docker-compose logs -f                  # View logs
docker-compose exec php sh              # Access PHP container
docker-compose exec php php artisan migrate  # Run migrations
```

## Project Structure

```
music.ninja/
├── backend/                 # Laravel application
│   ├── app/                # Application code
│   ├── config/             # Configuration files
│   ├── database/           # Migrations, seeders, factories
│   ├── routes/             # API routes
│   └── storage/            # File storage, logs, cache
├── frontend/               # React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
├── docker/                 # Docker configuration
│   ├── nginx/             # Nginx config
│   ├── php/               # PHP-FPM Dockerfile
│   ├── node/              # Node Dockerfile
│   └── mysql/             # MySQL config
└── docker-compose.yml      # Docker services definition
```

## Environment Variables

### Root `.env`
```env
DB_DATABASE=melody_ninja
DB_USERNAME=melody_user
DB_PASSWORD=melody_pass
DB_ROOT_PASSWORD=root_secret
VITE_API_URL=http://localhost/api
```

### Backend `.env`
See [backend/.env.example](backend/.env.example) for all available options including:
- Database credentials
- Redis configuration
- OAuth credentials (Google, Strava)
- External API keys (YouTube, Claude AI)
- Application settings

### Frontend `.env`
```env
VITE_API_URL=http://localhost/api
VITE_APP_NAME=Melody Ninja
```

## Hot Module Replacement (HMR)

The frontend automatically reloads when you make changes to:
- React components (`.tsx`, `.jsx`)
- TypeScript files (`.ts`)
- CSS files (`.css`)

The backend requires container restart for changes:
```bash
make restart
# or
docker-compose restart php
```

## Database Management

### Run migrations
```bash
make migrate
# or
docker-compose exec php php artisan migrate
```

### Reset database
```bash
make migrate-fresh
# or
docker-compose exec php php artisan migrate:fresh
```

### Seed database
```bash
make seed
# or
docker-compose exec php php artisan db:seed
```

### Access MySQL shell
```bash
make db-shell
# or
docker-compose exec mysql mysql -u melody_user -pmelody_pass melody_ninja
```

## Queue & Scheduled Tasks

The application includes two background services:

### Queue Worker
Processes background jobs (API calls, notifications, etc.)
```bash
docker-compose logs -f queue
```

### Scheduler
Runs scheduled tasks (daily activity reset at 6:00 AM)
```bash
docker-compose logs -f scheduler
```

## Testing

### Backend tests
```bash
make test
# or
docker-compose exec php php artisan test
```

### Frontend tests (to be configured)
```bash
docker-compose exec frontend npm run test
```

## Production Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for production deployment instructions.

## Troubleshooting

### Containers won't start
```bash
# Check container logs
docker-compose logs

# Rebuild images
make build
```

### Permission errors
```bash
# Fix Laravel storage permissions
docker-compose exec php chmod -R 775 storage bootstrap/cache
docker-compose exec php chown -R www-data:www-data storage bootstrap/cache
```

### Database connection errors
```bash
# Ensure MySQL is healthy
docker-compose ps

# Wait for MySQL to initialize (first run)
docker-compose logs -f mysql
```

### Frontend not loading
```bash
# Check frontend logs
docker-compose logs -f frontend

# Reinstall dependencies
docker-compose exec frontend npm install
```

### Port already in use
```bash
# Change ports in docker-compose.yml
# Default ports: 80 (nginx), 3306 (mysql), 5173 (frontend)
```

## API Documentation

API endpoints are documented at `/api/docs` (to be implemented).

Health check: http://localhost/api/health

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and feature requests, please use the GitHub issue tracker.
