# Sprint 5 - Taste Profile Foundation

## Goal

Sprint 5 adds a narrow private read-only taste profile for `doch-vinodela`.

## Implemented Scope

- Dynamic `GET /api/v1/taste-profile`.
- Profile computed from current `ProjectUser.onboarding_data_json`.
- Profile computed from current user's own private `TastingNote` records.
- Basic stats: notes count, average rating, would-buy-again ratio, wine colors, sweetness, aroma/taste tags, countries, regions.
- Deterministic insights with soft wording.
- `/home` taste profile preview with note count and average rating.
- Frontend `/taste-profile` page.

## Database

No migration was needed. Sprint 5 does not add a persisted taste profile table.

## Non-Goals

Sprint 5 does not add AI, recommendations, personalized feed, public profile, sharing, social comparison, follows, comments, likes, saves/bookmarks, club/social, bottle progress, weekly bottle, achievements, quizzes, learning progress, premium/payments, notifications, admin CRUD, CMS/editor, uploads, OCR/barcode, cellar/inventory, external wine databases, production Telegram changes, or deployment.

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

- `/taste-profile` shows empty state before diary notes.
- After notes exist, `/taste-profile` shows stats and insights.
- `/home` links to `/taste-profile`.
- `/diary` and `/discoveries` remain working.
- `/admin` remains access denied for the default `member`.
