# Sprint 17 - Quiz Completion Events / Progress Ledger

## Scope

Sprint 17 connects quizzes to the existing generic `ProgressEvent` ledger.

Implemented behavior:

- perfect quiz checks create `quiz.completed`;
- partial checks return local results without creating progress;
- repeated perfect checks are idempotent;
- quiz list/detail expose current user's completion state;
- progress summary includes a `quizzes` block;
- bottle progress includes published quizzes in total/completed units;
- progress activity maps quiz completion events;
- My Path and Home include gentle quiz progress cues.

## Completion Rule

A quiz is completed only when:

```text
correct_count == total_questions
```

There are no thresholds, grades, scores, points, badges, streaks, or rewards.

## Boundaries

No quiz attempts table was added. Full answer history is not persisted. The check endpoint returns selected/correct keys and explanations in the response, but only `quiz.completed` is stored when the completion rule is satisfied.

No admin CRUD, social features, premium logic, notifications, recommendations, or gamification were added.

## Validation

Required validation:

- `python -m compileall app`
- `python -m pytest`
- `alembic upgrade head`
- `python -m scripts.seed_dev`
- backend smoke script
- `pnpm install`
- `pnpm build`
- `pnpm smoke:routes`
- browser check for quiz completion, bottle, progress, my-path, home, learn, admin
