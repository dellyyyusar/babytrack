# BeeTrack - Baby Tracker Activity

Aplikasi web untuk mencatat, memantau, dan menganalisis aktivitas bayi harian.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, shadcn/ui, TanStack Query, Zustand, Recharts
- **Backend:** Golang, Gin, pgx, JWT
- **Database:** PostgreSQL 16

## Quick Start

### Prerequisites

- Node.js 20+
- Go 1.22+
- Docker & Docker Compose

### 1. Start Database

```bash
docker compose up postgres -d
```

### 2. Setup Backend

```bash
cd backend
cp .env.example .env
go run ./cmd/api/
```

Backend runs on `http://localhost:8080`

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Babies
- `GET /api/babies` - List babies
- `POST /api/babies` - Create baby
- `GET /api/babies/:id` - Get baby detail
- `PATCH /api/babies/:id` - Update baby
- `DELETE /api/babies/:id` - Delete baby

### Activities
- `GET /api/babies/:babyId/activities` - List activities
- `POST /api/babies/:babyId/activities` - Create activity
- `GET /api/activities/:id` - Get activity
- `PATCH /api/activities/:id` - Update activity
- `DELETE /api/activities/:id` - Delete activity

### Dashboard
- `GET /api/babies/:babyId/dashboard-summary` - Dashboard data

### Reminders & Immunizations
- Full CRUD endpoints under `/api/babies/:babyId/reminders`
- Full CRUD endpoints under `/api/babies/:babyId/immunizations`
