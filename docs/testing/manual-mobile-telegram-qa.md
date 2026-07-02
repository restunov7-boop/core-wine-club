# Manual Mobile Telegram QA Runbook

Sprint 24 is a controlled manual QA pass for:

```text
Telegram bot -> Web App button -> HTTPS Mini App URL -> frontend -> backend -> user journey
```

This is not production deployment, public launch, paid channel verification, payments, subscriptions, premium logic, admin CRUD, CMS, social features, notifications, AI, gamification, wine room, bottle shelf, or a new product system.

## A. Local Backend

Start from the repository root:

```powershell
cd C:\Users\restu\Documents\core\core-wine-club
.\scripts\start_backend_dev.ps1
```

Expected:

- backend listens on `http://127.0.0.1:8000`;
- health endpoint responds:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/v1/health
```

## B. Local Frontend

In a second PowerShell window:

```powershell
cd C:\Users\restu\Documents\core\core-wine-club
.\scripts\start_frontend_dev.ps1
```

Expected:

- frontend listens on `http://127.0.0.1:5173`;
- normal browser dev mode opens `/home`.

## C. HTTPS Tunnel

Telegram Web App buttons require HTTPS. `http://localhost:5173` and other plain HTTP URLs are invalid for Telegram Web App buttons.

Do not commit tunnel URLs. Temporary tunnel URLs may change every run.

### Existing Mobile Preview Helper

If `cloudflared` is installed, the existing helper can start local backend, frontend, and Cloudflare Quick Tunnels:

```powershell
cd C:\Users\restu\Documents\core\core-wine-club
.\scripts\start_mobile_preview.ps1
```

Use the printed frontend public HTTPS URL as `TELEGRAM_WEB_APP_URL`.

Stop after QA:

```powershell
.\scripts\stop_mobile_preview.ps1
```

Optional cleanup of mobile preview state/logs:

```powershell
.\scripts\stop_mobile_preview.ps1 -Clean
```

### Manual Cloudflare Tunnel

```powershell
cloudflared tunnel --url http://127.0.0.1:5173
```

Copy the temporary `https://...trycloudflare.com` URL.

### ngrok Alternative

```powershell
ngrok http 5173
```

Copy the temporary HTTPS forwarding URL.

## D. Bot Environment

Use placeholders here; never commit real values:

```powershell
$env:TELEGRAM_BOT_TOKEN="..."
$env:TELEGRAM_WEB_APP_URL="https://your-temporary-tunnel-url"
```

Check local env safely:

```powershell
cd C:\Users\restu\Documents\core\core-wine-club
.\scripts\check_telegram_qa_env.ps1
```

## E. Bot Polling

Direct module command:

```powershell
cd C:\Users\restu\Documents\core\core-wine-club\backend
.\.venv\Scripts\python.exe -m scripts.run_telegram_bot
```

Helper command from repo root:

```powershell
cd C:\Users\restu\Documents\core\core-wine-club
.\scripts\start_telegram_bot_dev.ps1
```

Expected:

- polling starts;
- token is not printed;
- Ctrl+C stops the runner.

## F. Telegram Mobile Test

- Open the bot in Telegram.
- Send `/start`.
- Confirm the welcome message appears.
- Confirm the button appears: `Открыть Дочь винодела`.
- Tap the button.
- Confirm the Mini App opens.
- Confirm there is no blank screen.
- Confirm there is no crash.
- Confirm theme and viewport look acceptable.
- Confirm onboarding opens if needed.
- Confirm Home opens after onboarding.
- Confirm bottom navigation is usable.
- Check main routes:
  - `/home`
  - `/learn`
  - `/quizzes`
  - `/diary`
  - `/bottle`
  - `/progress`
  - `/taste-profile`
  - `/my-path`
  - `/admin`

For the default member role, `/admin` should show access denied.

## Record The Result

Use:

```text
docs/testing/manual-mobile-telegram-qa-result.md
```

Do not paste raw Telegram initData, tokens, tunnel URLs that should remain private, or screenshots with sensitive data into committed files.
