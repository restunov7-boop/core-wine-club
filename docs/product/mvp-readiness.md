# MVP Readiness

## Current Completed Areas

`Дочь винодела` currently has enough connected areas for an internal MVP preview:

- auth, identity, project membership, and permissions;
- onboarding and Home;
- discoveries;
- learning paths and lessons;
- lesson completion through the progress ledger;
- quizzes and quiz completion events;
- private diary CRUD;
- taste profile from onboarding and diary;
- bottle progress from lessons, diary notes, and quizzes;
- progress activity;
- deterministic My Path next actions;
- frontend app shell and route smoke coverage.

## Ready For Internal Testing

The app is ready for a controlled internal test where a tester can:

- enter with dev Telegram mock auth;
- complete onboarding;
- understand the first recommended step from Home and My Path;
- read seed content;
- complete learning lessons;
- take the mapped quiz;
- add diary notes;
- see Bottle, Taste Profile, Progress, and My Path react to those actions.
- confirm Home stays lightweight while statistics live in profile/progress surfaces.

This is suitable for checking product coherence, copy, demo flow, and basic technical stability.

## Not Production-Ready Yet

The app is not ready for public launch because these areas are intentionally incomplete:

- production Telegram Mini App launch flow;
- production deployment, observability, and environment hardening;
- admin content management;
- moderation workflows;
- full QA pass across browsers/devices;
- real user support and feedback loops;
- privacy/legal review for a public audience;
- content expansion beyond seed material.

## Known Limitations

- Content is seeded and idempotent, not CMS-managed.
- Quiz completion is stored, but quiz attempts and full answer history are not stored.
- Admin is not a CRUD interface yet.
- Dev auth is used for local testing.
- My Path is deterministic, not AI-driven.
- Bottle progress is a calm progress read-model, not gamification.
- Future wine room / bottle shelf is documented as a direction, not implemented.
- There are no points, achievements, badges, streaks, leaderboards, locked prerequisites, social features, premium, payments, notifications, or paywall.

## Readiness Levels

Internal test:

- Ready enough to test the connected MVP flow with known limitations.
- Expected audience: project team and trusted testers.
- Goal: find rough copy, confusing states, and flow gaps.

Blogger/client demo:

- Needs Telegram Mini App readiness, cleaner demo data reset, and a guided demo script.
- Should have a stable hosted environment.
- Should avoid exposing unfinished admin and operational surfaces.

Real public launch:

- Needs production Telegram validation, deployment hardening, monitoring, privacy/legal review, admin/content workflow, support process, and broader QA.

## Suggested Next 3 Sprints

Sprint 20 - Telegram Mini App Readiness:

- production-oriented Telegram WebApp integration review;
- launch surface checks;
- environment and config documentation;
- no new product systems unless required for readiness.

Sprint 21 - Internal QA / Test Release:

- structured QA pass;
- demo data reset procedure;
- bug fixing from internal tester feedback;
- device/browser checks.

Sprint 22 - Real Telegram QA / HTTPS Tunnel Test:

- controlled Telegram QA checklist;
- safe helper scripts for local env checks;
- HTTPS tunnel requirements documented;
- no production launch.

Sprint 23 - Manual QA Fixes:

- address findings from internal QA;
- simplify Home;
- move statistics to profile/progress areas;
- fix activity labels and bottle visual rough edges.
