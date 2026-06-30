# Sprint 11 - Bottle Diary Contribution

## Goal

Extend the existing Bottle UI foundation so it reflects both learning progress and a small diary contribution without adding gamification or new business areas.

## Backend Scope

- Create a `diary.note.created` progress event when a private tasting note is successfully created.
- Keep the event append-style: deleting a diary note does not delete or mutate the historical creation event.
- Extend `GET /api/v1/progress/summary` with a diary block:
  - `notes_count`: current private tasting notes for the current user/project;
  - `created_note_events_count`: historical diary note creation events.
- Update `GET /api/v1/bottle/progress` to use `source = learning_and_diary`.
- Set diary target to 3 notes.
- Calculate:
  - `total_units = published_lessons_count + 3`;
  - `completed_units = completed_published_lessons_count + min(notes_count, 3)`;
  - `fill_percent` as an integer capped at `100`.
- Return nested `breakdown.learning` and `breakdown.diary`.
- Return a next action:
  - continue lessons first;
  - then add a diary note;
  - then view taste profile.

No database migration is required because Sprint 11 uses the existing `progress_events` table and existing `tasting_notes`.

## Frontend Scope

- Update bottle API types for nested learning and diary breakdown.
- Show learning and diary counts on `/bottle`.
- Use the backend-provided next action.
- Keep the bottle reachable from Home.

## Explicit Non-Goals

Sprint 11 does not add quizzes, diary redesign, club/feed/comments, admin CRUD, achievements, points, streaks, badges, weekly bottle, bottle skins, recommendations, AI, notifications, premium features, payments, uploads, CMS/editor, deployment, or new onboarding logic.

## Validation

- Backend compile check.
- Backend pytest suite.
- Alembic upgrade on a fresh validation database.
- Seed dev content.
- Smoke script checks learning, diary, progress summary, bottle fill, create/delete note behavior, and existing MVP routes.
- Frontend `pnpm build`.
- Browser check for Home, Bottle, learning completion, diary create/delete, discoveries, taste profile, and admin access denied.
