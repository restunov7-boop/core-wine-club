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
VITE_API_BASE_URL=https://your-render-backend.onrender.com/api/v1
VITE_PROJECT_SLUG=doch-vinodela
VITE_DEV_TELEGRAM_MOCK=false
```

Redeploy after changing env variables.

## Backend CORS

After Vercel gives the final frontend URL, add it to backend CORS in Render:

```env
CORS_ORIGINS=https://your-vercel-frontend.vercel.app
```

Do not commit `.env.local` or real deployment URLs.
