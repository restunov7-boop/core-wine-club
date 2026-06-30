# Taste Profile

## Approach

The taste profile is computed dynamically. Sprint 5 does not persist a separate profile table.

Inputs:

- current `ProjectUser.onboarding_data_json`;
- current user's own private `TastingNote` rows for the current project.

The query always filters by:

- `project_id`;
- `project_user_id`;
- `visibility = private`.

## API

```text
GET /api/v1/taste-profile
```

Requires auth, current active `ProjectUser`, and `view_app`.

Response sections:

- `summary`;
- `onboarding`;
- `stats`;
- `insights`.

## Stats

Computed stats:

- `notes_count`;
- `average_rating`;
- `would_buy_again_ratio`;
- `favorite_wine_colors`;
- `sweetness_distribution`;
- `top_aroma_notes`;
- `top_taste_notes`;
- `countries_tried`;
- `regions_tried`.

## Insight Rules

Insights are deterministic and capped at four items:

- no notes: encourage the first diary note;
- onboarding exists: mention first preferences;
- notes exist: diary has started forming a taste map;
- average rating `>= 4`: saved wines are generally liked;
- one wine color dominates: show a soft style hint;
- would-buy-again ratio `>= 0.6`: note repeat-worthy wines;
- repeated aroma/taste tags: show early vocabulary.

No AI, embeddings, external services, recommendations, or background jobs are used.

## Privacy

The profile is private. It is not public, shareable, social, or admin-managed in Sprint 5.
