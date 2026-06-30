# Sprint 2

## Goal

Create the first real post-auth user flow: lightweight onboarding and a static home foundation.

## Implemented Scope

- `GET /api/v1/onboarding/status`.
- `POST /api/v1/onboarding/complete`.
- `POST /api/v1/onboarding/reset-dev` for local development.
- `GET /api/v1/home`.
- `ProjectUser.onboarding_data_json`.
- Frontend `/onboarding` mobile-first flow.
- Frontend `/home` page backed by `GET /home`.
- Redirect from `/home` to `/onboarding` when onboarding is incomplete.

## Explicitly Out Of Scope

- Content system.
- Learning routes.
- Quizzes.
- Diary/tasting notes.
- Club/feed/comments.
- Progress/bottle.
- Achievements.
- Premium/payments.
- Notifications.
- Admin CRUD.

## Windows PowerShell Validation

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
alembic upgrade head
python -m scripts.seed_dev
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

```powershell
$session = Invoke-RestMethod `
  -Method Post `
  -Uri http://127.0.0.1:8000/api/v1/auth/telegram `
  -ContentType "application/json" `
  -Body '{"init_data":"dev_mock_init_data"}'

$headers = @{ Authorization = "Bearer $($session.data.access_token)" }
Invoke-RestMethod http://127.0.0.1:8000/api/v1/onboarding/status -Headers $headers
Invoke-RestMethod http://127.0.0.1:8000/api/v1/home -Headers $headers
```
