# Sprint 8 - Lessons / Learning Paths Foundation

## Goal

Add the first read-only learning foundation for CORE Wine Club: project-scoped learning paths, ordered lessons, seeded beginner content, API endpoints, frontend learning routes, and home preview.

This sprint intentionally does not add learning progress, completion events, quizzes, achievements, recommendations, bottle/progress UI, premium rules, admin CRUD, or content editing.

## Backend Scope

- Add `learning_paths`, `lessons`, and `learning_path_lessons`.
- Keep all content scoped by `project_id`.
- Keep public app access protected by `view_app`.
- Return only published paths and lessons from read endpoints.
- Seed one beginner path for `doch-vinodela`.
- Add a learning preview section to `/home`.

## API

- `GET /api/v1/learning/paths`
- `GET /api/v1/learning/paths/{slug}`
- `GET /api/v1/learning/lessons/{slug}`

All endpoints require an authenticated active project member with `view_app`.

## Seeded Content

Seed creates the `wine-basics` path:

- `how-wine-is-made`
- `red-white-rose-basics`
- `dry-sweet-balance`
- `how-to-taste-wine`
- `wine-with-food-basics`

The seed is idempotent and updates demo records without creating duplicates.

## Frontend Scope

- `/learn` lists available learning paths.
- `/learn/:pathSlug` shows a path and ordered lesson list.
- `/learn/lessons/:lessonSlug` shows one lesson body.
- Bottom navigation adds `Уроки`.
- `/home` shows a learning preview card.

## Validation

- Backend compile check.
- Backend pytest suite.
- Alembic upgrade on a fresh validation database.
- Local smoke script includes learning path and lesson endpoints.
- Frontend `pnpm build`.
- Browser check for `/home`, `/learn`, path detail, lesson detail, and existing app routes.

## Next Sprint Boundary

Sprint 9 can add a proper learning progress ledger and completion events. Sprint 10 can connect progress to bottle UI. Sprint 8 stores no user learning progress.
