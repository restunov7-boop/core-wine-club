# Progress Ledger

Sprint 9 introduces `ProgressEvent`, a generic ledger for meaningful user actions inside a project.

## Table

`progress_events`

- `id`
- `project_id`
- `project_user_id`
- `event_type`
- `source_type`
- `source_id`
- `source_slug`
- `metadata_json`
- `occurred_at`
- timestamps

Every row is project-scoped and user-owned.

## Current Event

Sprint 9 writes only one event:

```text
event_type: learning.lesson.completed
source_type: lesson
source_id: lessons.id
source_slug: lessons.slug
```

`metadata_json` is intentionally small and currently stores the lesson title for debugging/context.

## Idempotency

The service first checks for an existing completion event before inserting a new one. The table also has a unique constraint on:

```text
project_id, project_user_id, event_type, source_type, source_id
```

This keeps lesson completion idempotent for the same user/project/lesson. Events with a null `source_id` remain a future design topic; Sprint 9 lesson events always use a non-null `source_id`.

## Reads

Learning endpoints compute completion state by querying `ProgressEvent` for the current `ProjectUser` only.

`GET /progress/summary` returns simple learning counts:

- completed lessons count;
- available lessons count;
- completed lesson slugs.

It does not return points, bottle percentage, achievements, streaks, or scores.

## Ownership And Security

Progress endpoints use `require_capability("view_app")`. Frontend state is not trusted for authorization. Deleting a completion event filters by `project_id`, `project_user_id`, event type, source type, and lesson source id, so it cannot delete another user's progress event.

## Future Sprint 10

Sprint 10 can read from this ledger to power a Bottle UI. The ledger itself remains generic and does not encode bottle-specific concepts.
