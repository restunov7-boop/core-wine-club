# Telegram Mini App QA Checklist

Use this checklist for controlled Telegram Mini App readiness testing.

Layer summary:

- Sprint 20: app readiness for Telegram runtime.
- Sprint 21: bot foundation.
- Sprint 22: real Telegram QA with HTTPS tunnel.

For the end-to-end Telegram bot + HTTPS tunnel flow, see `docs/testing/telegram-real-qa.md`.

## Browser Dev Mode

- `VITE_DEV_TELEGRAM_MOCK=true` is set in `frontend/.env.local`.
- Backend runs on `http://127.0.0.1:8000`.
- Frontend runs on `http://127.0.0.1:5173`.
- `/home` signs in through dev mock auth.
- If onboarding is incomplete, app redirects to `/onboarding`.
- Core routes render in normal browser mode:
  - `/home`
  - `/learn`
  - `/quizzes`
  - `/diary`
  - `/bottle`
  - `/my-path`
  - `/admin`
- `/admin` shows access denied for the default member role.

## No Telegram Object

- Open the app in a normal desktop browser.
- Confirm the app does not crash when `window.Telegram` is absent.
- Confirm Telegram boot behavior is no-op outside Telegram.
- Confirm no page/component directly depends on `window.Telegram.WebApp`.

## Mocked Telegram-Like Runtime

If a test harness or browser console injects a Telegram-like object, verify that wrapper calls remain safe:

- `ready()` can be called once without visible error.
- `expand()` can be called without visible error.
- `setHeaderColor()` and `setBackgroundColor()` do not break browser rendering.
- Theme parameters, if present, can be reflected as CSS variables.

Do not paste real initData into screenshots, logs, docs, or shared chat.

## Real Telegram Test Preparation

- A Telegram bot must be created manually in `@BotFather`.
- Sprint 21 provides a local polling runner that can send the Mini App button.
- The Mini App URL must be HTTPS.
- Telegram rejects `http://localhost:5173` for Web App buttons.
- Frontend URL must point to the reachable frontend host or tunnel.
- `VITE_API_BASE_URL` must point to a reachable backend host or tunnel.
- Backend CORS must include the frontend HTTPS origin.
- `VITE_DEV_TELEGRAM_MOCK=false` must be used for real initData flow.
- Backend must validate Telegram initData and still enforce project membership and permissions.

Do not commit:

- tunnel URLs;
- bot tokens;
- raw initData;
- `.env.local`;
- temporary database, pid, log, or dist files.

## Smoke Checks

Frontend:

```powershell
cd frontend
pnpm build
pnpm smoke:routes
```

Backend:

```powershell
cd backend
python -m compileall app
python -m pytest
.\scripts\smoke_sprint6.ps1
```

## Known Limitations

- Sprint 20 does not configure production Telegram bot settings.
- Sprint 20 does not add deployment.
- Sprint 20 does not add paid channel access verification.
- Sprint 20 does not add payments, subscriptions, premium, paywall, monitoring, notifications, admin CRUD, CMS, social features, AI, points, achievements, badges, streaks, or leaderboards.
