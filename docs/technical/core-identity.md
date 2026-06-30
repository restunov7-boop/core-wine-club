# CORE Identity And Access Foundation

## Architecture Rules

- `User` is the global CORE platform user, not a Telegram user.
- `TelegramIdentity` stores Telegram-specific identity data and links to `User`.
- `ProjectUser` is required for every User to Project relationship.
- Premium is access state on `ProjectUser`, not a role.
- Frontend route hiding is not security. Backend permission dependencies are the source of truth.
- Telegram SDK access remains isolated in `frontend/src/shared/lib/telegram`.

## Roles

- `member`: `view_app`
- `moderator`: `view_app`, `moderate_content`
- `admin`: `view_app`, `access_admin`, `moderate_content`, `manage_content`, `manage_users`, `manage_premium`, `view_analytics`
- `owner`: all capabilities

## Auth Flow

1. Frontend receives Telegram initData through the isolated Telegram wrapper.
2. Frontend calls `POST /api/v1/auth/telegram`.
3. Backend validates initData or uses development mock auth when enabled.
4. Backend finds or creates `User`, `TelegramIdentity`, default `Project`, and `ProjectUser`.
5. Backend returns a signed bearer token.
6. Frontend stores the token in Zustand state and uses it for `/auth/me`.

## Windows PowerShell Checks

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
Invoke-RestMethod http://127.0.0.1:8000/api/v1/auth/me -Headers $headers
```
