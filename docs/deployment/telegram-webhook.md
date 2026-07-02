# Telegram Webhook Deployment

Sprint 25 adds a minimal Telegram webhook endpoint for production-like deployment. It does not configure the real bot or call BotFather.

## Endpoint

```text
POST https://your-render-backend.onrender.com/api/v1/bot/telegram/webhook
```

The endpoint:

- is disabled unless `TELEGRAM_BOT_ENABLED=true`;
- validates bot token and Web App URL before processing;
- accepts Telegram Update JSON;
- handles `/start`, `/help`, and unknown text fallback;
- sends the existing Mini App button using `TELEGRAM_WEB_APP_URL`;
- does not start polling or any background bot process.

## Required Backend Env

```env
TELEGRAM_BOT_TOKEN=<botfather-token>
TELEGRAM_WEB_APP_URL=https://your-vercel-frontend.vercel.app
TELEGRAM_BOT_ENABLED=true
TELEGRAM_BOT_POLLING_ALLOWED=false
```

Do not commit the real token or real URL.

## Set Webhook

Use placeholders only in docs:

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
  -d "url=https://your-render-backend.onrender.com/api/v1/bot/telegram/webhook"
```

Telegram requires HTTPS webhook URLs.

## Polling Conflict

Before switching between local polling and webhook mode, clear the previous mode if needed:

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/deleteWebhook"
```

Then local polling can be used again with:

```powershell
cd C:\Users\restu\Documents\core\core-wine-club\backend
.\.venv\Scripts\python.exe -m scripts.run_telegram_bot
```

Production-like deployment should use webhook mode, not always-on polling.

## Out Of Scope

No paid channel verification, payments, subscriptions, premium, broadcasts, notification system, or production launch automation is added in Sprint 25.
