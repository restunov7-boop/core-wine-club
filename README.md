# CORE Wine Club

Windows-first local development workspace for the CORE / Wine Club MVP.

Current implemented foundation includes auth, onboarding, home, discoveries, learning paths and lessons, lesson completion events, Bottle UI foundation, private diary, private taste profile, and Sprint 6 quality/stability tooling. Sprint 13 adds a deterministic My Path / next actions layer; it does not add AI recommendations, achievements, or gamification.

## Required Tools

- Git
- Python 3.11+
- Node.js LTS
- pnpm
- Docker Desktop, optional for local container checks
- VS Code recommended

## Windows PowerShell Quick Start

Copy the environment file:

```powershell
Copy-Item .env.example .env
```

Start backend and frontend locally:

```powershell
.\scripts\start_backend_dev.ps1
```

In a second PowerShell window:

```powershell
.\scripts\start_frontend_dev.ps1
```

Check the backend:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/v1/health
```

Open the frontend:

```powershell
Start-Process http://127.0.0.1:5173/home
```

If Docker is available in your terminal, the stack can also be started with:

```powershell
docker compose up --build
```

In the current local environment Docker may not be present in `PATH`; use the local scripts above when that is the case.

## Backend Local Setup

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
alembic upgrade head
python -m scripts.seed_dev
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

If virtual environment activation is blocked:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Frontend Local Setup

```powershell
cd frontend
corepack enable
pnpm install
pnpm dev -- --host 127.0.0.1 --port 5173
```

For dev auth, create `frontend/.env.local`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
VITE_PROJECT_SLUG=doch-vinodela
VITE_DEV_TELEGRAM_MOCK=true
```

## Alembic

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
alembic current
alembic upgrade head
alembic revision --autogenerate -m "describe_change"
```

## Backend Tests

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m compileall app
python -m pytest
```

The pytest suite uses an isolated SQLite database under the system temp directory and does not touch the local development database.

## Sprint 6 Smoke Check

Start the backend first, then run:

```powershell
.\backend\scripts\smoke_sprint6.ps1
```

The smoke script logs in with dev Telegram auth, checks `/auth/me`, onboarding reset/complete, home, my path, discoveries, learning paths/lessons, lesson completion/uncompletion, progress summary/activity, bottle progress, diary CRUD, taste profile, and verifies that a deleted diary note returns 404 while its creation event remains in progress history. Successful steps print `[OK] ...`.

## Frontend Build

```powershell
cd frontend
pnpm install
pnpm build
```

## Mobile Preview

To check the local app from a real phone, install `cloudflared`, then run:

```powershell
.\scripts\start_mobile_preview.ps1
```

The script prints a temporary public frontend URL for the phone and uses a separate `backend/mobile_preview.db`.

Stop it with:

```powershell
.\scripts\stop_mobile_preview.ps1
```

More details: `docs/technical/mobile-preview.md`.

## Sprint 1 Auth Checks

Run migrations and seed the default project:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
alembic upgrade head
python -m scripts.seed_dev
```

Start the backend:

```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Call dev auth:

```powershell
$session = Invoke-RestMethod `
  -Method Post `
  -Uri http://127.0.0.1:8000/api/v1/auth/telegram `
  -ContentType "application/json" `
  -Body '{"init_data":"dev_mock_init_data"}'

$session.data.access_token
```

Call `/auth/me`:

```powershell
$headers = @{ Authorization = "Bearer $($session.data.access_token)" }
Invoke-RestMethod http://127.0.0.1:8000/api/v1/auth/me -Headers $headers
```

## Sprint Boundaries

Sprint 0 includes scaffold, configuration, healthcheck, routing shells, Telegram wrapper isolation, API client, theme variables, docs, Docker Compose, and Alembic setup.

Sprint 1 includes identity, Telegram auth validation/dev auth, JWT sessions, project membership, permissions foundation, and frontend auth state.

Sprint 2-5 add the first MVP slices: onboarding/home, discoveries, private diary, and private taste profile.

Sprint 6 includes tests, smoke checks, local start helpers, mobile preview dev tooling, and stability documentation only.

Sprint 7 includes frontend app shell, bottom navigation, and UX foundation for existing routes only.

Sprint 8 includes read-only learning paths and lessons with seeded beginner content. It does not include learning progress, completion events, or bottle UI.

Sprint 9 includes generic project-scoped, user-owned progress events and lesson completion state. It does not include Bottle UI, points, achievements, quizzes, or gamification.

Sprint 10 includes Bottle UI foundation as a visualization of lesson completion progress. It does not add a bottle table or a new progress source of truth.

Sprint 11 extends Bottle UI to include up to 3 existing private diary notes alongside lesson progress, and records `diary.note.created` events in the existing progress ledger. It does not add gamification or new business areas.

Sprint 12 adds `/progress/activity`, `/progress`, and small Home/Bottle activity previews as read-only projections over `progress_events`. It does not add a new activity table, social feed, points, badges, streaks, or achievements.

Sprint 13 adds `/my-path` and Home next-action previews using deterministic rules over existing user state. It does not add AI, a recommendation engine, a new table, points, badges, streaks, or achievements.

Quizzes, club/feed/comments, achievements, notifications, premium features beyond `ProjectUser` access-state fields, admin CRUD, AI, recommendations, uploads, external wine databases, and deployment are intentionally not implemented.
