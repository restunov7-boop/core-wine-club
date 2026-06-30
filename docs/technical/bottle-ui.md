# Bottle UI

Sprint 10 adds a Wine Club bottle visualization powered by the existing progress ledger.

## Source Of Truth

The source of truth remains `progress_events`.

Current event source:

```text
event_type: learning.lesson.completed
source_type: lesson
```

Bottle progress does not create, update, or delete progress events. It reads the current user's progress summary.

## Endpoint

`GET /api/v1/bottle/progress`

Requires auth, active `ProjectUser`, and `view_app`.

Response includes:

- title and subtitle;
- `fill_percent`;
- `completed_units`;
- `total_units`;
- `source = learning_lessons`;
- lesson breakdown;
- next action to `/learn`.

## Calculation

`total_units` counts published lessons in the current project.

`completed_units` counts current user's completed published lessons.

`fill_percent` is `0` when no lessons are available, otherwise an integer percentage capped at `100`.

Unpublished lessons are ignored.

## Home Preview

`/home` includes a `bottle` section:

- title `Моя бутылка`;
- href `/bottle`;
- stats: `fill_percent`, `completed_units`, `total_units`.

## Frontend

`/bottle` renders a CSS-only bottle visual and simple counts. It is intentionally a visual layer only.

## Non-Goals

No new bottle table, points, achievements, badges, streaks, weekly bottle, history, skins, quizzes, or new progress source of truth are added in Sprint 10.
