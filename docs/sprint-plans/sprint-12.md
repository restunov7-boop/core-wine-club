# Sprint 12 - Progress Activity Lite

## Goal

Expose the existing progress ledger as a calm personal activity history.

The user can open `/progress`, see recent personal events, and understand which actions contributed to bottle progress.

## Backend Scope

- Add `GET /api/v1/progress/activity`.
- Read only from existing `progress_events`.
- Support `limit`, default `20`, capped at `50`.
- Return newest events first.
- Map `learning.lesson.completed` to lesson title and `/learn/lessons/{slug}`.
- Map `diary.note.created` to tasting note wine name and `/diary/{id}` when the note still exists.
- Keep deleted diary note events visible with metadata fallback and no deleted detail href.
- Add max 3 activity previews to `/home` and `/bottle/progress`.

No new migration is required. Sprint 12 does not create an activity table.

## Frontend Scope

- Add protected `/progress` route inside `AppShell`.
- Show title `Активность` and subtitle `Что уже наполнило твою бутылку.`
- Show event title, description, readable date/time, and optional link.
- Add empty state with CTA to `/learn`.
- Add activity preview on `/bottle`.
- Add activity preview card on `/home`.
- Keep bottom navigation unchanged.

## Privacy And Security

- Activity reads are scoped by current `project_id`.
- Activity reads are scoped by current `project_user_id`.
- Endpoint requires authenticated active project user with `view_app`.
- Frontend links are convenience only; backend authorization remains mandatory.

## Explicit Non-Goals

No achievements, badges, points, streaks, quests, weekly bottle, rewards, levels, social feed, comments, likes, sharing, rankings, notifications, AI recommendations, quizzes, admin CRUD, CMS/editor, uploads, production Telegram integration, deployment, or mobile preview fixes.

## Validation

- Backend compile check.
- Backend pytest suite.
- Alembic upgrade on a fresh validation database.
- Seed dev content.
- Smoke script checks `/progress/activity`.
- Frontend `pnpm build`.
- Browser check for Home, Bottle, Progress, learning completion, diary create/delete, and existing MVP routes.
