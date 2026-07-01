# Sprint 14 - UX Polish / Product Readiness Pass

## Goal

Make the existing Wine Club app feel more coherent, calm, mobile-first, and production-like before adding larger future modules.

Sprint 14 is a UX consistency sprint only. It does not add a new business domain.

## Scope

- Polish AppShell, header, bottom navigation, global spacing, touch targets, and focus states.
- Make Home clearer as the hub for next actions, bottle progress, learning, diary, profile, activity, and discoveries.
- Improve loading, error, and empty states across current routes.
- Standardize CTA wording and back links.
- Improve Bottle, My Path, and Progress copy so they read as private personal tools, not gamification or social feed.
- Improve mobile behavior around 390px width.
- Update docs for UX readiness decisions and boundaries.

## Frontend Changes

- Shared `ErrorState` now includes a simple retry action.
- API network errors are shown in friendlier Russian copy.
- Admin access denied includes a route back to Home.
- Unknown routes redirect safely to `/home`.
- Home section order is intentionally centered on `Что дальше`, then Bottle, Learning, Diary, Taste Profile, Activity, and Discoveries.
- Bottle explains current progress sources: lessons and diary notes.
- My Path uses calmer copy and includes an empty edge state.
- Progress is described as private activity history, not a feed.
- Diary CTAs use `Добавить заметку`; edit back link returns to the note detail.
- Learning and Discoveries empty states include a clear action.

## Backend Scope

No backend change is required.

No new table, migration, endpoint, progress source, or business rule is added.

## Explicit Non-Goals

No quizzes, achievements, badges, points, streaks, quests, weekly bottle, social feed, comments, likes, sharing, rankings, notifications, AI recommendations, recommendation engine, admin CRUD, CMS/editor, uploads, OCR/barcode, external wine databases, premium/payments, production Telegram integration, deployment, or mobile preview changes.

## Validation

- `python -m compileall app`
- `python -m pytest`
- Smoke script
- `pnpm install`
- `pnpm build`
- Browser check for main routes and mobile 390px viewport
