# Wine Shelf QA and Migration Note

Sprint 37 adds the frontend Wine Shelf v1 experience on top of the Sprint 36 backend foundation.

## Production Migration Note

Wine Shelf is not production-ready until the Sprint 36 migration has been applied to the production Supabase database.

Do not put database secrets in docs, commits, tickets, screenshots, or chat logs.

Safe local command pattern:

```powershell
cd backend
$env:DATABASE_URL="<supabase-production-connection-string>"
.\.venv\Scripts\alembic.exe upgrade head
Remove-Item Env:\DATABASE_URL
```

Use the existing deployment flow and secret source for the production connection string. Do not run this from Codex. Render Shell may be unavailable on the free tier, so the known path is running Alembic locally against Supabase with the production connection string supplied only through the local environment.

## Manual QA Checklist

1. Apply the Wine Shelf migration in the target environment.
2. Open the Telegram Mini App.
3. Complete auth/onboarding if needed.
4. Open `/diary`.
5. Tap "Открыть винную полку".
6. Confirm `/diary/shelf` loads with a clear empty state.
7. Add a manual shelf item.
8. Confirm the item appears in the shelf list.
9. Use status filters:
   - Все
   - Хочу попробовать
   - Пробовала
   - Понравилось
   - Не моё
   - Купить снова
10. Change item status and save.
11. Add or edit the shelf note and save.
12. Delete the shelf item and confirm it disappears.
13. Create or open an existing diary note.
14. Tap "Добавить в полку".
15. Confirm the shelf item is created with a related diary note link.
16. Open the linked diary note from the shelf card.
17. Check mobile Telegram spacing:
   - no horizontal scroll;
   - bottom nav does not cover the form;
   - inputs and status chips are easy to tap;
   - loading, error, and empty states are readable.

## Known Scope Limits

- No frontend production readiness without the migration.
- No real wine database.
- No admin/content management.
- No premium/payments logic.
- No Discoveries, lessons, quizzes, or onboarding changes.
