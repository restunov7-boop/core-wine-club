# Learning Foundation

Sprint 8 adds read-only lessons and learning paths for authenticated project members.

## Data Model

`learning_paths`

- `project_id`
- `slug`
- `title`
- `subtitle`
- `summary`
- `description`
- `difficulty`
- `estimated_minutes`
- `cover_image_url`
- `is_published`
- `sort_order`
- timestamps

`lessons`

- `project_id`
- `slug`
- `title`
- `subtitle`
- `summary`
- `body`
- `lesson_type`
- `difficulty`
- `estimated_minutes`
- `cover_image_url`
- `is_published`
- `published_at`
- timestamps

`learning_path_lessons`

- `project_id`
- `learning_path_id`
- `lesson_id`
- `sort_order`
- `created_at`

Slugs are unique per project. Lesson order is defined by `learning_path_lessons.sort_order`.

## Permissions

All learning endpoints use the existing auth guard and require `view_app`. The service filters by the current `ProjectUser.project_id`, so content from another project is not visible.

## Published Filtering

Normal read endpoints return only records with `is_published = true`. Unpublished paths and lessons return `404` from detail endpoints.

## API Shape

`GET /learning/paths` returns list items with `lessons_count`.

`GET /learning/paths/{slug}` returns path metadata and ordered lesson summaries.

`GET /learning/lessons/{slug}` returns the full lesson body.

No response contains `is_completed`, `progress`, completion state, score, quiz state, or bottle progress.

## Home Preview

`/home` includes a `learning` section with the first published path preview:

- `slug`
- `title`
- `estimated_minutes`
- `lessons_count`

## Frontend Routes

- `/learn`
- `/learn/:pathSlug`
- `/learn/lessons/:lessonSlug`

The frontend uses `shared/api/client` and existing auth/onboarding flow. Components do not access Telegram globals directly.

## Explicit Non-Scope

Sprint 8 does not include:

- user lesson completion;
- progress ledger;
- bottle UI;
- achievements;
- quizzes;
- recommendations or AI;
- premium gating;
- admin CRUD or CMS editing.
