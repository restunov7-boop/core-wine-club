# UX Readiness

Sprint 14 is a frontend product-readiness pass over the already implemented Wine Club routes.

## Principles

- Keep the app calm, mobile-first, and route-safe.
- Use Home as the hub for next actions and progress.
- Keep Bottom Nav unchanged: Home, Открытия, Уроки, Дневник, Профиль.
- Prefer clear verbs: `Продолжить`, `Открыть`, `Добавить заметку`, `Продолжить уроки`, `Посмотреть бутылку`, `Вся активность`, `Назад`.
- Keep Bottle, My Path, and Progress personal and private. They are not social, gamified, or AI-driven surfaces.

## Shared UI

- Loading states use calm, short copy.
- Error states expose a readable failure message and a retry action.
- Empty states include a short explanation and a primary action when useful.
- Focus states and touch targets are visible enough for basic keyboard and mobile use.

## Home

Home section order is intentional:

1. My Path / `Что дальше`
2. Bottle
3. Learning
4. Diary
5. Taste Profile
6. Activity
7. Discoveries

This keeps Home focused on:

- where the user is;
- what to do next;
- where progress lives;
- where to continue.

## Route Safety

Unknown frontend routes redirect to `/home`. Auth and onboarding guards still decide whether the user can see the target page.

Admin access denied stays non-destructive and links back to Home.

## Mobile

The 390px target viewport should avoid horizontal overflow, keep bottom navigation readable, and keep primary CTAs reachable above the fixed navigation.

## Boundaries

Sprint 14 does not change backend business logic or API response shapes. It does not add a database table, migration, product domain, recommendation engine, AI, achievements, points, streaks, social feed, quizzes, premium/payments, or admin CRUD.

## Future UX Debt

- Consider lightweight route-level transition skeletons if pages begin to load slowly.
- Consider a dedicated not-found page if the product needs user-facing deep-link recovery.
- Revisit Home density after the next product modules are added.
- Add frontend component tests only when the app has a chosen lightweight test setup.
