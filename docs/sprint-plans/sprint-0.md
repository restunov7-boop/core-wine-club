# Sprint 0

## Goal

Create a clean technical foundation for CORE / Wine Club, optimized for Windows + PowerShell development.

## Scope

- FastAPI backend scaffold.
- React + TypeScript + Vite frontend scaffold.
- PostgreSQL through Docker Compose.
- `.env.example`.
- Windows-first README files.
- Healthcheck endpoint.
- Basic user app shell.
- Basic admin route shell.
- Telegram SDK wrapper stub/mock.
- API client.
- Theme variables.
- Docs structure.
- Alembic setup.

## Done Criteria

- Project structure exists.
- Backend starts on Windows.
- Frontend starts on Windows.
- Docker Compose file exists.
- Healthcheck works at `/api/v1/health`.
- Frontend `/home` route works.
- `/admin` placeholder exists.
- Telegram wrapper dev mock exists.
- API client exists.
- Theme variables exist.
- `.env.example` exists.
- README has Windows PowerShell commands.
- Alembic is configured.
- No Sprint 1 business logic is implemented.

## Explicitly Out Of Scope

- Telegram auth validation.
- User, TelegramIdentity, Project, or ProjectUser models.
- Roles and permissions logic.
- Onboarding business logic.
- `content_items`.
- Learning, quizzes, diary, club, progress/bottle, premium, notifications, admin CRUD.
