# Mobile Telegram QA

Sprint 47 focuses on mobile Telegram WebView readability, spacing, and safe-area behavior. This checklist has no secrets and does not require production credentials.

## Routes To Check

- `/home`
- `/diary`
- `/diary/new`
- diary note detail
- `/diary/shelf`
- `/profile`
- `/taste-map`
- `/dictionary`
- `/learn`
- quiz pages
- `/discoveries`
- `/progress`
- `/bottle`
- `/offline-tastings`

## Telegram WebView Checklist

- The page has no horizontal scroll at common mobile widths.
- Bottom navigation does not cover the final content block.
- Sticky diary form action stays above the bottom navigation and safe area.
- Inputs, textareas, filters, and action buttons are easy to tap.
- Long Russian copy wraps inside cards and buttons.
- Loading and error states remain readable in a narrow viewport.
- Keyboard opening on `/diary/new` still leaves the save action understandable.

## Taste Map Checklist

- The SVG map fits the screen width.
- Only opened country markers are visible.
- Opened markers are tappable.
- Selected country detail fits without horizontal scroll.
- Region progress and achievements stay calm and readable.
- Empty state shows a clean map and a clear CTA to add a diary note.

## Form And Navigation Notes

- The app shell reserves space for bottom navigation with `--bottom-nav-height` and `env(safe-area-inset-bottom)`.
- The diary form has extra bottom padding so the sticky submit action does not cover the photo block or final fields.
- On very narrow screens, dense grids collapse to one column where readability matters more than compactness.

## Manual Smoke

1. Open the app from Telegram.
2. Visit each route above.
3. Scroll to the bottom of each page.
4. Tap the bottom navigation between sections.
5. Add text to `/diary/new`, including a long personal note.
6. Open `/taste-map`, tap an opened marker or country card, and confirm the detail card updates.
7. Search in `/dictionary` with a long query and switch categories.
