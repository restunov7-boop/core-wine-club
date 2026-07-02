# Bottle UI

Sprint 10 adds a Wine Club bottle visualization powered by the existing progress ledger.
Sprint 11 extends the same visualization with a diary contribution from existing private tasting notes.
Sprint 12 adds a small activity preview so the user can see recent actions that contributed to progress.
Sprint 17 includes published quiz completion as another unit source.

## Source Of Truth

The source of truth remains `progress_events`.

Current event sources:

```text
event_type: learning.lesson.completed
source_type: lesson

event_type: diary.note.created
source_type: diary_note

event_type: quiz.completed
source_type: quiz
```

Bottle progress does not create, update, or delete progress events. It reads the current user's learning summary, current private diary note count, and quiz completion summary.

## Endpoint

`GET /api/v1/bottle/progress`

Requires auth, active `ProjectUser`, and `view_app`.

Response includes:

- title and subtitle;
- `fill_percent`;
- `completed_units`;
- `total_units`;
- `source = learning_diary_and_quizzes`;
- nested learning, diary, and quizzes breakdown;
- next action;
- `activity_preview` with up to 3 recent progress activity items.

## Calculation

`total_units` = published lessons in the current project + diary target notes count + published quizzes in the current project.

Diary target notes count is `3`.

`completed_units` = current user's completed published lessons + `min(current_private_notes_count, 3)` + current user's completed published quizzes.

`fill_percent` is `0` when `total_units` is `0`, otherwise an integer percentage capped at `100`.

Unpublished lessons and unpublished quizzes are ignored.

Deleting a diary note reduces the current diary contribution because the bottle reads existing `tasting_notes`. The historical `diary.note.created` ledger event remains append-style and is not deleted for bottle recalculation.

## Breakdown

```json
{
  "learning": {
    "completed_lessons_count": 1,
    "available_lessons_count": 5
  },
  "diary": {
    "notes_count": 1,
    "target_notes_count": 3,
    "contributed_units": 1
  },
  "quizzes": {
    "completed_quizzes_count": 1,
    "available_quizzes_count": 1
  }
}
```

## Next Action

- If published lessons are not complete: `Продолжить уроки` -> `/learn`.
- If all lessons are complete and fewer than 3 diary notes exist: `Добавить заметку` -> `/diary/new`.
- If lessons are complete and at least 3 diary notes exist: `Посмотреть профиль вкуса` -> `/taste-profile`.

## Home Preview

`/home` includes a `bottle` section:

- title `Моя бутылка`;
- href `/bottle`;
- stats: `fill_percent`, `completed_units`, `total_units`.

Sprint 12 also adds a separate `activity` section on `/home` with recent progress events and `href = /progress`.

## Frontend

`/bottle` renders a CSS-only bottle visual, learning counts, diary counts, the backend-provided CTA, and a small recent activity preview. It is intentionally a visual layer only.

Sprint 23 fixes the visual fill mapping:

- `0%` is empty;
- `25%` fills the lower bottle body;
- `50%` fills about half the bottle body;
- around `77%`, the body is full and the neck begins filling;
- `100%` fills body and neck.

The frontend clamps visual percent to `0..100` and separates body fill from neck fill so the neck does not fill while the body is still partially empty.

## Non-Goals

No new bottle table, wine room, bottle shelf, points, achievements, badges, streaks, weekly bottle, history table, skins, or new progress source of truth are added. Quiz completion is read from the generic progress ledger.
