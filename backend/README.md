# Backend

FastAPI backend for CORE Wine Club auth, onboarding, home, discoveries, learning foundation, progress ledger, Bottle UI foundation, diary, Sprint 5 taste profile foundation, and Sprint 6 quality tooling.

## Windows PowerShell Setup

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
alembic upgrade head
python -m scripts.seed_dev
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Or from the repository root:

```powershell
.\scripts\start_backend_dev.ps1
```

Use `-ResetDb` only when you intentionally want to delete the local SQLite dev database:

```powershell
.\scripts\start_backend_dev.ps1 -ResetDb
```

If virtual environment activation is blocked:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Healthcheck:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/v1/health
```

Alembic:

```powershell
alembic current
alembic upgrade head
alembic revision --autogenerate -m "describe_change"
```

Seed the default project:

```powershell
python -m scripts.seed_dev
```

Dev auth request:

```powershell
$session = Invoke-RestMethod `
  -Method Post `
  -Uri http://127.0.0.1:8000/api/v1/auth/telegram `
  -ContentType "application/json" `
  -Body '{"init_data":"dev_mock_init_data"}'
```

Call `/auth/me`:

```powershell
$headers = @{ Authorization = "Bearer $($session.data.access_token)" }
Invoke-RestMethod http://127.0.0.1:8000/api/v1/auth/me -Headers $headers
```

Onboarding status:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/v1/onboarding/status -Headers $headers
```

Complete onboarding:

```powershell
$body = @{
  wine_experience_level = "beginner"
  taste_preferences = @("red", "sparkling")
  goals = @("choose_bottle", "feel_confident")
  display_name = "Natasha"
} | ConvertTo-Json

Invoke-RestMethod `
  -Method Post `
  -Uri http://127.0.0.1:8000/api/v1/onboarding/complete `
  -Headers $headers `
  -ContentType "application/json" `
  -Body $body
```

Home foundation:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/v1/home -Headers $headers
```

Discoveries:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/v1/discoveries -Headers $headers
Invoke-RestMethod http://127.0.0.1:8000/api/v1/discoveries/how-to-read-wine-label -Headers $headers
```

Learning:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/v1/learning/paths -Headers $headers
Invoke-RestMethod http://127.0.0.1:8000/api/v1/learning/paths/wine-basics -Headers $headers
Invoke-RestMethod http://127.0.0.1:8000/api/v1/learning/lessons/how-wine-is-made -Headers $headers
```

Progress:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/v1/progress/summary -Headers $headers
Invoke-RestMethod -Method Post http://127.0.0.1:8000/api/v1/progress/lessons/how-wine-is-made/complete -Headers $headers
Invoke-RestMethod -Method Delete http://127.0.0.1:8000/api/v1/progress/lessons/how-wine-is-made/complete -Headers $headers
```

`/progress/summary` returns both learning counts and diary counts. Sprint 11 writes `diary.note.created` events when tasting notes are created; deleting a note does not delete that historical event.

Bottle:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/v1/bottle/progress -Headers $headers
```

Bottle progress uses published lesson completion plus up to 3 existing private diary notes. The source is `learning_and_diary`; no bottle table or gamification state is created.

Diary:

```powershell
$noteBody = @{
  wine_name = "Chianti Classico"
  producer = "Example Producer"
  country = "Italy"
  region = "Tuscany"
  grape = "Sangiovese"
  vintage = 2021
  wine_color = "red"
  sweetness = "dry"
  rating = 4
  tasted_at = "2026-06-29"
  aroma_notes = @("cherry", "spice")
  taste_notes = @("dry", "fresh")
  would_buy_again = $true
} | ConvertTo-Json

$note = Invoke-RestMethod `
  -Method Post `
  -Uri http://127.0.0.1:8000/api/v1/diary/notes `
  -Headers $headers `
  -ContentType "application/json" `
  -Body $noteBody

Invoke-RestMethod http://127.0.0.1:8000/api/v1/diary/notes -Headers $headers
Invoke-RestMethod "http://127.0.0.1:8000/api/v1/diary/notes/$($note.data.id)" -Headers $headers
```

Taste profile:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/v1/taste-profile -Headers $headers
```

Reset onboarding in local development:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri http://127.0.0.1:8000/api/v1/onboarding/reset-dev `
  -Headers $headers
```

## Environment

Sprint 1 auth uses:

- `JWT_SECRET`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_AUTH_MAX_AGE_SECONDS`
- `DEV_AUTH_ENABLED`
- `DEV_TELEGRAM_ID`
- `DEV_TELEGRAM_USERNAME`
- `DEV_TELEGRAM_FIRST_NAME`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `MOBILE_PREVIEW_ENABLED`

Local SQLite development commonly uses:

```env
APP_ENV=development
DATABASE_URL=sqlite:///C:/path/to/core-wine-club/backend/local_dev.db
DEV_AUTH_ENABLED=true
JWT_SECRET=dev_secret_change_me
CORS_ORIGINS=http://127.0.0.1:5173,http://localhost:5173
```

`MOBILE_PREVIEW_ENABLED=true` is only for local phone preview. When `APP_ENV` is not `production`, `DEV_AUTH_ENABLED=true`, and `MOBILE_PREVIEW_ENABLED=true`, backend CORS also accepts `https://*.trycloudflare.com`.

## Tests

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m compileall app
python -m pytest
```

The tests use an isolated SQLite database in the system temp directory. They reset schema per test and seed the default project plus demo discoveries and learning content.

## Smoke Check

Start the backend on port `8000`, then from the repository root run:

```powershell
.\backend\scripts\smoke_sprint6.ps1
```

The smoke script includes the Sprint 11 bottle and diary progress checks.

The script checks health, dev auth, `/auth/me`, onboarding reset/complete, home, discoveries, learning paths/lessons, progress summary, lesson complete/uncomplete, bottle progress, diary CRUD, taste profile, and deleted-note 404 behavior. Successful steps print `[OK] ...`.

## Discoveries

Sprint 3 adds project-scoped read-only discoveries:

- model/table: `discoveries`;
- unique `(project_id, slug)`;
- published-only filtering for normal users;
- idempotent demo seed for `doch-vinodela`;
- `/home` returns a small discoveries preview.

## Diary

Sprint 4 adds private tasting notes:

- model/table: `tasting_notes`;
- project-scoped through `project_id`;
- user-owned through `project_user_id`;
- `visibility` is forced to `private`;
- CRUD endpoints only return notes owned by the current `ProjectUser`;
- `/home` returns current user's diary note count.

## Learning Foundation

Sprint 8 adds project-scoped read-only learning:

- model/tables: `learning_paths`, `lessons`, `learning_path_lessons`;
- unique `(project_id, slug)` for paths and lessons;
- ordered lessons through `learning_path_lessons.sort_order`;
- published-only filtering for normal reads;
- idempotent demo seed for `doch-vinodela`;
- `/home` returns a small learning preview.

Sprint 8 does not persist lesson completion, progress, scores, or bottle state.

## Progress Ledger

Sprint 9 adds generic project-scoped, user-owned progress events:

- model/table: `progress_events`;
- every row has `project_id` and `project_user_id`;
- current event: `learning.lesson.completed` for `source_type = lesson`;
- idempotency is enforced by service lookup plus unique `(project_id, project_user_id, event_type, source_type, source_id)`;
- `/progress/summary` returns simple learning counts;
- learning endpoints compute completion state from the current user's events.

Sprint 9 does not add Bottle UI, points, achievements, quizzes, scores, or gamification.

## Bottle UI Foundation

Sprint 10 adds read-only bottle progress:

- endpoint: `GET /api/v1/bottle/progress`;
- reads from `ProgressEvent` through learning progress summary;
- counts only current user's completed published lessons;
- no new bottle table;
- `/home` returns a bottle preview section.

The bottle is a visualization layer only.

## Taste Profile

Sprint 5 adds a private dynamic taste profile:

- no new persisted profile table;
- computed from onboarding data and current user's private tasting notes;
- filters by `project_id`, `project_user_id`, and `visibility = private`;
- deterministic insights only, no AI or recommendations;
- `/home` returns a small taste profile preview.

## Sprint Boundary

Sprint 10 adds Bottle UI foundation only. It does not add AI, recommendations, public profiles, sharing, social features, achievements, quizzes, points, streaks, premium/payments, notifications, admin CRUD, CMS/editor, uploads, OCR/barcode, inventory, external wine databases, production hosting, or deployment.
