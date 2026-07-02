from sqlalchemy.orm import Session

from app.bottle.service import DIARY_TARGET_NOTES_COUNT, build_bottle_progress
from app.my_path.schemas import MyPathAction, MyPathResponse, MyPathSection, MyPathSummary
from app.progress.service import (
    build_diary_progress_summary,
    build_learning_progress_summary,
    build_quiz_progress_summary,
    count_progress_activity_events,
)
from app.projects.models import ProjectUser


MAX_NEXT_ACTIONS = 4


def build_my_path(db: Session, project_user: ProjectUser) -> MyPathResponse:
    learning = build_learning_progress_summary(db, project_user)
    diary = build_diary_progress_summary(db, project_user)
    quizzes = build_quiz_progress_summary(db, project_user)
    bottle = build_bottle_progress(db, project_user)
    recent_activity_count = count_progress_activity_events(db, project_user)

    summary = MyPathSummary(
        completed_lessons_count=learning.completed_lessons_count,
        available_lessons_count=learning.available_lessons_count,
        completed_quizzes_count=quizzes.completed_quizzes_count,
        available_quizzes_count=quizzes.available_quizzes_count,
        diary_notes_count=diary.notes_count,
        diary_target_notes_count=DIARY_TARGET_NOTES_COUNT,
        bottle_fill_percent=bottle.fill_percent,
        recent_activity_count=recent_activity_count,
    )

    return MyPathResponse(
        summary=summary,
        next_actions=_build_next_actions(summary),
        sections=_build_sections(summary),
    )


def _build_next_actions(summary: MyPathSummary) -> list[MyPathAction]:
    actions: list[MyPathAction] = []

    if summary.completed_lessons_count == 0:
        actions.append(
            MyPathAction(
                key="start_learning",
                title="Начать с первого урока",
                description="Пройди первый короткий урок, чтобы спокойно войти в тему.",
                href="/learn",
                priority=10,
            )
        )
    elif summary.completed_lessons_count < summary.available_lessons_count:
        actions.append(
            MyPathAction(
                key="continue_learning",
                title="Продолжить уроки",
                description="Пройди следующий короткий урок, чтобы бутылка наполнялась дальше.",
                href="/learn",
                priority=10,
            )
        )

    if summary.diary_notes_count == 0:
        actions.append(
            MyPathAction(
                key="add_first_diary_note",
                title="Добавить первую заметку",
                description="Запиши впечатления о вине, чтобы начать собирать профиль вкуса.",
                href="/diary/new",
                priority=20,
            )
        )
    elif summary.diary_notes_count < summary.diary_target_notes_count:
        actions.append(
            MyPathAction(
                key="add_diary_note",
                title="Пополнить дневник вкуса",
                description="Добавь ещё одну заметку, чтобы профиль вкуса стал точнее.",
                href="/diary/new",
                priority=20,
            )
        )

    if summary.bottle_fill_percent > 0:
        actions.append(
            MyPathAction(
                key="view_bottle",
                title="Посмотреть бутылку",
                description="Посмотри, как уроки и дневник уже наполнили бутылку.",
                href="/bottle",
                priority=30,
            )
        )

    if summary.diary_notes_count >= summary.diary_target_notes_count:
        actions.append(
            MyPathAction(
                key="view_taste_profile",
                title="Посмотреть профиль вкуса",
                description="Посмотри первые закономерности по своим заметкам.",
                href="/taste-profile",
                priority=40,
            )
        )

    if (
        summary.available_lessons_count > 0
        and summary.completed_lessons_count >= summary.available_lessons_count
        and summary.completed_quizzes_count < summary.available_quizzes_count
    ):
        actions.append(
            MyPathAction(
                key="try_quiz",
                title="Закрепить знания в квизе",
                description="Ответь на несколько спокойных вопросов без оценок и давления.",
                href="/quizzes",
                priority=25,
            )
        )

    if summary.recent_activity_count > 0:
        actions.append(
            MyPathAction(
                key="view_activity",
                title="Посмотреть активность",
                description="Вернись к действиям, которые уже наполняли бутылку.",
                href="/progress",
                priority=50,
            )
        )

    return sorted(actions, key=lambda action: action.priority)[:MAX_NEXT_ACTIONS]


def _build_sections(summary: MyPathSummary) -> list[MyPathSection]:
    return [
        MyPathSection(
            key="learning",
            title="Уроки",
            description=f"Завершено {summary.completed_lessons_count} из {summary.available_lessons_count}.",
            href="/learn",
        ),
        MyPathSection(
            key="diary",
            title="Дневник",
            description=f"Добавлено {summary.diary_notes_count} из {summary.diary_target_notes_count} стартовых заметок.",
            href="/diary",
        ),
        MyPathSection(
            key="quizzes",
            title="Квизы",
            description=f"Завершено {summary.completed_quizzes_count} из {summary.available_quizzes_count}.",
            href="/quizzes",
        ),
        MyPathSection(
            key="bottle",
            title="Моя бутылка",
            description=f"Заполнена на {summary.bottle_fill_percent}%.",
            href="/bottle",
        ),
        MyPathSection(
            key="activity",
            title="Активность",
            description=(
                "Последние действия, которые наполняли бутылку."
                if summary.recent_activity_count > 0
                else "История появится после первых действий."
            ),
            href="/progress",
        ),
        MyPathSection(
            key="discoveries",
            title="Открытия",
            description="Короткие материалы, чтобы расширить винный кругозор.",
            href="/discoveries",
        ),
    ]
