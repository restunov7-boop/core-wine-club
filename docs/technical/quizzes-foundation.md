# Quizzes Foundation

Sprint 16 adds project-scoped quiz content and a local answer-check flow.
Sprint 17 adds completion state through the existing `ProgressEvent` ledger.
Sprint 18 links the existing `wine-basics` learning path to `wine-basics-check` as a static recommended quiz.

## Tables

`quizzes`:

- `project_id` scopes every quiz to a project.
- `(project_id, slug)` is unique.
- `is_published` controls normal visibility.
- difficulty is constrained to `beginner`, `curious`, or `confident`.

`quiz_questions`:

- `project_id` scopes every question to a project.
- `quiz_id` links a question to a quiz.
- Sprint 16 supports only `single_choice`.
- `options_json` stores public answer options.
- `correct_option_key` is stored server-side and is not returned by quiz detail.

## Endpoints

- `GET /api/v1/quizzes` returns published quizzes for the current project.
- `GET /api/v1/quizzes/{slug}` returns a published quiz with ordered questions and public options.
- `POST /api/v1/quizzes/{slug}/check` checks submitted answers and creates a `quiz.completed` event only when all answers are correct.

All endpoints require auth, active current `ProjectUser`, and `view_app`.

## Privacy And Progress

Sprint 17 still does not create user-owned quiz attempts. The check endpoint does not persist full answer history.

Completion is stored only as a generic progress event:

```text
event_type: quiz.completed
source_type: quiz
source_id: quizzes.id
source_slug: quizzes.slug
```

The completion rule is `correct_count == total_questions`. Partial checks return results and explanations but do not create progress.

Quiz completion affects Bottle, My Path, Progress Activity, and Home through existing read models. It does not affect lesson completion, diary stats, or taste profile.

Sprint 18 uses completion state for learning integration only as a read model:

- learning path detail can show `wine-basics-check` as a recommended quiz;
- lesson detail can point to the quiz after all mapped lessons are completed;
- My Path suggests the quiz only after all available lessons are completed.

This does not create attempts, answer history, locks, points, badges, streaks, or achievements.

## Seed Content

The dev seed creates one published beginner quiz, `wine-basics-check`, with 5 single-choice questions. Re-running seed updates the same quiz/questions and does not duplicate content.

## Future Work

Future work may add richer quiz history as a separate product design. That is intentionally not part of Sprint 17.
