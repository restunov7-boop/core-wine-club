# Learning Quiz Integration

Sprint 18 keeps the integration intentionally static and small.

## Static Mapping

The backend maps learning paths to recommended quizzes in `app.learning.service`:

```text
wine-basics -> wine-basics-check
```

The mapping is project-scoped at query time. Only published quizzes from the current project are returned.

## API Additions

`GET /api/v1/learning/paths` adds:

- `recommended_quizzes_count`
- `completed_recommended_quizzes_count`

`GET /api/v1/learning/paths/{slug}` adds:

- `recommended_quizzes`

Recommended quiz items include quiz metadata, completion state, question count, and frontend href. They do not include questions, correct answers, explanations, or attempt data.

`GET /api/v1/learning/lessons/{slug}` adds:

- `next_step`

`next_step` is `null` until all published lessons in the mapped path are completed by the current user. If the mapped quiz is incomplete, it points to the quiz. If the quiz is complete, it points to `/my-path`.

## Progress Rules

Quiz completion still uses the existing `ProgressEvent` ledger from Sprint 17. There is no quiz attempt persistence and no answer history.

My Path shows `try_quiz` only when:

- at least one lesson exists,
- all available lessons are completed,
- at least one quiz remains incomplete.

## Frontend

The frontend consumes the new fields only as navigation and context:

- `/learn` shows recommended quiz counts.
- `/learn/:pathSlug` shows the recommended quiz card.
- `/learn/lessons/:lessonSlug` shows the next-step CTA after the backend returns it.
- `/quizzes` and `/quizzes/:quizSlug` add explanatory copy and a static related-path link for `wine-basics-check`.

No frontend gating, locking, gamification, or new product route is added.
