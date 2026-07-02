# Telegram Bot Foundation

Sprint 21 adds a minimal local Telegram bot runner that opens the Wine Club Mini App. It is separate from the FastAPI app and does not start with the API server.

This sprint does not add production webhook deployment, hosting, payments, subscriptions, paid channel checks, premium logic, admin CRUD, CMS, social features, notifications, AI, gamification, or new product systems.

Layer summary:

- Sprint 20: app readiness for Telegram runtime.
- Sprint 21: bot foundation.
- Sprint 22: real Telegram QA with HTTPS tunnel.

## Structure

```text
backend/app/bot/
  __init__.py
  config.py
  keyboards.py
  messages.py
  runner.py

backend/scripts/run_telegram_bot.py
```

The bot uses `python-telegram-bot` in local polling mode. It does not write to the database and does not call Wine Club APIs.

## Environment

Use local PowerShell environment variables or a local env file that is not committed:

```powershell
$env:TELEGRAM_BOT_TOKEN="..."
$env:TELEGRAM_WEB_APP_URL="https://example-tunnel-url.trycloudflare.com"
$env:TELEGRAM_BOT_ENABLED="true"
$env:TELEGRAM_BOT_NAME="Дочь винодела"
$env:TELEGRAM_BOT_POLLING_ALLOWED="true"
```

Do not commit bot tokens, tunnel URLs, `.env`, or `.env.local`.

`TELEGRAM_WEB_APP_URL` is used for the Mini App button. Telegram Web App buttons require an HTTPS URL. `http://localhost:5173` is useful for browser development, but Telegram rejects it for Web App buttons.

## BotFather Setup

1. Open `@BotFather`.
2. Send `/newbot`.
3. Create a bot name and username.
4. Copy the token.
5. Put the token into a local PowerShell env variable or a private local env file.
6. Never commit the token.

## Running Locally

Start the frontend and backend separately for normal app testing. Then run the bot as a separate process:

```powershell
cd C:\Users\restu\Documents\core\core-wine-club\backend
.\.venv\Scripts\python.exe -m scripts.run_telegram_bot
```

The runner validates required env first. If `TELEGRAM_BOT_TOKEN` or `TELEGRAM_WEB_APP_URL` is missing, it exits with a clear safe message and does not print the token.

For real Telegram QA with a temporary HTTPS tunnel, see:

```text
docs/testing/telegram-real-qa.md
```

## Bot Commands

`/start` sends a Russian welcome message with one button:

```text
Открыть Дочь винодела
```

The button is a Telegram Web App button built from `TELEGRAM_WEB_APP_URL`.

`/help` sends a short message explaining how to open the Mini App and reminds that Telegram needs an HTTPS URL.

Unknown text receives a small fallback that suggests `/start`.

## Future Webhook Note

Production webhook deployment is intentionally not implemented in Sprint 21. A future sprint can add webhook setup after hosting, HTTPS, secrets management, monitoring, and deployment strategy are defined.

## Security

- The runner never prints the bot token.
- Tests use fake token strings only.
- Docs use placeholder URLs only.
- No database migrations or backend auth changes were added.
