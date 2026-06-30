# Sprint 9 - Completion Events / Progress Ledger Foundation

## Goal

Add a generic project-scoped, user-owned progress ledger and connect it narrowly to lesson completion.

Sprint 9 lets a user complete and uncomplete lessons, see lesson completion state in learning screens, and see simple learning counts on `/home` and `/progress/summary`.

## Backend Scope

- Add `progress_events`.
- Store generic event rows with `event_type`, `source_type`, `source_id`, `source_slug`, and small metadata.
- Scope every event by `project_id`.
- Own every event by `project_user_id`.
- Use the existing `view_app` permission for all progress endpoints.
- Keep lesson completion idempotent.

## Event Strategy

Sprint 9 only creates:

- `event_type = learning.lesson.completed`
- `source_type = lesson`

The table is intentionally generic so future sprints can add diary/profile/quiz/bottle events without changing the storage pattern.

## API

- `POST /api/v1/progress/lessons/{lesson_slug}/complete`
- `DELETE /api/v1/progress/lessons/{lesson_slug}/complete`
- `GET /api/v1/progress/summary`

Learning endpoints now include current user's completion state:

- path list: `lessons_count`, `completed_lessons_count`;
- path detail: path counts plus `is_completed` and `completed_at` per lesson;
- lesson detail: `is_completed` and `completed_at`.

`/home` now returns learning stats:

- `completed_lessons_count`;
- `available_lessons_count`.

## Idempotency

Lesson completion is guarded by a lookup before insert and a unique constraint:

`(project_id, project_user_id, event_type, source_type, source_id)`

For Sprint 9 lesson completion, `source_id` is always the lesson UUID, so duplicate completion events for the same current user/project/lesson are prevented.

## Privacy

Completion state is computed only from the current `ProjectUser`. Another user in the same project does not see these events or counts.

## Frontend Scope

- `/learn` shows per-path completed counts.
- `/learn/:pathSlug` shows `Завершено: X из Y` and completed lesson status.
- `/learn/lessons/:lessonSlug` can mark a lesson completed or remove the mark.
- `/home` shows learning counts and links to `/learn`.

## Explicit Non-Goals

Sprint 9 does not add bottle UI, bottle fill, weekly bottle, achievements, badges, streaks, points, quests, quizzes, recommendations, AI, premium/payments, notifications, social features, admin CRUD, CMS/editor, uploads, OCR/barcode, production Telegram integration, deployment, or mobile preview fixes.

## Done Criteria

- Progress ledger exists.
- Lesson completion works and is idempotent.
- Uncomplete works for the current user only.
- Learning and home endpoints expose current-user progress counts.
- Frontend can complete/uncomplete a lesson.
- Backend tests, smoke script, and frontend build pass.
