# Deployment Checklist

Sprint 25 prepares this checklist. It does not perform deployment.

## Sequence

1. Push repository to GitHub.
2. Create Supabase project.
3. Copy the Supabase pooler Postgres connection string into Render `DATABASE_URL`.
4. Create Render Web Service for `backend`.
5. Set backend env variables in Render.
6. Run migrations:

```bash
python -m alembic upgrade head
```

7. Optional demo/staging seed:

```bash
python -m scripts.seed_dev
```

8. Create Vercel project for `frontend`.
9. Set Vercel env:

```env
VITE_API_BASE_URL=https://core-wine-club.onrender.com/api/v1
VITE_PROJECT_SLUG=doch-vinodela
VITE_DEV_TELEGRAM_MOCK=false
```

10. Redeploy frontend.
11. Add final Vercel URL to backend CORS in Render:

```env
CORS_ORIGINS=https://core-wine-club-frontend-theta.vercel.app
TELEGRAM_WEB_APP_URL=https://core-wine-club-frontend-theta.vercel.app
```

Do not add `/home` or a trailing slash.
12. Set Telegram bot env in Render.
13. Configure Telegram webhook:

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook" \
  -d "url=https://your-render-backend.onrender.com/api/v1/bot/telegram/webhook"
```

14. Smoke check backend:

```text
https://core-wine-club.onrender.com/api/v1/health
```

15. Smoke check frontend opens.
16. Check auth flow inside Telegram Mini App.
17. Open `/home`.
18. Send `/start` to bot.
19. Confirm Mini App button opens the Vercel URL.

## Rollback / Cleanup

- Unset Telegram webhook:

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/deleteWebhook"
```

- Remove or rotate leaked env variables immediately.
- Pause Render service if needed.
- Remove Vercel env values if a test deployment should be disabled.
- Rotate BotFather token if it was exposed.
- Rotate the Supabase database password if it was exposed or may have been pasted into chat.
- After rotating Supabase DB password, update Render `DATABASE_URL` with the new pooler URL and redeploy backend.

## Safety

Do not commit:

- Supabase connection string;
- JWT secret;
- bot token;
- Render URL if it should stay private;
- Vercel URL if it should stay private;
- local `.env` or `.env.local`;
- logs or temporary database files.

Never paste secrets into chat, issue comments, docs, screenshots, or commit messages.
