# Baby Tracker Activity MVP Implementation Plan

> **For Claude:** Build a full-stack baby activity tracking application with React frontend and Golang backend.

**Goal:** Build MVP of Baby Tracker Activity — a web app for parents to track feeding, sleep, diaper, and other baby activities with dashboard, timeline, and multi-user support.

**Architecture:** Monorepo with `frontend/` (React + Vite + Tailwind + shadcn/ui) and `backend/` (Golang + Gin + PostgreSQL + JWT auth). REST API communication. Mobile-first responsive design.

**Tech Stack:**
- Frontend: React 19, Vite, Tailwind CSS 4, shadcn/ui, React Hook Form + Zod, TanStack Query, Zustand, Recharts, date-fns, React Router v7
- Backend: Golang, Gin, pgx, golang-migrate, bcrypt, golang-jwt
- Database: PostgreSQL 16
- Infra: Docker Compose for local dev

---

### Task 1: Initialize Project Structure

**Files:**
- Create: `frontend/` — React + Vite + TypeScript project
- Create: `backend/` — Go module with Gin
- Create: `docker-compose.yml` — PostgreSQL + backend
- Create: `Makefile` — Dev commands

**Step 1: Create root structure**

Run: `mkdir -p frontend backend docs/plans`

**Step 2: Initialize Go module**

```bash
cd backend
go mod init github.com/beetrack/backend
```

**Step 3: Create frontend with Vite**

```bash
cd frontend
npm create vite@latest . -- --template react-ts
```

**Step 4: Install frontend deps**

```bash
cd frontend
npm install
npm install tailwindcss @tailwindcss/vite
npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-slot @radix-ui/react-tabs @radix-ui/react-dropdown-menu @radix-ui/react-avatar @radix-ui/react-toast @radix-ui/react-label @radix-ui/react-separator
npm install lucide-react class-variance-authority clsx tailwind-merge
npm install react-hook-form @hookform/resolvers zod
npm install @tanstack/react-query zustand
npm install recharts date-fns
npm install react-router-dom
```

**Step 5: Install Go deps**

```bash
cd backend
go get github.com/gin-gonic/gin
go get github.com/jackc/pgx/v5
go get github.com/golang-jwt/jwt/v5
go get golang.org/x/crypto
go get github.com/golang-migrate/migrate/v4
go get github.com/google/uuid
go get github.com/joho/godotenv
go get github.com/rs/cors
```

---

### Task 2: Set Up Docker Compose & Database

**Files:**
- Create: `docker-compose.yml`
- Create: `backend/migrations/`

**Step 1: Write docker-compose.yml**

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: beetrack
      POSTGRES_USER: beetrack
      POSTGRES_PASSWORD: beetrack123
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: postgres://beetrack:beetrack123@postgres:5432/beetrack?sslmode=disable
      JWT_SECRET: dev-secret-key-change-in-production
    depends_on:
      - postgres
volumes:
  pgdata:
```

**Step 2: Create migration files**

Create `001_create_users_table.sql` through `006_create_immunizations_table.sql`.

---

### Task 3: Backend Foundation — Config, Database, Main

**Files:**
- Create: `backend/cmd/api/main.go`
- Create: `backend/internal/config/config.go`
- Create: `backend/internal/database/postgres.go`
- Create: `backend/internal/utils/response.go`
- Create: `backend/internal/utils/password.go`
- Create: `backend/internal/utils/jwt.go`

**Details:**
- Config reads from env vars
- Database connects via pgx pool
- Utils for standardized JSON response, bcrypt hashing, JWT token generation/validation

---

### Task 4: Backend — Auth Module (Register, Login, Logout, Refresh)

**Files:**
- Create: `backend/internal/modules/auth/handler.go`
- Create: `backend/internal/modules/auth/service.go`
- Create: `backend/internal/modules/auth/repository.go`
- Create: `backend/internal/modules/auth/dto.go`

**Endpoints:**
- POST /auth/register — create user, return tokens
- POST /auth/login — validate credentials, return tokens
- POST /auth/logout — revoke refresh token
- POST /auth/refresh — issue new access token

**Logic:**
- Register: validate email unique, hash password, insert user, create JWT pair
- Login: find user by email, compare password, create JWT pair
- JWT pair: access token (15min) + refresh token (7 days, stored as hash)

---

### Task 5: Backend — Middleware & Authorization Helpers

**Files:**
- Create: `backend/internal/middleware/auth.go`
- Create: `backend/internal/middleware/cors.go`
- Create: `backend/internal/middleware/logger.go`
- Create: `backend/internal/utils/auth_context.go`

**Logic:**
- Auth middleware: extract Bearer token, validate JWT, set user_id in context
- CORS middleware: allow frontend origin
- Logger middleware: request logging

---

### Task 6: Backend — Babies CRUD with Authorization

**Files:**
- Create: `backend/internal/modules/babies/handler.go`
- Create: `backend/internal/modules/babies/service.go`
- Create: `backend/internal/modules/babies/repository.go`
- Create: `backend/internal/modules/babies/dto.go`

**Endpoints:**
- GET /babies — list babies user has access to
- POST /babies — create baby (user becomes owner via baby_members)
- GET /babies/:id — get baby detail (check membership)
- PATCH /babies/:id — update baby (owner/parent only)
- DELETE /babies/:id — delete baby (owner only)

**Logic:**
- Create baby: insert into babies + baby_members (role=owner)
- All endpoints check baby_members for authorization

---

### Task 7: Backend — Activities CRUD

**Files:**
- Create: `backend/internal/modules/activities/handler.go`
- Create: `backend/internal/modules/activities/service.go`
- Create: `backend/internal/modules/activities/repository.go`
- Create: `backend/internal/modules/activities/dto.go`

**Endpoints:**
- GET /babies/:babyId/activities — list activities (filter by type, date)
- POST /babies/:babyId/activities — create activity
- GET /activities/:id — get detail
- PATCH /activities/:id — update (owner/parent or creator)
- DELETE /activities/:id — delete (owner/parent only)

**Logic:**
- Activities stored with JSONB metadata field
- Type-specific validation in service layer
- Pagination support

---

### Task 8: Backend — Dashboard Summary & Reminders & Immunizations

**Files:**
- Create: `backend/internal/modules/dashboard/handler.go`
- Create: `backend/internal/modules/dashboard/service.go`
- Create: `backend/internal/modules/reminders/handler.go`
- Create: `backend/internal/modules/reminders/service.go`
- Create: `backend/internal/modules/reminders/repository.go`
- Create: `backend/internal/modules/immunizations/handler.go`
- Create: `backend/internal/modules/immunizations/service.go`
- Create: `backend/internal/modules/immunizations/repository.go`

**Dashboard Summary:**
- GET /babies/:babyId/dashboard-summary
- Returns: last feeding, last sleep, last diaper, today's totals, upcoming immunizations

**Reminders:**
- CRUD for reminders per baby
- GET/POST/PATCH/DELETE

**Immunizations:**
- CRUD for immunizations per baby
- GET/POST/PATCH/DELETE

---

### Task 9: Frontend — Setup Tailwind, shadcn/ui, Router, Query Client

**Files:**
- Modify: `frontend/vite.config.ts`
- Create: `frontend/src/app/App.tsx`
- Create: `frontend/src/app/router.tsx`
- Create: `frontend/src/lib/utils.ts`
- Create: `frontend/src/lib/api.ts`
- Create: `frontend/src/styles.css`

**Details:**
- Configure Tailwind with custom colors (soft baby theme)
- Set up React Router routes: /login, /register, /dashboard, /activities, /reports, /settings, /babies/new
- Set up TanStack Query client
- Set up API client with axios/fetch wrapper that includes JWT
- shadcn/ui component setup

---

### Task 10: Frontend — Auth Pages (Login, Register)

**Files:**
- Create: `frontend/src/pages/login.tsx`
- Create: `frontend/src/pages/register.tsx`
- Create: `frontend/src/features/auth/use-auth.ts`
- Create: `frontend/src/stores/auth-store.ts`

**Details:**
- Login form with email + password
- Register form with name + email + password + confirm
- Auth store with Zustand (token, user)
- Redirect to dashboard after login
- Protected route component

---

### Task 11: Frontend — Layout Components (Sidebar, Topbar, Mobile Nav)

**Files:**
- Create: `frontend/src/components/layout/AppLayout.tsx`
- Create: `frontend/src/components/layout/Sidebar.tsx`
- Create: `frontend/src/components/layout/Topbar.tsx`
- Create: `frontend/src/components/layout/MobileBottomNav.tsx`

**Details:**
- Sidebar: collapsible on desktop, hidden on mobile
- Topbar: baby switcher + user menu
- Mobile bottom nav: 5 tabs (Home, Timeline, Add, Reports, Profile)
- Responsive behavior

---

### Task 12: Frontend — Baby Profile (Create & Switch)

**Files:**
- Create: `frontend/src/pages/baby-new.tsx`
- Create: `frontend/src/pages/baby-profile.tsx`
- Create: `frontend/src/components/baby/BabySwitcher.tsx`
- Create: `frontend/src/stores/baby-store.ts`
- Create: `frontend/src/features/babies/use-babies.ts`

**Details:**
- Baby creation form (name, birth date, gender, optional fields)
- Baby switcher dropdown in topbar
- Baby store (selected baby ID, list of babies)
- Format baby age (X months, Y days)

---

### Task 13: Frontend — Dashboard Page

**Files:**
- Create: `frontend/src/pages/dashboard.tsx`
- Create: `frontend/src/components/dashboard/StatsCards.tsx`
- Create: `frontend/src/components/dashboard/LastActivityCards.tsx`
- Create: `frontend/src/components/dashboard/QuickActions.tsx`
- Create: `frontend/src/components/dashboard/EmptyState.tsx`
- Create: `frontend/src/components/dashboard/TimelinePreview.tsx`

**Details:**
- Fetch GET /babies/:id/dashboard-summary
- Stats cards: total feeding today, total sleep today, diaper count today
- Last activity cards: last feeding, last sleep, last diaper
- Quick action buttons: Feeding, Sleep, Diaper, Temperature, Note
- Empty state when no activities
- Timeline preview (last 5 activities)

---

### Task 14: Frontend — Activity Modals (Feeding, Sleep, Diaper)

**Files:**
- Create: `frontend/src/components/activity/ActivityModal.tsx`
- Create: `frontend/src/components/activity/FeedingForm.tsx`
- Create: `frontend/src/components/activity/SleepForm.tsx`
- Create: `frontend/src/components/activity/DiaperForm.tsx`
- Create: `frontend/src/components/activity/TemperatureForm.tsx`
- Create: `frontend/src/components/activity/NoteForm.tsx`
- Create: `frontend/src/features/activities/use-activities.ts`
- Create: `frontend/src/lib/validators.ts`

**Details:**
- Modal with tab/radio selection for activity type
- Conditional fields based on type
- React Hook Form + Zod validation
- Feeding: type (breast/bottle/formula/mpasi), side, volume, duration, time
- Sleep: start time, end time/duration, quality
- Diaper: type (wet/dirty/both/dry), color, texture
- Temperature: value, method
- Note: title, content, tags, photo
- Quick save with minimal data

---

### Task 15: Frontend — Timeline Page

**Files:**
- Create: `frontend/src/pages/activities.tsx`
- Create: `frontend/src/components/activity/TimelineList.tsx`
- Create: `frontend/src/components/activity/TimelineItem.tsx`
- Create: `frontend/src/components/activity/TimelineFilter.tsx`
- Create: `frontend/src/components/activity/ActivityDetail.tsx`

**Details:**
- Fetch GET /babies/:id/activities with filters
- Filter by type (feeding, sleep, diaper, all)
- Date picker for specific date
- Timeline items with icon, title, time, preview
- Click to see detail
- Edit/delete actions (context menu or swipe)
- Edit opens the same modal prefilled

---

### Task 16: Frontend — Reports Page (7-Day Charts)

**Files:**
- Create: `frontend/src/pages/reports.tsx`
- Create: `frontend/src/components/charts/FeedingChart.tsx`
- Create: `frontend/src/components/charts/SleepChart.tsx`
- Create: `frontend/src/components/charts/DiaperChart.tsx`
- Create: `frontend/src/components/charts/GrowthChart.tsx`

**Details:**
- Fetch last 7 days of activity data
- Bar chart: total feeding sessions per day
- Bar chart: total sleep hours per day
- Bar chart: diaper count per day
- Line chart: weight over time (if growth data exists)
- Responsive charts with Recharts

---

### Task 17: Frontend — Polish & Mobile Responsive

**Files:**
- Modify: all pages and components

**Details:**
- Ensure all pages are mobile-friendly
- Bottom nav works correctly
- Floating action button for quick add on mobile
- Loading skeletons for all pages
- Empty states for no data
- Toast notifications for success/error
- Smooth transitions
- Test all flows

---

### Task 18: Final Integration & Testing

**Files:**
- All files

**Details:**
- End-to-end flow testing
- Verify auth, baby creation, activity CRUD, dashboard, timeline
- Verify authorization rules
- Docker Compose up and running
- Document environment variables
- README with setup instructions

---

## Build Order (Executing)

1. Project scaffolding + deps
2. Docker + DB + migrations
3. Backend config + database + main
4. Backend auth module
5. Backend middleware + auth helpers
6. Backend babies CRUD
7. Backend activities CRUD
8. Backend dashboard, reminders, immunizations
9. Frontend setup (Tailwind, shadcn, router, API client)
10. Frontend auth pages
11. Frontend layout components
12. Frontend baby profile
13. Frontend dashboard
14. Frontend activity modals
15. Frontend timeline
16. Frontend reports
17. Frontend polish + mobile
18. Integration testing
