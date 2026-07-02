# Sprint 18 - Learning + Quiz Integration Polish

## Scope

Sprint 18 connects the existing learning foundation with the existing quiz foundation using a small static mapping:

```text
wine-basics -> wine-basics-check
```

No database migration is required. The sprint adds no new product modules and no new route.

## Implemented

- Learning path list exposes recommended quiz counts.
- Learning path detail exposes recommended quizzes without questions or answer keys.
- Lesson detail exposes a lightweight `next_step` only after all lessons in the mapped path are completed.
- My Path suggests the quiz only after all mapped path lessons are complete.
- Home includes a `learning_journey` section that points to the next deterministic step.
- Frontend learning pages render the recommended quiz and next-step CTA.
- Quiz pages explain that quizzes reinforce lessons and are not exams.

## Explicit Non-Goals

- No quiz attempts table.
- No full answer history.
- No points, achievements, badges, streaks, or leaderboard.
- No AI or recommendation engine.
- No premium, payments, notifications, social features, admin CRUD, CMS/editor, uploads, deployment, or Telegram production flow.
- No complex prerequisite, locking, or unlock system.

## Validation

Expected checks:

```powershell
cd backend
.\.venv\Scripts\python.exe -m compileall app
.\.venv\Scripts\python.exe -m pytest

cd ..\frontend
pnpm build
pnpm smoke:routes
```
