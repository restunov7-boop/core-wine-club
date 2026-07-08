# Sprint 42 Release QA Checklist

This checklist is for release QA after the current CORE Wine Club stabilization pass.

## Production URLs

- Frontend: Vercel production URL for the Telegram Mini App.
- Backend: Render production API URL.
- Telegram bot: open the Mini App from the production bot `/start` button.

Do not store tokens, passwords, DATABASE_URL values, or Telegram secrets in this document.

## Main Route Checklist

- `/home` opens after Telegram auth and shows the current home layout.
- `/diary` opens, handles empty notes, and note cards link to details.
- `/diary/new` saves a note and returns to the created note/detail flow.
- `/diary/:noteId` shows detail, edit, delete, and Wine Shelf actions.
- `/diary/shelf` loads, filters, creates, updates, and deletes shelf items.
- `/taste-profile` and `/profile` show Profile hub, live stats, and links.
- `/taste-map` shows the map, progress, opened countries, and empty state.
- `/dictionary` supports search, category chips, and empty search state.
- `/learn` and lesson detail routes open without dead-end states.
- `/quizzes` and quiz detail routes open and completion CTAs are usable.
- `/discoveries` and discovery detail routes open.
- `/progress` opens with empty and non-empty progress states.
- `/bottle` opens with calm zero/progress states.
- `/offline-tastings` opens as an intentional placeholder.
- `/onboarding` works for a fresh user.

## Telegram Mini App Checklist

- Open production bot in Telegram.
- Press `/start` and open the Mini App using the Web App button.
- Confirm Telegram initData is detected without dev mock.
- Confirm auth completes and `/home` opens.
- Confirm back navigation feels stable inside Telegram WebView.
- Confirm no screen has horizontal scroll on a phone viewport.
- Confirm bottom navigation does not overlap form submit buttons.

## Wine Shelf Checklist

- Empty shelf shows a friendly state.
- Add a shelf item manually.
- Add a shelf item from a diary note detail page.
- Confirm already-added diary note shows the shelf link, not a duplicate add CTA.
- Change item status: want to try, tried, liked, not for me, buy again.
- Edit personal note.
- Filter by status.
- Delete item.
- If backend/table is unavailable, UI should show a friendly recoverable error.

Known note: the production Supabase migration for `wine_shelf_items` was already applied manually via the Supabase pooler connection string. Secrets were not stored in the repository.

## Taste Profile Checklist

- Fresh user sees soft fallback insights.
- User with diary notes sees note count and average rating.
- User with shelf items sees shelf counts.
- Profile hub links work: Taste Map, Dictionary, Wine Shelf, New Diary Note.
- "Личный ритм" remains near the bottom.
- Old static "Мои предпочтения" block is not restored.
- Insights remain simple and truthful; no fake analytics.

## Taste Map Checklist

- Empty state appears when there are no countries from diary or shelf.
- Opened countries appear when diary notes or shelf items include countries.
- If diary notes are deleted but shelf items remain, opened countries may remain.
- The source note explains that data comes from both diary and Wine Shelf.
- Map uses soft continent droplets and readable opened/unopened markers.
- Legend is visible.
- Suggested next countries are visible.
- No horizontal scroll in Telegram WebView.

## Dictionary Checklist

- Search by title works.
- Search by category/definition text works.
- Category chips filter terms.
- Empty search state is friendly.
- Cards are readable on mobile.
- No remote data fetch is required.

## After Vercel Deploy

- Open `/home`, `/taste-profile`, `/taste-map`, `/dictionary`, and `/diary/shelf`.
- Run route smoke against production if needed by setting `FRONTEND_BASE_URL`.
- Confirm frontend environment points to the Render API base URL.
- Confirm `VITE_DEV_TELEGRAM_MOCK` is not enabled for production.

## After Render Deploy

Only needed if backend changes are deployed.

- Check `/api/v1/health`.
- Check Telegram auth from the Mini App.
- Check `/api/v1/auth/me`.
- Check diary note create/list/detail.
- Check Wine Shelf list/create/update/delete.
- Check `/api/v1/taste-profile`.
