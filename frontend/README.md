# Frontend

React + TypeScript + Vite frontend for CORE Wine Club auth, onboarding, home, discoveries, learning paths and lesson completion, quizzes foundation and completion state, Bottle UI foundation, diary, taste profile, My Path, UX readiness, and build validation.

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
- `/home` renders the Wine Club foundation page with a My Path preview.
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

## Quizzes

Sprint 16 adds protected quiz routes:

- `/quizzes` shows published quizzes.
- `/quizzes/:quizSlug` lets the user answer single-choice questions and check answers.
- Results are local to the page and can be cleared with `Попробовать ещё раз`.
- Quiz detail does not show correct answers before submit.
- Perfect quiz checks mark the quiz completed through the backend progress ledger.
- Quiz checks do not persist attempts, full answer history, points, achievements, badges, or streaks.

The bottom navigation is unchanged; quizzes are reachable from Home and direct route.

## Bottle

Sprint 10 adds a protected bottle route. Sprint 11 extends its progress source to learning plus diary. Sprint 12 adds recent activity preview:

- `/bottle` shows a CSS bottle visual powered by lesson completion progress and up to 3 existing private diary notes.
- `/home` links to `/bottle` and shows fill/count stats.
- `/bottle` shows up to 3 recent activity events and links to `/progress`.
- Completing or uncompleting lessons changes the learning part of bottle progress.
- Creating or deleting diary notes changes the current diary contribution.
- The next action comes from the backend: continue lessons, add a diary note, or view the taste profile.

Bottle is not in bottom navigation yet; it is reachable from Home.

No achievements, points, streaks, badges, weekly bottle, or social features are added.

## Progress Activity

Sprint 12 adds a protected personal activity route:

- `/progress` shows recent progress events newest first.
- It is based on backend `GET /progress/activity`.
- Items can link to lesson details or existing diary note details.
- Deleted diary note events remain readable but do not link to deleted note pages.
- `/home` shows a small activity card linking to `/progress`.

This is not a feed and does not add points, badges, streaks, comments, likes, or sharing.

## My Path

Sprint 13 adds a protected personal route:

- `/my-path` shows summary cards for lessons, diary, quizzes, bottle, and recent activity.
- It renders deterministic next actions from the backend.
- `/home` shows the `Что дальше` preview with up to 2 actions.
- The bottom navigation is unchanged.

This is not an AI recommendation engine and does not add achievements, points, badges, streaks, or social features.

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
- `/progress`
- `/my-path`
- `/quizzes`
- `/quizzes/:quizSlug`
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

## UX Readiness

Sprint 14 polishes the existing app without adding a new product domain:

- Home is ordered around `Что дальше`, bottle progress, learning, diary, profile, activity, and discoveries.
- Shared loading, error, and empty states use calmer copy and clearer actions.
- Bottle explains that lessons and diary notes fill the current bottle.
- My Path uses `Что дальше` / `Твой маршрут` language rather than recommendation language.
- Progress is private activity history, not a feed.
- Mobile spacing, focus states, and bottom nav fit were tightened for small screens.

## Build Validation

```powershell
cd frontend
pnpm install
pnpm build
```

Route smoke:

```powershell
cd frontend
pnpm smoke:routes
```

The route smoke expects the frontend dev server to be running on `http://127.0.0.1:5173` unless `FRONTEND_BASE_URL` is set.

## Sprint Boundary

Sprint 17 adds quiz completion state and progress read-model integration only. It does not add quiz attempt persistence, full answer history, AI, recommendations, public profile, sharing, social features, achievements, points, streaks, badges, weekly bottle, premium/payments, notifications, admin CRUD, CMS/editor, uploads, OCR/barcode, or external wine databases.
