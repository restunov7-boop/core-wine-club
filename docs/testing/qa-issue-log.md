# QA Issue Log

Use this file to collect manual QA findings before turning them into implementation sprints. Do not invent pass/fail results; record only observed or known items.

| ID | Area | Issue | Status | Sprint | Notes |
| --- | --- | --- | --- | --- | --- |
| QA-001 | Home | Home was overloaded with too many sections, duplicated navigation, statistics, and recent activity. | Fixed | Sprint 23 | Home is now a lightweight entry point with next action, bottle preview, profile link, and activity archive link. |
| QA-002 | Progress Activity | Quiz completion label displayed mojibake instead of readable Russian. | Fixed | Sprint 23 | `quiz.completed` now displays `Квиз завершён`. |
| QA-003 | Bottle | Bottle fill visual behaved incorrectly around 77% and higher. | Fixed | Sprint 23 | Body and neck fill are now calculated separately and clamped. |
| QA-004 | Telegram QA | Real Telegram bot -> Web App button -> HTTPS Mini App flow still needs a manual mobile QA pass. | Pending | Sprint 24 | Use `docs/testing/manual-mobile-telegram-qa.md` and fill `docs/testing/manual-mobile-telegram-qa-result.md`. |
