# Mobile Preview

## Purpose

Mobile Preview is a Sprint 6 development helper for checking the local app from a real phone.

For Sprint 20, treat this as an optional Telegram Mini App readiness helper. It can provide temporary HTTPS URLs for a controlled test, but it is not production hosting and does not configure a Telegram bot.

It starts the local backend, local frontend, and two Cloudflare Quick Tunnels:

- one public URL for the backend;
- one public URL for the frontend.

The phone opens the frontend public URL. The frontend is started with `VITE_API_BASE_URL` pointing to the backend public URL, not to `127.0.0.1`, because on a phone `127.0.0.1` means the phone itself.

## Requirements

- Windows PowerShell.
- Existing backend virtual environment at `backend/.venv`.
- Installed frontend dependencies or available `pnpm install`.
- `cloudflared` available in `PATH`.
- The computer must stay powered on and connected to the internet while preview is active.

Check Cloudflare Tunnel:

```powershell
cloudflared --version
```

If it is missing, install Cloudflare Tunnel, reopen PowerShell, and retry the version check. The project scripts do not install it automatically.

## Start

From the repository root:

```powershell
.\scripts\start_mobile_preview.ps1
```

The script:

- uses `backend/mobile_preview.db`;
- runs `alembic upgrade head`;
- runs `python -m scripts.seed_dev`;
- starts backend on `127.0.0.1:8000`;
- starts a backend tunnel;
- starts frontend on `127.0.0.1:5173`;
- starts a frontend tunnel;
- prints the phone URL.

Expected final output:

```text
Mobile preview is ready.

Open this URL on your phone:
<frontend_public_url>

Backend tunnel:
<backend_public_url>

Stop with:
.\scripts\stop_mobile_preview.ps1
```

## Stop

From the repository root:

```powershell
.\scripts\stop_mobile_preview.ps1
```

The stop script reads `.tmp/mobile-preview/pids.json` and stops only the recorded backend, frontend, and tunnel PIDs. It does not kill all `node`, `python`, or `cloudflared` processes globally.

To remove temporary logs and state:

```powershell
.\scripts\stop_mobile_preview.ps1 -Clean
```

`-Clean` removes only `.tmp/mobile-preview`. It does not delete `backend/mobile_preview.db`.

## Logs

Logs are written to:

```text
.tmp/mobile-preview/backend.log
.tmp/mobile-preview/frontend.log
.tmp/mobile-preview/backend-tunnel.log
.tmp/mobile-preview/frontend-tunnel.log
```

Auxiliary stdout/error files may also appear in the same folder.

## CORS

Mobile preview sets:

```env
DEV_AUTH_ENABLED=true
MOBILE_PREVIEW_ENABLED=true
```

Only when both are enabled and `APP_ENV` is not `production`, backend CORS allows:

- `http://127.0.0.1:5173`;
- `http://localhost:5173`;
- `https://*.trycloudflare.com`.

Normal and production behavior is unchanged.

## Notes

- Cloudflare Quick Tunnel URLs are temporary.
- This is dev-only tooling.
- Do not use Mobile Preview for production hosting.
- Do not commit Cloudflare tunnel URLs.
- Do not put real production Telegram credentials or user data into this preview flow.
- Real Telegram Mini App testing still requires bot configuration outside this script.
