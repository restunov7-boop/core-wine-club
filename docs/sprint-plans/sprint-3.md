# Sprint 3 - Content Foundation / Wine Discoveries

## Goal

Sprint 3 adds the first real content layer for `doch-vinodela`: project-scoped, read-only wine discoveries.

## Implemented Scope

- `Discovery` backend model and `discoveries` table.
- Published-only discovery list and detail endpoints.
- Idempotent local seed with seven demo discoveries.
- `/home` preview with the first three published discoveries.
- Frontend `/discoveries` list page.
- Frontend `/discoveries/:slug` detail page.
- Onboarding guard consistency for discovery pages.

## Non-Goals

Sprint 3 does not add quizzes, progress, diary/tasting notes, feed/comments, likes, saves, weekly bottle, achievements, premium/payments, notifications, admin CRUD, CMS/editor, uploads, recommendations, production Telegram changes, or deployment.

## Validation

```powershell
cd backend
python -m compileall app
alembic upgrade head
python -m scripts.seed_dev
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

```powershell
cd frontend
pnpm install
pnpm build
pnpm dev -- --host 127.0.0.1 --port 5173
```

Expected local routes:

- `/home` shows discovery preview after onboarding.
- `/discoveries` shows the seeded list.
- `/discoveries/how-to-read-wine-label` shows a detail page.
- `/admin` remains access denied for the default `member`.
