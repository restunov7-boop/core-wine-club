# Telegram Bot QA Checklist

Use this checklist for Sprint 21 bot foundation checks.

## Local Configuration

- A bot was created manually in `@BotFather`.
- `TELEGRAM_BOT_TOKEN` is set locally and is not committed.
- `TELEGRAM_WEB_APP_URL` is set locally.
- For real Telegram mobile testing, `TELEGRAM_WEB_APP_URL` is HTTPS.
- Temporary tunnel URLs are not committed.

PowerShell example:

```powershell
$env:TELEGRAM_BOT_TOKEN="..."
$env:TELEGRAM_WEB_APP_URL="https://example-tunnel-url.trycloudflare.com"
```

## Safe Failure Checks

From `backend`:

```powershell
.\.venv\Scripts\python.exe -m scripts.run_telegram_bot
```

Expected when env is missing:

- clear configuration error;
- no token printed;
- no polling started.

## Bot Behavior

When real local bot env is configured:

- Start the runner in polling mode.
- Send `/start` to the bot.
- Confirm the welcome message is in Russian.
- Confirm there is one button: `Открыть Дочь винодела`.
- Click the button and confirm it opens the configured Mini App URL.
- Send `/help` and confirm the short help message appears.
- Send ordinary text and confirm the fallback suggests `/start`.
- Stop the runner with `Ctrl+C`.

## App Sanity

- Backend still starts independently from the bot.
- Frontend still works in normal browser dev mode.
- Telegram Mini App runtime remains isolated in the frontend wrapper.
- The bot runner is not started automatically by FastAPI.

## Automated Checks

Backend:

```powershell
cd backend
python -m compileall app scripts
python -m pytest
```

Frontend:

```powershell
cd frontend
pnpm build
pnpm smoke:routes
```

Repository hygiene:

- no `.env` or `.env.local` committed;
- no token committed;
- no real tunnel URL committed;
- no temporary `.pid`, `.log`, `.db`, `.tmp`, or `dist` files committed.

## Out of Scope

Sprint 21 does not test production deployment, webhooks, payments, paid channel access checks, premium subscriptions, admin tools, CMS, social features, broadcasts, notifications, AI, gamification, or new product systems.
