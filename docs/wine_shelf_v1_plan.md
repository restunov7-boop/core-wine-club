# Wine Shelf v1 Plan

Sprint 35 decision document. This is a product and architecture plan only; no model, migration, API, or frontend implementation is included in this sprint.

## 1. Product Purpose

Wine Shelf is a private personal shelf for wines a member wants to remember beyond a single tasting note. It should feel like a simple wine journal shelf, not a public collection or marketplace.

Wine Shelf should support:

- wines the user wants to try;
- wines already tried;
- wines the user liked;
- wines that were not for the user;
- wines the user would buy again;
- possible future favorites.

It should not be a real wine database in v1. The shelf stores the user's own intent and memory around a wine, optionally linked to a diary note. Wine suggestions can help prefill text, but suggestions are not canonical product records.

## 2. User Flows

### Add from Diary note

1. User opens an existing diary note.
2. User taps "Add to shelf" or changes a shelf status block.
3. Backend creates or updates a shelf item for the current `project_user_id`.
4. Shelf item links back to the diary note.
5. Detail page shows the current shelf status.

### Add directly from Diary / Wine Shelf

1. User opens Diary and the Wine Shelf section.
2. User taps "Add wine".
3. User searches with the existing wine suggestions autocomplete or types a custom wine.
4. User chooses initial status, usually "want to try".
5. Backend creates a private shelf item with no diary note link yet.

### Change shelf status

1. User opens shelf item or note-linked shelf block.
2. User chooses a new status.
3. Backend updates only that user's shelf item.
4. UI updates status labels and filters.

### Filter by status

1. User opens Wine Shelf.
2. User selects a status filter: all, want to try, tried, liked, not for me, buy again.
3. Frontend requests filtered data from backend or filters the current page if v1 response is small.

### Open related diary note

1. Shelf card shows "Diary note" when `tasting_note_id` exists.
2. User opens `/diary/:noteId`.
3. If the note was deleted, the shelf item remains but the note link is hidden or marked unavailable.

### Remove from shelf

1. User opens shelf item actions.
2. User confirms remove.
3. Backend deletes or soft-deletes the shelf item for current `project_user_id`.
4. Related diary note remains unchanged.

## 3. Status Model Proposal

Recommended v1 statuses:

| Status | Russian label | Meaning |
| --- | --- | --- |
| `want_to_try` | Хочу попробовать | The user has not tried it yet and wants to remember it. |
| `tried` | Уже пробовала | Tried, but no stronger judgment selected. |
| `liked` | Понравилось | The wine was liked and worth remembering. |
| `not_for_me` | Не моё | The wine was not a good match. |
| `buy_again` | Купила бы снова | Strong positive intent to repeat or buy again. |

`buy_again` should stay separate from `liked`. A wine can be liked but not necessarily worth buying again.

Future optional status:

- `favorite` / Избранное: not needed in v1 unless user testing proves it is clearer than `liked` and `buy_again`.

## 4. Architecture Options

### A. Frontend-only shelf

Store shelf items in local storage or frontend state.

Pros:

- Fastest implementation.
- No backend migration.
- No API work.
- Good for visual prototype only.

Cons:

- Does not work reliably across devices.
- Data can be lost when browser storage is cleared.
- Telegram WebView storage behavior can vary.
- No backend permissions or ownership enforcement.
- Cannot be trusted for premium/access behavior.

Risks:

- User may believe shelf is saved while it is local only.
- Hard to migrate cleanly once people use it.
- Frontend hiding is not security.

Across devices:

- No.

Fit with current architecture:

- Weak. Current diary, progress, taste profile, and auth are backend-backed and scoped by project/current user.

### B. Backend persisted shelf

Create a `wine_shelf_items` table and API scoped by current project and current project user.

Pros:

- Reliable across devices and sessions.
- Matches current diary ownership model.
- Allows proper backend permissions.
- Can link to `tasting_notes`.
- Supports future filters, shelf stats, bottle/profile read models, and admin-safe boundaries.

Cons:

- Requires migration, model, schemas, service, routes, tests.
- Slightly more work than frontend-only.
- Needs careful dedupe rules.

Risks:

- If over-modeled, v1 could drift into a real wine database. Keep fields simple and user-owned.
- Need to decide behavior when linked diary note is deleted.

Across devices:

- Yes.

Fit with current architecture:

- Strong. It follows existing private diary and progress patterns.

### C. Hybrid using diary notes only

Do not create shelf storage. Derive shelf views from existing diary notes: liked, not for me, buy again.

Pros:

- No migration.
- Uses existing `tasting_notes`.
- Works across devices because diary is persisted.
- Safe for "tried", "liked", and "buy_again" views.

Cons:

- Cannot represent "want to try" without a tasting note.
- Cannot add wines directly to shelf before tasting.
- Shelf becomes just another diary filter, not a true shelf.
- Hard to support remove-from-shelf without changing diary semantics.

Risks:

- Users may expect shelf to include wishlist wines.
- Overloading diary fields makes product behavior confusing.

Across devices:

- Yes, but only for wines already in diary.

Fit with current architecture:

- Medium. It is safe but incomplete for the product goal.

## 5. Recommended v1

Recommend: **Backend persisted shelf**.

Reasoning:

- Wine Shelf is user-owned product data, not presentation state.
- It should work across Telegram sessions and devices.
- It should be private like Diary.
- It needs backend permission checks if persisted.
- It should support `want_to_try`, which diary-only cannot model cleanly.

Architectural rules:

- User-owned shelf rows must use `project_user_id`.
- Project-scoped shelf rows must also use `project_id`.
- Frontend hiding is not security.
- Backend permissions are mandatory for all persisted shelf reads/writes.
- Endpoints should require active current `ProjectUser` and `view_app`.
- Premium/access should remain state on `ProjectUser`, not a role. Do not add premium shelf logic in v1 unless explicitly scoped later.

## 6. Data Model Draft

Draft only. Do not implement in Sprint 35.

Table/model name:

- `wine_shelf_items`
- `WineShelfItem`

Fields:

- `id`: UUID primary key
- `project_id`: UUID, required, FK `projects.id`
- `project_user_id`: UUID, required, FK `project_users.id`
- `tasting_note_id`: UUID nullable, FK `tasting_notes.id`, `ON DELETE SET NULL`
- `wine_name`: string, required
- `producer`: string nullable
- `country`: string nullable
- `region`: string nullable
- `grape`: string nullable
- `vintage`: integer nullable
- `wine_color`: string nullable, same value family as diary if reused
- `status`: enum/string, required
- `source`: string nullable, examples: `manual`, `diary_note`, `suggestion`
- `notes`: text nullable, short shelf-specific note
- `created_at`: datetime
- `updated_at`: datetime

Relations:

- belongs to `Project`
- belongs to `ProjectUser`
- optionally belongs to `TastingNote`

Indexes:

- `ix_wine_shelf_items_project_id`
- `ix_wine_shelf_items_project_user_id`
- `ix_wine_shelf_items_tasting_note_id`
- `ix_wine_shelf_items_status`
- optional unique partial/index-like rule for one shelf item per `(project_id, project_user_id, tasting_note_id)` when `tasting_note_id` is not null

Dedupe rules:

- For diary-linked shelf rows, prevent duplicate shelf items for the same current user and note.
- For manual rows, allow duplicate wine names initially or use soft UI warning only. Wine names are not canonical identifiers.

Permission requirements:

- All reads filter by current `project_id` and current `project_user_id`.
- All writes set `project_id` and `project_user_id` from auth context, not from request body.
- If linking `tasting_note_id`, backend must verify the note belongs to the same `project_id` and `project_user_id`.
- Normal users cannot read or mutate another user's shelf item.

API endpoints draft:

```text
GET    /api/v1/wine-shelf/items?status=&limit=&offset=
POST   /api/v1/wine-shelf/items
GET    /api/v1/wine-shelf/items/{item_id}
PATCH  /api/v1/wine-shelf/items/{item_id}
DELETE /api/v1/wine-shelf/items/{item_id}
POST   /api/v1/diary/notes/{note_id}/shelf
```

Alternative to the last endpoint:

```text
POST /api/v1/wine-shelf/items
```

with `tasting_note_id` in the payload. This is simpler if service validation is clear.

## 7. Frontend UI Draft

Placement:

- v1 should live inside Diary as a "Винная полка" section.
- A dedicated `/wine-shelf` route can come later if shelf becomes large.
- Diary should keep its current note list and empty states.

Layout:

- Use compact paper cards similar to diary note cards.
- Each shelf card shows:
  - wine name;
  - status pill;
  - country/region;
  - grape/style when present;
  - linked diary note CTA when present.

Filters:

- Segmented pills:
  - Все
  - Хочу попробовать
  - Уже пробовала
  - Понравилось
  - Не моё
  - Купила бы снова

Empty states:

- Empty all shelf: "Полка пока пустая. Добавь вино, которое хочется попробовать или запомнить."
- Empty filtered shelf: "В этом статусе пока ничего нет."

Relation to wine suggestions:

- The existing `wineSuggestions` frontend catalog can prefill manual shelf creation.
- Suggestions remain helper data, not canonical wine records.
- If a user chooses a suggestion, store copied text fields on `WineShelfItem`.

Diary integration:

- Diary note detail can show a small shelf status panel.
- Diary note list should not become crowded. It can show a small shelf indicator only later if useful.

## 8. Sprint Breakdown

### Sprint A: Wine Shelf backend foundation

- Add migration and model.
- Add schemas, service, routes.
- Add permissions and ownership checks.
- Add backend tests for CRUD and cross-user isolation.
- No major UI beyond API readiness.

### Sprint B: Wine Shelf UI v1

- Add Diary shelf section.
- Add list, status filters, empty states.
- Add create/edit/remove UI for manual shelf items.
- Reuse existing wine suggestions autocomplete.

### Sprint C: Add from Diary note

- Add shelf action on diary note detail.
- Link shelf item to note.
- Show linked note in shelf card.
- Handle deleted note link gracefully.

### Sprint D: Filters/status polish

- Improve status labels and visual pills.
- Add simple sorting: updated first or status groups.
- Add manual QA for mobile Telegram WebView.

### Sprint E: QA and readiness

- Backend pytest coverage.
- Frontend build and smoke routes.
- Manual QA for add/update/delete/filter/link flows.
- Confirm no cross-user/project data leakage.

## Decision

Wine Shelf should not be implemented as frontend-only state. The recommended v1 is a backend-persisted, private, user-owned shelf using `project_id` and `project_user_id`, with optional links to existing diary notes.
