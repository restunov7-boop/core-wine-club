# Testing and Stability

## Backend Tests

Backend tests live in `backend/tests` and use pytest plus FastAPI `TestClient`.

The test suite sets these environment values before importing the app:

```env
APP_ENV=test
DEV_AUTH_ENABLED=true
JWT_SECRET=test_secret
DATABASE_URL=sqlite:////.../core_wine_club_pytest_<pid>.db
CORS_ORIGINS=http://127.0.0.1:5173,http://localhost:5173
```

Each test starts from a clean SQLite schema, creates the default project, and seeds demo discoveries. The real local development database is not used.

## Covered Flows

- Healthcheck.
- Dev Telegram auth and `/auth/me`.
- Onboarding status, completion, and dev reset.
- Discoveries list/detail and category filtering.
- Diary create/list/detail/update/delete.
- Diary ownership isolation between two dev users.
- Taste profile empty and populated states.
- Taste profile ownership isolation.
- Home preview sections and stats.

## Smoke Script

`backend/scripts/smoke_sprint6.ps1` runs against a backend already listening on `http://127.0.0.1:8000/api/v1`.

It checks:

- health;
- dev auth;
- `/auth/me`;
- onboarding reset and completion;
- home;
- discoveries list/detail;
- diary CRUD;
- taste profile update;
- deleted note returns 404.

Successful steps print `[OK] ...`.

## Local Start Helpers

Use `scripts/start_backend_dev.ps1` for backend local development. It sets SQLite, dev auth, JWT, and CORS environment values, runs migrations, seeds demo data, and starts uvicorn.

Use `scripts/start_frontend_dev.ps1` for frontend local development. It sets Vite auth variables and starts Vite on `127.0.0.1:5173`.

The backend helper only deletes the local SQLite file when called with `-ResetDb`.

## Mobile Preview

Use `scripts/start_mobile_preview.ps1` to check the local app from a phone through Cloudflare Quick Tunnel. It starts backend, frontend, a backend tunnel, and a frontend tunnel, then prints the public frontend URL.

Use `scripts/stop_mobile_preview.ps1` to stop only the PIDs recorded in `.tmp/mobile-preview/pids.json`.

Details are in `docs/technical/mobile-preview.md`.

## Stability Boundary

Sprint 6 is test and tooling only. It should not change business behavior or add new MVP features.
