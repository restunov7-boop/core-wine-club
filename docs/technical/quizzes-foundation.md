# Quizzes Foundation

Sprint 16 adds project-scoped quiz content and a local answer-check flow.

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
- `POST /api/v1/quizzes/{slug}/check` checks submitted answers without saving an attempt.

All endpoints require auth, active current `ProjectUser`, and `view_app`.

## Privacy And Progress

Sprint 16 does not create user-owned quiz attempts. The check endpoint is read/check only and does not write `ProgressEvent`.

Quizzes do not affect:

- Bottle progress;
- My Path;
- Progress Activity;
- lesson completion;
- diary stats;
- taste profile.

## Seed Content

The dev seed creates one published beginner quiz, `wine-basics-check`, with 5 single-choice questions. Re-running seed updates the same quiz/questions and does not duplicate content.

## Future Work

Sprint 17 may add quiz completion events to the existing progress ledger. That is intentionally outside Sprint 16.
