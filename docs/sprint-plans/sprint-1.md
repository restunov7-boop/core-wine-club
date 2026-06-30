# Sprint 1

## Goal

Add CORE identity and access foundation without moving into Sprint 2 business features.

## Implemented Scope

- `User` model as a global CORE user.
- `TelegramIdentity` model as a separate Telegram binding.
- `Project` model.
- `ProjectUser` model as the User to Project membership and access state.
- Role and permission foundation.
- Telegram WebApp initData validation service with development mock mode.
- Minimal JWT access token flow.
- `doch-vinodela` project seed.
- Backend auth dependencies and permission dependencies.
- Minimal frontend auth API methods and Zustand store.
- AuthGuard/AdminGuard based on auth state and backend-backed session.

## Explicitly Out Of Scope

- Onboarding business logic.
- `content_items`.
- Learning routes.
- Quizzes.
- Diary.
- Club/feed/comments.
- Progress/bottle.
- Achievements.
- Premium features beyond `ProjectUser` access-state fields.
- Notifications.
- Admin CRUD.

## Done Criteria

- Alembic migration creates `users`, `telegram_identities`, `projects`, and `project_users`.
- Seed command creates or reuses project `doch-vinodela`.
- `POST /api/v1/auth/telegram` returns a bearer token in dev mode.
- `GET /api/v1/auth/me` returns current user and project user from the bearer token.
- Backend permissions are the source of truth.
- Frontend guards use auth store/API state instead of empty mocks.
