# Telegram Mini App Readiness

Sprint 20 prepares the app for controlled Telegram Mini App testing. It does not add production deployment, paid channel access verification, payments, subscriptions, premium logic, or public launch workflow.

## Runtime Isolation

Frontend Telegram access is isolated in:

```text
frontend/src/shared/lib/telegram/telegramClient.ts
frontend/src/shared/lib/telegram/useTelegram.ts
frontend/src/shared/lib/telegram/useTelegramRuntime.ts
```

Normal pages and feature components should not access `window.Telegram` or `window.Telegram.WebApp` directly.

The wrapper exposes safe functions for browser and Telegram runtime:

- `isTelegramMiniApp()`
- `getInitData()` / `getTelegramInitData()`
- `getUser()` / `getTelegramUser()`
- `ready()`
- `expand()`
- `setHeaderColor()`
- `setBackgroundColor()`
- `enableClosingConfirmation()`
- `disableClosingConfirmation()`

Outside Telegram these functions return empty values or no-op safely.

## Boot Behavior

`frontend/src/shared/lib/telegram/useTelegramRuntime.ts` runs once near app startup from `frontend/src/app/App.tsx`.

It:

- applies Telegram theme parameters to CSS variables when available;
- calls `ready()` and `expand()` only inside a real Telegram Mini App runtime;
- sets header/background colors only inside Telegram.

Browser dev mode remains supported and should not crash when `window.Telegram` is absent.

## Auth Modes

Development mock mode:

- Frontend: `VITE_DEV_TELEGRAM_MOCK=true`
- Backend: `DEV_AUTH_ENABLED=true`
- Frontend sends `dev_mock_init_data` to `POST /api/v1/auth/telegram`.
- This is for local development and controlled demos only.

Real Telegram initData mode:

- Frontend: `VITE_DEV_TELEGRAM_MOCK=false`
- The app reads Telegram `WebApp.initData` through the wrapper.
- Frontend sends initData to `POST /api/v1/auth/telegram`.
- Backend remains the source of truth for validation, user identity, project membership, role, status, and permissions.

Do not show raw initData in UI. Do not log raw initData by default. Do not commit initData, bot tokens, tunnel URLs, or secrets.

## Backend Environment

Common local variables:

```env
APP_ENV=development
DATABASE_URL=sqlite:///./dev.db
DEV_AUTH_ENABLED=true
JWT_SECRET=change_me_locally
CORS_ORIGINS=http://127.0.0.1:5173,http://localhost:5173
```

For tunnel-based Telegram testing, add the frontend tunnel origin to backend CORS. Do not commit the tunnel URL.

## Frontend Environment

Local browser dev:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
VITE_PROJECT_SLUG=doch-vinodela
VITE_DEV_TELEGRAM_MOCK=true
```

Telegram-like test with real initData:

```env
VITE_API_BASE_URL=https://<backend-tunnel-or-host>/api/v1
VITE_PROJECT_SLUG=doch-vinodela
VITE_DEV_TELEGRAM_MOCK=false
```

Do not commit `.env.local`.

## Local Browser Dev

Backend:

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
alembic upgrade head
python -m scripts.seed_dev
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Frontend:

```powershell
cd frontend
pnpm install
pnpm dev -- --host 127.0.0.1 --port 5173
```

Open:

```text
http://127.0.0.1:5173/home
```

## HTTPS Tunnel Testing

Telegram Mini Apps require an HTTPS URL. For local testing, use a temporary tunnel such as Cloudflare Tunnel or another approved tool.

The repository includes an optional helper:

```powershell
.\scripts\start_mobile_preview.ps1
.\scripts\stop_mobile_preview.ps1
```

This helper is for dev/mobile preview only. It is not production hosting, does not configure a Telegram bot, and should not be used with production credentials.

## Known Limitations

- No production bot setup.
- No production deployment.
- No paid channel verification.
- No payments, subscriptions, premium, or paywall logic.
- No monitoring or public launch hardening.
- No admin CMS workflow.
- Real Telegram testing still requires a configured bot and HTTPS frontend URL outside this repository.
