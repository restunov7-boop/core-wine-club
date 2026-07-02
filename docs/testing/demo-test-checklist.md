# Demo Test Checklist

This checklist is for a controlled internal demo of `doch-vinodela` / `Дочь винодела`.

## Local Startup

Backend:

```powershell
cd C:\Users\restu\Documents\core\core-wine-club\backend
.\.venv\Scripts\Activate.ps1
alembic upgrade head
python -m scripts.seed_dev
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Frontend:

```powershell
cd C:\Users\restu\Documents\core\core-wine-club\frontend
pnpm install
pnpm dev -- --host 127.0.0.1 --port 5173
```

Recommended `frontend/.env.local`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
VITE_PROJECT_SLUG=doch-vinodela
VITE_DEV_TELEGRAM_MOCK=true
```

Smoke checks:

```powershell
cd C:\Users\restu\Documents\core\core-wine-club\frontend
pnpm smoke:routes
```

```powershell
cd C:\Users\restu\Documents\core\core-wine-club\backend
.\scripts\smoke_sprint6.ps1
```

## Recommended Demo Journey

1. Open `http://127.0.0.1:5173/home`.
2. Complete onboarding.
3. Confirm Home is lightweight: greeting, one next action, compact bottle preview, and an activity archive link.
4. Open Learning.
5. Open `Винная база без снобизма`.
6. Open the first lesson and mark it completed.
7. Complete the remaining lessons.
8. Open the recommended quiz and answer all questions correctly.
9. Add a diary note.
10. Open Bottle.
11. Open Taste Profile.
12. Open Progress.
13. Open My Path.
14. Open Admin as the default member and confirm access denied.

## Page Checks

- Home: calm first screen; no recent activity block; no large duplicate cards for discoveries, lessons, quizzes, or diary.
- Onboarding: calm beginner-friendly questions, no pressure language.
- Discoveries: seeded articles read as short wine guidance, not placeholder content.
- Learning: path card shows lesson progress and recommended quiz count.
- Lesson detail: completion control is clear; after all lessons, next-step CTA points to the quiz.
- Quizzes: copy says this is not an exam; completed quiz state is calm.
- Diary: empty state explains why the first note matters.
- Bottle: zero state feels intentional; progressed state explains lessons, notes, and quizzes; fill looks correct at 0%, mid fill, about 77%, and 100%.
- Taste Profile: empty groups say they improve after diary notes; compact progress statistics live here, not on Home.
- Progress: empty state is not alarming; progressed state reads as private history and uses readable Russian activity labels.
- My Path: first action is useful; completed quiz is not pushed again as primary.
- Admin: member role gets a clear access denied state.

## Expected Visible Changes

After lesson completion:

- Learning path completed count increases.
- Bottle learning contribution increases.
- Progress activity contains the lesson event.
- My Path switches from start learning to continue learning until all lessons are complete.

After quiz completion:

- Quiz detail shows completed state.
- Learning path recommended quiz shows completed.
- Bottle quiz contribution increases.
- Progress activity contains the quiz event with title `Квиз завершён`.
- My Path stops pushing the completed quiz as a primary action.

After diary note creation:

- Diary list contains the note.
- Bottle diary contribution increases.
- Taste Profile has more concrete data.
- Progress activity contains the diary event.

## Known Limitations

- This is an internal test/demo, not a public launch.
- Telegram production initData validation is not part of this demo flow.
- Admin remains a protected placeholder for member users.
- Content is seed-based, not managed through CMS.
- Quizzes do not store attempts or full answer history.
- No points, badges, streaks, leaderboards, social feed, comments, sharing, notifications, premium, payments, or AI recommendations.
- No locked prerequisites or paywall.
- Future wine room / bottle shelf is documented only and is not implemented in the MVP UI.
