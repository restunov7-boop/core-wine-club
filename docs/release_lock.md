# Release Lock

CORE Wine Club is in release-candidate lock for the Telegram Mini App MVP.

This document contains no secrets. Do not add real tokens, passwords, database URLs, Telegram `initData`, Supabase credentials, screenshots with private data, or production logs.

## Release Candidate Status

The app is ready for final Telegram QA and controlled MVP release after the deployment checklist and manual user journey checks pass.

## Included In MVP / RC

- Telegram Mini App authentication.
- Home.
- Diary journal and diary note detail/form.
- Backend-persisted Wine Shelf.
- Taste Profile Intelligence.
- Taste Map with opened countries, country detail, region progress, and frontend-only achievements.
- Wine Dictionary.
- Profile hub.
- Protected Admin entry and honest admin placeholder.
- QA-safe `/telegram-debug` route.
- Offline tastings placeholder.
- Learn, Quizzes, and Discoveries content shells.
- Production error handling and mobile Telegram WebView polish.

## Intentionally Not Included Yet

- Payments.
- Premium monetization.
- Full admin CMS.
- Real content management.
- Real Telegram channel posts feed.
- Booking or payment flow for offline tastings.
- Advanced country polygon map fill.
- Push notifications.
- Public launch content pack beyond the current prepared shells/content.

## Production Requirements

Vercel frontend:

```env
VITE_API_BASE_URL=https://core-wine-club.onrender.com/api/v1
VITE_PROJECT_SLUG=doch-vinodela
VITE_DEV_TELEGRAM_MOCK=false
```

Vercel env changes require a frontend redeploy.

Render backend:

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

Render env changes may require a manual deploy. `CORS_ORIGINS` and `TELEGRAM_WEB_APP_URL` must use the frontend root only: no `/home`, no trailing slash.

Supabase:

- Use the Supabase pooler `DATABASE_URL` placeholder/value only.
- Do not use direct host format `db.<project-ref>.supabase.co` for this deployment path.
- Do not print, paste, or commit the real `DATABASE_URL`.
- Wine Shelf production migration has already been applied manually.

Telegram:

- Open the Mini App from the bot, not from a copied browser URL.
- Bot button should use Telegram Web App behavior.
- `/telegram-debug` must not show full `initData`.
- Bot token must never be committed.

Admin:

- Admin must be granted through `backend/scripts/grant_project_admin.py` or another backend-controlled operation.
- `role=admin` is the safe QA role.
- Do not grant admin through frontend changes.
- Do not change premium/access state to fake admin access.

## QA Checklist

- Telegram auth lands on Home.
- Create a diary note.
- Open diary note detail.
- Add note to Wine Shelf.
- Open Wine Shelf, filter by status, update status, and delete an item.
- Open Profile and confirm honest aggregates or empty states.
- Open Taste Map, select an opened country, and confirm country detail updates.
- Open Dictionary, search, and switch categories.
- For admin QA user, open Profile -> Admin Panel.
- For non-admin user, `/admin` shows access denied.
- Open `/telegram-debug` and confirm only safe debug fields are shown.
- Check mobile layout: no horizontal scroll, bottom nav overlap, or sticky action overlap.
- Open an unknown route and confirm the app falls back safely.

## Rollback Notes

- Frontend rollback: use Vercel previous deployment.
- Backend rollback: use Render previous deploy if needed.
- Database migrations should not be added in this sprint.
- If a secret was exposed, rotate it before redeploying.

## Release Lock Rule

After this lock, only fix release blockers: auth failure, route crash, data loss, unsafe debug exposure, broken deployment env, or severe mobile layout regression. Product expansion should move to a post-RC sprint.
