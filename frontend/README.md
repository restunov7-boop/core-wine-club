# Frontend

React + TypeScript + Vite frontend for CORE Wine Club auth, onboarding, home, discoveries, learning paths and lesson completion, Bottle UI foundation, diary, Sprint 5 taste profile foundation, and Sprint 6 build validation.

## Windows PowerShell Setup

```powershell
cd frontend
corepack enable
pnpm install
pnpm dev -- --host 127.0.0.1 --port 5173
```

Or from the repository root:

```powershell
.\scripts\start_frontend_dev.ps1
```

Route check:

```powershell
Start-Process http://127.0.0.1:5173/home
```

## Environment

Frontend reads:

- `VITE_API_BASE_URL`
- `VITE_PROJECT_SLUG`
- `VITE_DEV_TELEGRAM_MOCK`

In development, `VITE_DEV_TELEGRAM_MOCK=true` lets the existing Telegram wrapper return mock initData/user. Components must continue using `shared/lib/telegram` rather than touching `window.Telegram.WebApp`.

Recommended `frontend/.env.local`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
VITE_PROJECT_SLUG=doch-vinodela
VITE_DEV_TELEGRAM_MOCK=true
```

## Local dev auth

Backend must be running on port `8000` before opening the frontend:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Create `frontend/.env.local`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
VITE_PROJECT_SLUG=doch-vinodela
VITE_DEV_TELEGRAM_MOCK=true
```

Then run the frontend:

```powershell
cd frontend
pnpm dev -- --host 127.0.0.1 --port 5173
```

`/home` automatically logs in with `dev_mock_init_data` when `VITE_DEV_TELEGRAM_MOCK=true`. `/admin` shows access denied for the default `member` role.

## Onboarding and home

When the backend is running and dev auth is enabled:

- `/home` signs in through the dev Telegram mock.
- If onboarding is incomplete, `/home` redirects to `/onboarding`.
- `/onboarding` saves wine experience, taste preferences, goals, and optional display name.
- After completion, the user returns to `/home`.
- `/home` renders the static Wine Club foundation page.
- `/admin` still shows access denied for the default `member` role.

## Discoveries

Sprint 3 adds protected read-only content routes:

- `/discoveries` shows seeded wine discoveries.
- `/discoveries/:slug` shows one discovery.
- `/home` shows a preview link to discoveries.

If onboarding is incomplete, discovery pages redirect to `/onboarding`, matching `/home`.

## Diary

Sprint 4 adds protected private diary routes:

- `/diary` shows current user's own tasting notes.
- `/diary/new` creates a private tasting note.
- `/diary/:noteId` shows one note.
- `/diary/:noteId/edit` edits one note.
- `/home` links to diary and shows note count.

If onboarding is incomplete, diary pages redirect to `/onboarding`, matching `/home` and `/discoveries`.

## Learning

Sprint 8 adds protected read-only learning routes:

- `/learn` shows seeded learning paths.
- `/learn/:pathSlug` shows one path and its ordered lessons.
- `/learn/lessons/:lessonSlug` shows one lesson.
- `/home` links to learning and shows a small preview.

If onboarding is incomplete, learning pages redirect to `/onboarding`, matching `/home`, `/discoveries`, and `/diary`.

Sprint 9 adds lesson completion controls:

- `/learn` shows completed lesson counts per path.
- `/learn/:pathSlug` shows `Завершено: X из Y` and completed lesson status.
- `/learn/lessons/:lessonSlug` can mark a lesson completed or remove the mark.
- `/home` shows completed/available lesson counts.

Learning pages do not show bottle fill, points, quizzes, achievements, or gamified progress.

## Bottle

Sprint 10 adds a protected bottle route:

- `/bottle` shows a CSS bottle visual powered by lesson completion progress.
- `/home` links to `/bottle` and shows fill/count stats.
- Completing or uncompleting lessons changes bottle progress through the existing backend ledger.

Bottle is not in bottom navigation yet; it is reachable from Home.

No achievements, points, streaks, badges, weekly bottle, quizzes, or social features are added.

## Taste Profile

Sprint 5 adds a protected private route:

- `/taste-profile` shows a personal taste summary.
- Stats are based only on onboarding and private diary notes.
- `/home` links to the taste profile and shows a small preview.

If onboarding is incomplete, `/taste-profile` redirects to `/onboarding`, matching `/home`, `/discoveries`, and `/diary`.

## App Shell

Sprint 7 wraps authenticated, onboarding-completed app routes in `AppShell`:

- `/home`
- `/bottle`
- `/discoveries`
- `/discoveries/:slug`
- `/diary`
- `/diary/new`
- `/diary/:noteId`
- `/diary/:noteId/edit`
- `/learn`
- `/learn/:pathSlug`
- `/learn/lessons/:lessonSlug`
- `/taste-profile`

The bottom navigation links to Home, Открытия, Уроки, Дневник, and Профиль. `/onboarding` stays focused without bottom navigation. `/admin` stays separate behind `AdminGuard`.

## Build Validation

```powershell
cd frontend
pnpm install
pnpm build
```

## Sprint Boundary

Sprint 10 adds Bottle UI foundation only. It does not add AI, recommendations, public profile, sharing, social features, achievements, points, streaks, badges, weekly bottle, quizzes, premium/payments, notifications, admin CRUD, CMS/editor, uploads, OCR/barcode, or external wine databases.
