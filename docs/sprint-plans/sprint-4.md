# Sprint 4 - Taste Diary Foundation

## Goal

Sprint 4 adds a narrow private tasting diary for `doch-vinodela`.

## Implemented Scope

- `TastingNote` backend model and `tasting_notes` table.
- Project-scoped notes through `project_id`.
- User-owned notes through `project_user_id`.
- Private-only visibility.
- CRUD API for the current user's own notes.
- `/home` diary stats with current user's note count.
- Frontend `/diary` list page.
- Frontend `/diary/new` create form.
- Frontend `/diary/:noteId` detail page.
- Frontend `/diary/:noteId/edit` edit form.

## Non-Goals

Sprint 4 does not add public feed, club, comments, likes, follows, saves/bookmarks, sharing, leaderboards, bottle progress, weekly bottle, achievements, quizzes, learning progress, recommendations, premium/payments, notifications, admin CRUD, CMS/editor, uploads, OCR, barcode scanning, cellar/inventory, external wine databases, production Telegram changes, or deployment.

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

- `/diary` shows empty state or current user's notes.
- `/diary/new` creates a private note.
- `/diary/:noteId` opens note detail.
- `/diary/:noteId/edit` updates a note.
- Delete removes a note and returns to `/diary`.
- `/home` links to diary and shows note count.
- `/admin` remains access denied for the default `member`.
