# Error Handling and Production Resilience

Sprint 44 keeps error handling calm, user-facing, and safe for production.

Do not include secrets, tokens, full Telegram initData, passwords, or database URLs in user-facing errors, logs, screenshots, or docs.

## Common User-Facing Messages

- Network unavailable: `Не удалось связаться с сервером. Проверь соединение и попробуй снова.`
- Render cold start or temporary gateway error: `Сервер просыпается. Попробуй ещё раз через несколько секунд.`
- Generic server error: `Сервер временно недоступен. Попробуй обновить страницу чуть позже.`
- Telegram auth failed: `Не удалось подтвердить вход через Telegram. Открой приложение из бота ещё раз.`
- Access denied: `Нет доступа к этому разделу.`
- Not found: `Эта запись не найдена или уже удалена.`
- Generic request failure: `Не удалось выполнить запрос. Попробуй ещё раз.`

## Render Cold Start Behavior

Render free or low-traffic services may take a few seconds to wake up.

Manual QA:

- Open `/home` after backend idle time.
- If the first request fails, confirm the UI suggests retrying calmly.
- Retry after a few seconds.
- Confirm no stack traces or internal URLs appear in the UI.

## Telegram Auth Troubleshooting

Manual QA:

- Open the Mini App from the Telegram bot, not from a copied browser URL.
- Confirm `/home` opens after auth.
- If auth fails, UI should ask the user to open the app from the bot again.
- `/telegram-debug` may show initData length/source for QA, but must not show full initData.

## Wine Shelf Migration/Table Issue Behavior

Wine Shelf should show a friendly message if the backend table or migration is unavailable.

Manual QA:

- Open `/diary/shelf`.
- Add a shelf item.
- Add from diary note detail.
- Update status.
- Delete item.
- Confirm errors do not expose SQL, stack traces, or connection strings.

## Page Error QA Checklist

- `/home`: loading, backend unavailable, no diary notes.
- `/diary`: list loading, list error, empty state.
- `/diary/new`: submit disabled/loading state and submit error.
- `/diary/:noteId`: not found, delete error, add-to-shelf error.
- `/diary/shelf`: list/create/update/delete errors and empty state.
- `/taste-profile`: loading, no data fallback, server error.
- `/taste-map`: loading, server error, no countries empty state.
- `/dictionary`: search empty state.
- `/learn/lessons/:lessonSlug`: not found and back to lessons.
- `/quizzes/:quizSlug`: not found and continue learning CTA.
- Unknown route: should safely redirect to `/home`.

## Debug Safety

- Do not log full Telegram initData.
- Do not show tokens or secrets in production UI.
- Keep debug information limited to presence, platform, version, and initData length/source.
