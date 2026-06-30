# Sprint 10 - Bottle UI Foundation

## Goal

Add the first Wine Club-specific bottle visualization on top of the generic CORE progress ledger.

The bottle is a read-only visual representation of the current user's lesson completion progress. It is not a new source of truth.

## Backend Scope

- Add `GET /api/v1/bottle/progress`.
- Read from the existing `ProgressEvent` ledger through the learning progress summary.
- Count only published lessons in the current project.
- Count only current user's `learning.lesson.completed` events.
- Add a bottle preview section to `/home`.

No new database table is created in Sprint 10.

## Calculation

- `total_units` = published lessons in the current project.
- `completed_units` = current user's completed published lessons.
- `fill_percent` = `0` when total is `0`; otherwise integer percentage capped at `100`.
- `source` = `learning_lessons`.

## Frontend Scope

- Add `/bottle` inside `AppShell`.
- Add a CSS bottle visual.
- Show percent, `Заполнено X из Y`, learning counts, and CTA to `/learn`.
- Add a `/home` bottle preview card linking to `/bottle`.

The bottom navigation stays unchanged with five items. Bottle is reachable from Home for Sprint 10.

## Explicit Non-Goals

Sprint 10 does not add achievements, badges, points, streaks, quests, weekly bottle, bottle history, bottle skins, premium bottles, quizzes, recommendations, social sharing, notifications, admin CRUD, CMS/editor, uploads, production Telegram integration, deployment, or mobile preview fixes.

## Validation

- Backend compile check.
- Backend pytest suite.
- Alembic upgrade on a fresh validation database.
- Seed dev content.
- Smoke script checks bottle before/after lesson complete/uncomplete.
- Frontend `pnpm build`.
- Browser check for `/home`, `/bottle`, `/learn`, complete/uncomplete, and existing app routes.
