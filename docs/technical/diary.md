# Taste Diary

## Model

`TastingNote` is private user-owned project data.

Table: `tasting_notes`

Ownership fields:

- `project_id`
- `project_user_id`

Content fields:

- `wine_name`
- `producer`
- `country`
- `region`
- `grape`
- `vintage`
- `wine_color`
- `sweetness`
- `rating`
- `occasion`
- `price_text`
- `tasted_at`
- `aroma_notes_json`
- `taste_notes_json`
- `pairing`
- `personal_note`
- `would_buy_again`
- `visibility`
- `created_at`
- `updated_at`

Constraints:

- `project_id` is required.
- `project_user_id` is required.
- `rating` must be `1` through `5` when present.
- `visibility` must be `private`.
- Normal users only access notes where both `project_id` and `project_user_id` match the current `ProjectUser`.

## API

All endpoints require auth, current `ProjectUser`, and `view_app`.

```text
GET    /api/v1/diary/notes
POST   /api/v1/diary/notes
GET    /api/v1/diary/notes/{note_id}
PATCH  /api/v1/diary/notes/{note_id}
DELETE /api/v1/diary/notes/{note_id}
```

List params:

- `limit`, default `20`, max `50`
- `offset`, default `0`

`GET /api/v1/home` includes a `diary` section with:

```json
{
  "stats": {
    "notes_count": 0
  }
}
```

## Privacy

The diary is not social content. There is no public visibility, sharing, feed, likes, comments, saves, or admin workflow in Sprint 4.
