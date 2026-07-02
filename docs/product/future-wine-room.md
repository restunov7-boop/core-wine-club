# Future Wine Room / Bottle Shelf

This is a product direction note only. Sprint 23 does not implement a wine room, bottle shelf, bottle archive, new database table, migration, or new product system.

## Current Bottle

The current bottle is a single progress visualization for the active user in the current project.

It reads existing progress sources:

- completed lessons;
- private diary notes, capped by the current diary contribution target;
- completed published quizzes.

The current bottle is not an inventory item and is not stored as a completed object.

## Future Direction

A future Wine Room could turn completed bottles into a calm collection:

- a shelf of filled bottles;
- a history of completed learning/progress cycles;
- bottle labels that represent a finished period, path, or theme;
- a way to revisit past progress without turning it into points or a leaderboard.

## Possible Future Entities

Future implementation may need entities such as:

- `wine_room`;
- `completed_bottle`;
- `bottle_cycle`;
- `bottle_shelf_item`.

These are only candidate names. They are not part of Sprint 23.

## Sprint Boundary

Sprint 23 only documents the idea. It does not add:

- database migrations;
- backend endpoints;
- frontend routes;
- bottle archive UI;
- multiple bottles;
- gamification;
- points, achievements, badges, streaks, or leaderboards.

A future sprint could be named `Wine Room / Bottle Shelf Foundation`.
