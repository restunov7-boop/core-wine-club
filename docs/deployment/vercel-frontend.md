# Vercel Frontend Deployment

Sprint 25 prepares frontend deployment documentation only. It does not deploy the app.

## Project

- Provider: Vercel
- Source: GitHub repository
- Root Directory: `frontend`
- Install Command:

```bash
pnpm install
```

- Build Command:

```bash
pnpm build
```

- Output Directory:

```text
dist
```

## Environment Variables

Set in Vercel project settings:

```env
VITE_API_BASE_URL=https://core-wine-club.onrender.com/api/v1
VITE_PROJECT_SLUG=doch-vinodela
VITE_DEV_TELEGRAM_MOCK=false
```

Redeploy after changing env variables. `VITE_*` values are build-time values and will not change in production until Vercel builds again.

## Backend CORS

Backend CORS in Render should contain the frontend root only:

```env
CORS_ORIGINS=https://core-wine-club-frontend-theta.vercel.app
```

Do not add `/home` or a trailing slash to the CORS origin. Do not commit `.env.local`, tokens, database URLs, or local deployment artifacts.
