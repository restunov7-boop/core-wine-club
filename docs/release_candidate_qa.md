# Release Candidate QA

This checklist is for the CORE Wine Club release-candidate pass. It contains no secrets and should be safe to share inside the project.

## Route Checklist

- `/home`
- `/diary`
- `/diary/new`
- `/diary/:noteId`
- `/diary/:noteId/edit`
- `/diary/shelf`
- `/taste-profile`
- `/profile`
- `/taste-map`
- `/dictionary`
- `/learn`
- `/learn/:pathSlug`
- `/learn/lessons/:lessonSlug`
- `/quizzes`
- `/quizzes/:quizSlug`
- `/discoveries`
- `/discoveries/:slug`
- `/progress`
- `/bottle`
- `/offline-tastings`
- `/onboarding`
- `/admin`
- unknown route fallback

## Telegram WebView Checklist

- App opens from the Telegram bot button.
- Login completes without showing raw Telegram `initData`.
- Profile opens from bottom navigation and `/profile` redirects to the real profile page.
- No token, secret, or stack trace appears in the UI.
- Bottom navigation does not cover page content.
- Safe-area spacing works on mobile.
- Long Russian text wraps without horizontal scroll.
- Error states stay calm and actionable.
- Unknown route opens a safe app fallback and does not show a technical browser error.

## Admin Access Checklist

- Admin access is granted through the backend QA utility, not through frontend hiding.
- The production QA user has `ProjectUser.role = admin` or `owner`, or the `access_admin` capability.
- `ProjectUser.status` is `active`.
- The Profile hub shows `Админ-панель` only for users with admin access.
- Regular users do not see the admin entry point in Profile.
- `/admin` is protected by `AdminGuard`.
- A non-admin opening `/admin` sees a calm Russian access-denied state.
- `/telegram-debug` may show role, status, capabilities, `isAdmin`, and `canAccessAdmin`.
- `/telegram-debug` must not show full Telegram `initData`, bearer tokens, secrets, passwords, or database URLs.

## Main User Journey

1. Open the Mini App from Telegram.
2. Complete onboarding if it appears.
3. Open Home.
4. Add a diary note.
5. Open diary note detail.
6. Add the note to Wine Shelf.
7. Open Wine Shelf.
8. Change shelf status and save.
9. Open Profile.
10. If the user is admin, open Profile -> Admin Panel.
11. Open Taste Map.
12. Open Dictionary.
13. Open Learn, Quiz, Discoveries, Progress, Bottle, and Offline Tastings.

## Wine Shelf Checklist

- Manual add works.
- Add from diary note works.
- A linked diary note does not invite duplicate adding after the shelf item is detected.
- Status filters wrap and work on mobile.
- Status update works.
- Personal shelf note update works.
- Remove item works.
- Empty state is clear.
- Backend/table unavailable error remains friendly.

## Taste Map Checklist

- Zero-country state is clean and not noisy.
- Opened-country markers only show real opened countries.
- Marker tap updates selected country detail.
- Opened country card tap updates selected country detail.
- Region progress shows `X / Y`.
- Achievements show achieved and locked states.
- Next-country cards have clear motivation and CTA.
- Profile hub country count matches Taste Map normalization.

## Dictionary Checklist

- Search input is comfortable on mobile.
- Category chips wrap.
- Empty search result is clear.
- Long terms and examples do not overflow.
- Profile hub link opens the dictionary.

## Diary Form Checklist

- Wine suggestions still appear after typing at least two characters.
- Sticky submit action does not cover the textarea or photo placeholder.
- Disabled and loading states are clear.
- Photo placeholder remains visible.
- Edit existing note preserves existing values.
- Delete confirmation is clear.

## Profile Checklist

- Summary does not fake analytics when there is no data.
- Profile hub cards are readable.
- Taste Map card uses normalized opened-country count.
- Personal rhythm remains at the bottom.

## Known Production Notes

- Render cold start can make the first backend request slow. User-facing copy should say the server is waking up.
- Wine Shelf depends on the production `wine_shelf_items` table already being migrated.
- Telegram auth should be tested from the bot, not only from a normal browser tab.
- Admin users must be granted through `backend/scripts/grant_project_admin.py` or an equivalent backend-controlled operation.
- `/telegram-debug` may be used for QA, but it must not display full `initData`.

## Deployment Reminders

- Confirm Vercel frontend env vars before release.
- Confirm Render backend env vars before release.
- Confirm Supabase migrations have been applied manually where required.
- Run frontend build and smoke checks before deploying.
- Do not paste secrets into QA reports or screenshots.
