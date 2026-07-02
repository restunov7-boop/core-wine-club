# Real Telegram QA with HTTPS Tunnel

Sprint 22 codifies a controlled real Telegram QA flow. It is not production deployment, public launch, paid channel verification, payments, subscriptions, premium logic, admin tooling, CMS, social features, notifications, AI, or gamification.

Layer summary:

- Sprint 20: app readiness for Telegram runtime.
- Sprint 21: bot foundation with Mini App button.
- Sprint 22: real Telegram QA with local services and a temporary HTTPS tunnel.

## Prerequisites

- Bot created manually in `@BotFather`.
- `TELEGRAM_BOT_TOKEN` available locally and not committed.
- Backend can run locally.
- Frontend can run locally.
- HTTPS tunnel tool is available, for example Cloudflare Tunnel or ngrok.
- Telegram mobile or desktop is available for the manual test.

## Start Local Services

Backend:

```powershell
cd C:\Users\restu\Documents\core\core-wine-club
.\scripts\start_backend_dev.ps1
```

Frontend:

```powershell
cd C:\Users\restu\Documents\core\core-wine-club
.\scripts\start_frontend_dev.ps1
```

## HTTPS Tunnel

Telegram Web App buttons require HTTPS. `http://localhost:5173` and other plain HTTP URLs are rejected by Telegram for Web App buttons.

Use one of these options:

### Cloudflare Mobile Preview Helper

If `cloudflared` is installed, the existing helper can start local backend, local frontend, and Cloudflare Quick Tunnels:

```powershell
cd C:\Users\restu\Documents\core\core-wine-club
.\scripts\start_mobile_preview.ps1
```

Use the printed frontend public URL as `TELEGRAM_WEB_APP_URL`.

Stop it after QA:

```powershell
.\scripts\stop_mobile_preview.ps1
```

Use `-Clean` only when you want to remove temporary mobile preview logs/state:

```powershell
.\scripts\stop_mobile_preview.ps1 -Clean
```

### Manual Cloudflare Tunnel

```powershell
cloudflared tunnel --url http://127.0.0.1:5173
```

Copy the temporary `https://...trycloudflare.com` URL. Do not commit it.

### ngrok Alternative

```powershell
ngrok http 5173
```

Copy the temporary HTTPS forwarding URL. Do not commit it.

Tunnel URLs change often. Treat them as temporary local QA values only.

## Configure Bot Environment

Use local PowerShell variables:

```powershell
$env:TELEGRAM_BOT_TOKEN="..."
$env:TELEGRAM_WEB_APP_URL="https://your-temporary-tunnel-url"
$env:TELEGRAM_BOT_POLLING_ALLOWED="true"
```

Do not put real values in committed files.

Check env safely:

```powershell
cd C:\Users\restu\Documents\core\core-wine-club
.\scripts\check_telegram_qa_env.ps1
```

Optional port check:

```powershell
.\scripts\check_telegram_qa_env.ps1 -CheckPorts
```

## Start Bot Polling

Either use the helper:

```powershell
cd C:\Users\restu\Documents\core\core-wine-club
.\scripts\start_telegram_bot_dev.ps1
```

Or run the backend module directly:

```powershell
cd C:\Users\restu\Documents\core\core-wine-club\backend
.\.venv\Scripts\python.exe -m scripts.run_telegram_bot
```

## Telegram Test

- Open the bot in Telegram.
- Send `/start`.
- Confirm the welcome message appears.
- Click `Открыть Дочь винодела`.
- Confirm the Mini App opens.
- Confirm there is no crash.
- Confirm theme and viewport are acceptable.
- Confirm auth behavior is understandable.
- If onboarding is incomplete, confirm onboarding appears.
- Check main routes:
  - `/home`
  - `/learn`
  - `/quizzes`
  - `/diary`
  - `/bottle`
  - `/my-path`
  - `/admin`

For a normal member, `/admin` should show access denied.

## Record Results

Record:

- date/time;
- device and Telegram client;
- tunnel provider;
- whether `/start` worked;
- whether the Web App button opened;
- whether auth/onboarding was understandable;
- any visible UI issues;
- screenshots only if they do not reveal secrets, raw initData, tokens, or private user data.

## Common Failures

- `http://localhost:5173` is rejected by Telegram Web App buttons. Use HTTPS.
- The tunnel URL changed after restart. Update `TELEGRAM_WEB_APP_URL` and restart the bot.
- Backend CORS does not include the frontend tunnel origin. For mobile preview, use `MOBILE_PREVIEW_ENABLED=true`; otherwise configure CORS for the test origin.
- Frontend points to an unreachable backend. Check `VITE_API_BASE_URL`.

## Repository Hygiene

Do not commit:

- bot token;
- tunnel URL;
- `.env`;
- `.env.local`;
- logs;
- pid files;
- temporary DB files;
- `dist`.
