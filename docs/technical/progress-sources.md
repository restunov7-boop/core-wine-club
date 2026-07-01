# Progress Sources

This note records the current Sprint 12 progress sources and how they are used by read models.

## Learning

Lesson completion is stored as a progress ledger event:

```text
event_type: learning.lesson.completed
source_type: lesson
source_id: lessons.id
source_slug: lessons.slug
```

Learning summaries count only published lessons in the current project and only events owned by the current `ProjectUser`.

## Diary

Diary note creation is stored as a progress ledger event:

```text
event_type: diary.note.created
source_type: diary_note
source_id: tasting_notes.id
source_slug: null
```

The event is written by the diary service in the same transaction as the tasting note creation. Creating the same note cannot create duplicate events because the progress ledger has a unique constraint on project, project user, event type, source type, and source id.

Deleting a diary note does not delete the historical `diary.note.created` event. Current diary contribution is computed from existing private `tasting_notes`; created-note event count is creation history.

## Summary Endpoint

`GET /api/v1/progress/summary` returns:

- `learning`: completed published lessons, available published lessons, and completed slugs;
- `diary`: current `notes_count` and historical `created_note_events_count`.

The endpoint does not return points, achievements, streaks, badges, scores, or bottle-specific entities.

## Activity Endpoint

`GET /api/v1/progress/activity` returns a read-only activity projection over the same events:

- `learning.lesson.completed` becomes `Урок завершён`;
- `diary.note.created` becomes `Заметка добавлена`;
- deleted diary notes remain in history with metadata fallback and no deleted detail href.

The endpoint filters by current project and current `ProjectUser`.

## Bottle Read Model

`GET /api/v1/bottle/progress` currently uses:

- published lessons as learning units;
- up to 3 existing private diary notes as diary units.

Formula:

```text
total_units = published_lessons_count + 3
completed_units = completed_published_lessons_count + min(current_private_notes_count, 3)
fill_percent = int(completed_units / total_units * 100), capped at 100
source = learning_and_diary
```

Bottle also exposes up to 3 recent activity items as `activity_preview`.
