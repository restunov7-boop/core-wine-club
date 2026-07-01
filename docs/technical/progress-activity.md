# Progress Activity

Sprint 12 adds a read-only activity projection over `progress_events`.

## Source Of Truth

There is no separate activity table.

Activity is rendered from the existing ledger:

```text
learning.lesson.completed
diary.note.created
```

## Endpoint

`GET /api/v1/progress/activity`

Requires auth, active current `ProjectUser`, and `view_app`.

Query params:

- `limit`: optional integer, default `20`, capped at `50`.

Response data:

- `items`: newest activity events first.

Response meta:

- `limit`: normalized limit used by the query.

## Mapping

### Lesson Completion

- title: `Урок завершён`
- description: joined published lesson title when available; fallback to `metadata_json.title`, `metadata_json.lesson_title`, then `source_slug`
- href: `/learn/lessons/{source_slug}` when `source_slug` exists

### Diary Note Creation

- title: `Заметка добавлена`
- description: current `TastingNote.wine_name` when the note still exists; fallback to `metadata_json.wine_name`, then `Заметка в дневнике`
- href: `/diary/{source_id}` only when the note still exists

Deleted diary notes remain visible as historical activity, but they do not link to deleted detail pages.

## Previews

`/home` includes an `activity` section with up to 3 items and `href = /progress`.

`/bottle/progress` includes `activity_preview` with up to 3 items.

## Privacy

All reads filter by:

- `project_id`;
- `project_user_id`;
- known Sprint 12 event types and source types.

No admin-only data is included.

## Non-Goals

Activity is not a social feed. Sprint 12 does not add points, achievements, badges, streaks, comments, likes, sharing, rankings, notifications, quizzes, or a new activity table.
