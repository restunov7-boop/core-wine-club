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

## Current Events

Sprint 9 writes lesson completion events:

```text
event_type: learning.lesson.completed
source_type: lesson
source_id: lessons.id
source_slug: lessons.slug
```

`metadata_json` is intentionally small and currently stores the lesson title for debugging/context.

Sprint 11 adds diary note creation events:

```text
event_type: diary.note.created
source_type: diary_note
source_id: tasting_notes.id
source_slug: null
```

`metadata_json` stores small context such as wine name and rating when present.

Sprint 17 adds quiz completion events:

```text
event_type: quiz.completed
source_type: quiz
source_id: quizzes.id
source_slug: quizzes.slug
```

`metadata_json` stores small context: quiz title, correct count, and total questions.

## Idempotency

The service first checks for an existing completion event before inserting a new one. The table also has a unique constraint on:

```text
project_id, project_user_id, event_type, source_type, source_id
```

This keeps lesson completion idempotent for the same user/project/lesson, diary note creation idempotent for the same user/project/note, and quiz completion idempotent for the same user/project/quiz. Events with a null `source_id` remain a future design topic; current lesson, diary, and quiz events always use a non-null `source_id`.

## Reads

Learning endpoints compute completion state by querying `ProgressEvent` for the current `ProjectUser` only.

`GET /progress/summary` returns simple learning counts:

- completed lessons count;
- available lessons count;
- completed lesson slugs.

It also returns a diary block:

- `notes_count`: current private tasting notes for the current user/project;
- `created_note_events_count`: historical `diary.note.created` events for the current user/project.

It also returns a quizzes block:

- `completed_quizzes_count`;
- `available_quizzes_count`;
- `completed_quiz_slugs`.

It does not return points, bottle percentage, achievements, streaks, or scores.

Deleting a diary note does not delete or mutate the historical `diary.note.created` event. Current bottle diary contribution is based on existing `tasting_notes`, while the ledger remains append-style for creation history.

`GET /progress/activity` returns a read-only personal activity projection over the ledger:

- newest events first;
- current project and current `ProjectUser` only;
- lesson events mapped to lesson titles and lesson detail hrefs;
- diary note events mapped to wine names and diary hrefs only when the note still exists.
- quiz completion events mapped to quiz titles and quiz detail hrefs.

Deleted diary note events can remain visible as history, but they do not link to deleted detail pages.

## Ownership And Security

Progress endpoints use `require_capability("view_app")`. Frontend state is not trusted for authorization. Deleting a completion event filters by `project_id`, `project_user_id`, event type, source type, and lesson source id, so it cannot delete another user's progress event.

## Bottle Read Model

The Bottle UI reads progress summaries, current diary notes, current quiz completion, and a small activity preview as read models. The ledger itself remains generic and does not encode bottle-specific concepts.
