# My Path

Sprint 13 adds a read-only, deterministic guidance layer for the current user.

## Endpoint

`GET /api/v1/my-path`

Requires:

- auth;
- active current `ProjectUser`;
- `view_app`.

No new table is created. The endpoint reuses existing services:

- learning progress summary;
- diary progress summary;
- bottle progress;
- progress activity count.

## Response

The endpoint returns:

- title and subtitle;
- summary counts;
- up to 4 next actions;
- section links to existing app areas.

## Rules

Rules are intentionally simple and deterministic:

- no completed lessons -> start learning;
- some completed lessons -> continue learning;
- no diary notes -> add first diary note;
- 1-2 diary notes -> add diary note;
- bottle fill greater than 0 -> view bottle;
- at least 3 diary notes -> view taste profile;
- existing progress activity -> view activity.

Actions are sorted by priority and capped at 4.

## Home Preview

`/home` includes:

```text
key: my_path
title: Что дальше
href: /my-path
items: first 2 next actions
```

## Privacy

My Path reads only the current project and current `ProjectUser` state. It does not expose other users, admin-only data, or platform-global data.

## Non-Goals

My Path is not AI recommendations, not a recommendation engine, not scoring, and not gamification. Sprint 13 does not add achievements, points, badges, streaks, quests, social feed, comments, likes, sharing, rankings, notifications, quizzes, or a new progress source.
