# Frontend App Shell

## Structure

Sprint 7 app shell files:

```text
frontend/src/app/layouts/AppShell.tsx
frontend/src/app/layouts/AppHeader.tsx
frontend/src/app/layouts/BottomNav.tsx
```

Shared UI state components:

```text
frontend/src/shared/ui/LoadingState.tsx
frontend/src/shared/ui/ErrorState.tsx
frontend/src/shared/ui/EmptyState.tsx
```

`frontend/src/app/layout/UserAppLayout.tsx` remains as a compatibility re-export to `AppShell`.

## Route Integration

Authenticated user pages are rendered through:

```tsx
<AuthGuard>
  <AppShell />
</AuthGuard>
```

Covered routes:

- `/home`;
- `/discoveries`;
- `/discoveries/:slug`;
- `/diary`;
- `/diary/new`;
- `/diary/:noteId`;
- `/diary/:noteId/edit`;
- `/taste-profile`.

`/onboarding` is intentionally outside `AppShell`, so users do not see bottom navigation before onboarding completion.

`/admin` stays separate and remains protected by `AdminGuard`.

## Bottom Navigation

Bottom nav contains only active Sprint 7 destinations:

- Home -> `/home`;
- Открытия -> `/discoveries`;
- Дневник -> `/diary`;
- Профиль -> `/taste-profile`.

Active state is based on the current pathname, so detail routes such as `/discoveries/:slug` and `/diary/:noteId/edit` keep the correct section highlighted.

## Styling

The shell uses the existing theme:

- graphite background;
- bordeaux primary;
- gold accent;
- restrained card radius;
- mobile-first max-width content.

The bottom nav reserves safe-area spacing and the main content has bottom padding so navigation does not cover page content.

## Boundaries

The app shell is frontend navigation and UX infrastructure only. It does not change backend permissions, API response shapes, authentication, onboarding rules, or product domain behavior.
