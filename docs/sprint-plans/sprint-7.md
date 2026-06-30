# Sprint 7 - App Shell, Navigation, and UX Foundation

## Goal

Sprint 7 makes the existing authenticated frontend feel coherent and mobile-first. It adds app shell structure, a simple bottom navigation, and shared UI states without adding a new product domain.

## Implemented Scope

- `AppShell` for authenticated, onboarding-completed user routes.
- `AppHeader` with the Wine Club product identity.
- Four-item `BottomNav`: Home, Discoveries, Diary, Taste Profile.
- Active bottom navigation state for list and detail routes.
- Shared `LoadingState`, `ErrorState`, and `EmptyState`.
- Light UX cleanup for existing home, discoveries, diary, diary form/detail, and taste profile pages.
- Documentation for app shell structure and validation.

## Wrapped Routes

- `/home`
- `/discoveries`
- `/discoveries/:slug`
- `/diary`
- `/diary/new`
- `/diary/:noteId`
- `/diary/:noteId/edit`
- `/taste-profile`

`/onboarding` remains focused and does not show bottom navigation before completion.

`/admin` remains separate behind `AdminGuard`.

## UX Notes

- Home acts as the app hub for Discoveries, Diary, and Taste Profile.
- Discoveries cards remain clickable and detail pages keep a clear back link.
- Diary empty state points to creating the first note.
- Diary form marks `wine_name` as required.
- Taste profile empty state still points to `/diary/new`.
- Bottom navigation does not include future placeholders such as club or path.

## Validation

```powershell
cd backend
.\.venv\Scripts\Activate.ps1
python -m compileall app
python -m pytest
```

```powershell
.\backend\scripts\smoke_sprint6.ps1
```

```powershell
cd frontend
pnpm install
pnpm build
pnpm dev -- --host 127.0.0.1 --port 5173
```

Expected browser routes:

- `/home`
- `/discoveries`
- `/discoveries/how-to-read-wine-label`
- `/diary`
- `/diary/new`
- `/taste-profile`
- `/admin`

## Non-Goals

Sprint 7 does not add quizzes, learning progress, club/feed/comments, likes, saves/bookmarks, sharing, weekly bottle, bottle progress, achievements, premium/payments, notifications, admin CRUD, CMS/editor, uploads, OCR/barcode, cellar/inventory, external wine databases, recommendations, AI, production Telegram integration, deployment, or mobile preview helper changes.
