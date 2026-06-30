# Discoveries

## Model

`Discovery` is project-scoped through `project_id`.

Table: `discoveries`

Core fields:

- `id`
- `project_id`
- `slug`
- `title`
- `subtitle`
- `summary`
- `body`
- `category`
- `difficulty`
- `estimated_minutes`
- `cover_image_url`
- `is_published`
- `published_at`
- `sort_order`
- `created_at`
- `updated_at`

Constraints:

- Unique `(project_id, slug)`.
- `difficulty` is one of `beginner`, `curious`, `confident`.
- Normal users only receive published discoveries.

## API

All endpoints require auth and `view_app`.

```text
GET /api/v1/discoveries
GET /api/v1/discoveries/{slug}
```

Optional list filters:

- `category`
- `difficulty`

`GET /api/v1/home` includes a `discoveries` section with up to three preview items.

## Seed

`python -m scripts.seed_dev` creates or updates seven demo discoveries for `doch-vinodela`.

The seed is idempotent:

- It matches by `(project_id, slug)`.
- It does not duplicate content.
- It does not delete user data.
- It does not reset onboarding.
- It does not create fake activity.
