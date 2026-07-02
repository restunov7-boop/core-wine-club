# Quiz Progress

Sprint 17 records quiz completion through the existing progress ledger.

## Event

```text
event_type = quiz.completed
source_type = quiz
source_id = quizzes.id
source_slug = quizzes.slug
```

`metadata_json` stays small:

- `quiz_title`;
- `correct_count`;
- `total_questions`.

## Rule

The completion rule is deterministic:

```text
correct_count == total_questions
```

Partial success is returned to the client as a local result and does not create a progress event.

## Idempotency

The service checks for an existing `quiz.completed` event for the same `project_id`, `project_user_id`, event type, source type, and quiz id before inserting. The existing unique constraint on `progress_events` also protects against duplicates.

Repeated perfect submissions return the existing `completed_at`.

## Privacy

Completion state is scoped to the current `ProjectUser`. Another user in the same project cannot see the first user's quiz completion state.

No full answer history is stored. No separate attempts table exists.

## Read Models

Quiz completion contributes to:

- `GET /api/v1/progress/summary` via the `quizzes` block;
- `GET /api/v1/bottle/progress` through quiz units;
- `GET /api/v1/progress/activity` as a personal activity item;
- `GET /api/v1/my-path` as counts and an optional `try_quiz` action;
- `GET /api/v1/home` as neutral quiz section stats.

## Non-Goals

This is not a gamification system. It does not add points, achievements, badges, streaks, leaderboards, rewards, or levels.
