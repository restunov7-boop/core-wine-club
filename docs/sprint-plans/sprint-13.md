# Sprint 13 - My Path / Next Actions Foundation

## Goal

Add a lightweight personal guidance layer that helps the current user understand what to do next.

This is deterministic guidance based on existing user state. It is not AI, scoring, gamification, achievements, or a recommendation engine.

## Backend Scope

- Add `GET /api/v1/my-path`.
- Reuse existing progress, diary, bottle, and activity read models.
- Return summary counts, max 4 next actions, and section links.
- Add Home preview section `my_path` with max 2 actions.

No migration and no new table are required.

## Deterministic Rules

Actions are built in priority order:

1. `start_learning` when no lessons are complete.
2. `continue_learning` when some lessons are complete but not all.
3. `add_first_diary_note` when there are no diary notes.
4. `add_diary_note` when there are 1-2 diary notes.
5. `view_bottle` when bottle fill is greater than 0.
6. `view_taste_profile` when there are at least 3 diary notes.
7. `view_activity` when progress activity exists.

The response returns at most 4 actions sorted by priority.

## Frontend Scope

- Add protected `/my-path` route inside `AppShell`.
- Show summary cards for lessons, diary, bottle, and activity.
- Show `Что дальше` next actions.
- Show `Разделы` links to existing product areas.
- Keep bottom navigation unchanged.

## Privacy And Security

- Endpoint requires auth, active current `ProjectUser`, and `view_app`.
- All source data is scoped to current project and current `ProjectUser`.
- Frontend visibility is not security; backend permissions remain mandatory.

## Explicit Non-Goals

No AI recommendations, ML personalization, scoring system, achievements, badges, points, streaks, quests, weekly bottle, rewards, levels, social feed, comments, likes, sharing, rankings, notifications, quizzes, admin CRUD, CMS/editor, uploads, production Telegram integration, deployment, or mobile preview fixes.

## Validation

- Backend compile check.
- Backend pytest suite.
- Alembic upgrade on a fresh validation database.
- Seed dev content.
- Smoke script checks `/my-path` transitions.
- Frontend `pnpm build`.
- Browser check for Home, My Path, Bottle, Progress, Learning, Diary, Discoveries, Taste Profile, and Admin access denied.
