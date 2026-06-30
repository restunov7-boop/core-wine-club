# Onboarding And Home Foundation

## Backend

Onboarding is project-scoped through the current authenticated `ProjectUser`.

Stored fields:

- `ProjectUser.onboarding_completed_at`
- `ProjectUser.onboarding_data_json`

Accepted onboarding data:

- `wine_experience_level`: `beginner`, `curious`, `confident`
- `taste_preferences`: `red`, `white`, `sparkling`, `rose`, `sweet`, `dry`, `not_sure`
- `goals`: `understand_wine`, `choose_bottle`, `build_taste`, `feel_confident`, `explore_culture`
- `display_name`: optional; when present, updates `User.display_name`

Endpoints:

- `GET /api/v1/onboarding/status`
- `POST /api/v1/onboarding/complete`
- `POST /api/v1/onboarding/reset-dev`
- `GET /api/v1/home`

`reset-dev` is available only when `DEV_AUTH_ENABLED=true`.

## Frontend

- `/home` is protected by Sprint 1 `AuthGuard`.
- `/home` fetches `GET /home`.
- If onboarding is incomplete, `/home` redirects to `/onboarding`.
- `/onboarding` uses local component state and saves through `POST /onboarding/complete`.
- After completion, `/onboarding` redirects to `/home`.

The home page uses static backend sections only. It does not create content, diary, club, learning, quiz, progress, or premium behavior.

## Local Dev Reset

```powershell
$headers = @{ Authorization = "Bearer $($session.data.access_token)" }

Invoke-RestMethod `
  -Method Post `
  -Uri http://127.0.0.1:8000/api/v1/onboarding/reset-dev `
  -Headers $headers
```
