# Render Backend Deployment

Sprint 25 prepares the backend for a production-like Render Web Service. It does not deploy anything and does not include real secrets.

## Service

- Provider: Render
- Type: Web Service
- Root Directory: `backend`
- Build Command:

```bash
pip install -r requirements.txt
```

- Start Command:

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

## Environment Variables

Set these in Render dashboard, not in git:

```env
APP_ENV=production
DATABASE_URL=<supabase-postgres-url>
JWT_SECRET=<strong-random-secret>
DEV_AUTH_ENABLED=false
CORS_ORIGINS=https://your-vercel-frontend.vercel.app
TELEGRAM_BOT_TOKEN=<botfather-token>
TELEGRAM_WEB_APP_URL=https://your-vercel-frontend.vercel.app
TELEGRAM_BOT_ENABLED=true
TELEGRAM_BOT_POLLING_ALLOWED=false
TELEGRAM_AUTH_MAX_AGE_SECONDS=86400
```

`BACKEND_CORS_ORIGINS` and `ALLOWED_ORIGINS` are accepted aliases for `CORS_ORIGINS`, but use one convention per environment to avoid confusion.

## Database

Use Supabase Postgres through `DATABASE_URL`. The backend already uses SQLAlchemy and `psycopg`.

Run migrations as a Render shell/one-off command:

```bash
python -m alembic upgrade head
```

Optional demo/staging seed:

```bash
python -m scripts.seed_dev
```

Do not seed real production data with the dev seed unless that environment is explicitly a demo/staging environment.

## Limitations

- Render free web services may spin down after idle.
- Telegram webhooks require HTTPS, which Render provides for deployed services.
- Do not commit Render URLs, secrets, tokens, logs, or database URLs.
