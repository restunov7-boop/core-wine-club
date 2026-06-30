# Sprint 6 - Quality, Tests, and Stability Foundation

## Goal

Sprint 6 adds a stability foundation for the already implemented MVP slices. It does not add product functionality.

## Implemented Scope

- Backend pytest suite for health, dev auth, `/auth/me`, onboarding, discoveries, diary, taste profile, and home previews.
- Isolated SQLite test database configured before the FastAPI app is imported.
- Windows smoke script for a running backend.
- Windows start helpers for backend and frontend local development.
- Windows Mobile Preview helper for checking the local app from a phone through Cloudflare Quick Tunnel.
- Documentation for local tests, smoke checks, and stability workflow.

## Test Boundaries

The tests cover existing behavior only:

- `GET /api/v1/health`;
- `POST /api/v1/auth/telegram`;
- `GET /api/v1/auth/me`;
- onboarding status, complete, and dev reset;
- discoveries list and detail;
- private diary CRUD and ownership;
- current-user taste profile computation;
- home previews and stats.

## Validation

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m compileall app
python -m pytest
alembic upgrade head
python -m scripts.seed_dev
```

```powershell
.\backend\scripts\smoke_sprint6.ps1
```

```powershell
cd frontend
pnpm install
pnpm build
```

Optional mobile preview syntax/dry-run checks:

```powershell
cloudflared --version
.\scripts\start_mobile_preview.ps1
.\scripts\stop_mobile_preview.ps1
```

## Non-Goals

Sprint 6 does not add onboarding changes, content authoring, learning, quizzes, social features, progress/bottle mechanics, premium features, admin CRUD, recommendations, AI, production external integrations, permanent public hosting, or deployment logic.
