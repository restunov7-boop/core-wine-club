# Sprint 16 - Quizzes Foundation

## Goal

Add a simple quiz foundation as a learning-support layer.

Users can open quizzes, answer single-choice questions, check answers, see explanations, and retry locally.

## Scope

- Add project-scoped quiz content tables: `quizzes` and `quiz_questions`.
- Add published quiz list/detail/check endpoints.
- Seed one beginner quiz with 5 questions.
- Add frontend `/quizzes` and `/quizzes/:quizSlug`.
- Update frontend route manifest and route smoke.
- Add a neutral Home section linking to `/quizzes`.

## Backend

Endpoints:

- `GET /api/v1/quizzes`
- `GET /api/v1/quizzes/{slug}`
- `POST /api/v1/quizzes/{slug}/check`

All require auth, active current `ProjectUser`, and `view_app`.

Quiz detail does not expose `correct_option_key`. The check endpoint returns correctness, correct answer keys, and explanations after submit.

## Seed

Seeded quiz:

- slug: `wine-basics-check`
- title: `Проверка винной базы`
- difficulty: `beginner`
- estimated minutes: `4`
- questions: `5`

Seed is idempotent and does not create quiz attempts or progress events.

## Explicit Non-Goals

No quiz attempt persistence, quiz completion events, `progress_events` for quizzes, bottle fill from quizzes, achievements, badges, points, streaks, quests, weekly bottle, rewards, leaderboards, social features, notifications, AI recommendations, premium/payments, admin CRUD, CMS/editor, uploads, production Telegram integration, deployment, or mobile preview changes.

## Future Direction

Sprint 17 can connect quiz completion to the existing progress ledger if explicitly requested.
