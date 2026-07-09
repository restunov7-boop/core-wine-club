# Security and Production Readiness Audit

Sprint 43 security audit checklist for CORE Wine Club.

Do not paste secrets into chat, docs, issue comments, screenshots, commit messages, or logs.

## Security Checklist

- `.env`, `.env.*`, local logs, SQLite/db files, Python caches, frontend `dist`, and local pid files must stay ignored.
- No real `.env` file should be committed.
- No build outputs, screenshots, logs, or local artifacts should be committed.
- Docs should use placeholders for secrets and connection strings.
- Frontend hiding is not security; backend permission checks must protect user-owned data.
- User-owned project data must be filtered by `project_user_id`.
- Project-scoped data must be filtered by `project_id`.
- Premium/access should remain state/capability, not a user role.

## Environment Checklist

### Vercel

```env
VITE_API_BASE_URL=https://core-wine-club.onrender.com/api/v1
VITE_PROJECT_SLUG=doch-vinodela
VITE_DEV_TELEGRAM_MOCK=false
```

After changing Vercel env variables, redeploy frontend. `VITE_*` variables are build-time values.

### Render

```env
APP_ENV=production
DATABASE_URL=<supabase-pooler-postgres-url>
JWT_SECRET=<strong-random-secret>
DEV_AUTH_ENABLED=false
CORS_ORIGINS=https://core-wine-club-frontend-theta.vercel.app
TELEGRAM_BOT_TOKEN=<botfather-token>
TELEGRAM_WEB_APP_URL=https://core-wine-club-frontend-theta.vercel.app
TELEGRAM_BOT_ENABLED=true
TELEGRAM_BOT_POLLING_ALLOWED=false
TELEGRAM_AUTH_MAX_AGE_SECONDS=86400
```

Use the frontend root for CORS and Telegram Web App URL. Do not add `/home` and do not add a trailing slash.

Use the Supabase pooler URL for `DATABASE_URL`. Do not use the direct host:

```text
db.spjwanjgioebodahmyfp.supabase.co
```

After changing Render env variables, trigger a manual deploy if Render does not restart the service automatically.

## Secret Rotation Checklist

- Treat any password previously shared in chat as potentially compromised.
- Rotate the Supabase database password if it has not already been rotated.
- After rotation, update Render `DATABASE_URL` with the new Supabase pooler connection string.
- Redeploy Render backend after updating `DATABASE_URL`.
- Rotate BotFather token if it was ever exposed.
- Rotate `JWT_SECRET` if it was ever exposed.
- Never ask anyone to paste secrets into chat.

## Deployment Checklist

- Check backend health: `https://core-wine-club.onrender.com/api/v1/health`.
- Check Vercel frontend opens at the production root.
- Check Telegram `/start` opens the Mini App using the Web App button.
- Check Telegram auth lands on `/home`.
- Check `/telegram-debug` only for QA and do not expose full initData.
- Check `/home`.
- Check `/diary`.
- Check `/diary/shelf`.
- Check `/profile`.
- Check `/taste-map`.
- Check `/dictionary`.
- Check `/offline-tastings`.

## Supabase Migration Checklist

- Run production migrations only from a trusted local shell or deployment shell.
- Do not store production credentials in repo files.
- Do not print the real `DATABASE_URL`.
- For Wine Shelf, `wine_shelf_items` migration was applied manually to production Supabase using the pooler `DATABASE_URL`.
- Re-check Wine Shelf after migrations:
  - add from diary note;
  - open `/diary/shelf`;
  - filter by status;
  - update status;
  - delete item.

## Telegram Mini App QA Checklist

- Bot `/start` responds.
- Mini App button uses `web_app`, not a plain URL button.
- Telegram WebApp object is present in production Telegram.
- initData is detected.
- `/home` opens after auth.
- Back navigation feels stable.
- No horizontal scroll in mobile viewport.
- Bottom navigation does not overlap primary actions.

## Known Production Notes

- Render free tier may sleep after idle.
- Vercel env changes require redeploy.
- Render env changes may require manual deploy.
- Supabase direct host is not recommended for this deployment path.
- Wine Shelf countries may remain visible in Taste Map after diary note deletion if shelf items still contain those countries.
