from sqlalchemy.orm import Session

from app.bottle.schemas import BottleBreakdown, BottleDiaryBreakdown, BottleLearningBreakdown, BottleNextAction, BottleProgress
from app.progress.service import build_diary_progress_summary, build_learning_progress_summary
from app.projects.models import ProjectUser


DIARY_TARGET_NOTES_COUNT = 3


def build_bottle_progress(db: Session, project_user: ProjectUser) -> BottleProgress:
    learning = build_learning_progress_summary(db, project_user)
    diary = build_diary_progress_summary(db, project_user)
    diary_contributed_units = min(diary.notes_count, DIARY_TARGET_NOTES_COUNT)
    total_units = learning.available_lessons_count + DIARY_TARGET_NOTES_COUNT
    completed_units = min(learning.completed_lessons_count, learning.available_lessons_count) + diary_contributed_units
    fill_percent = 0 if total_units == 0 else min(100, int((completed_units / total_units) * 100))
    next_action = _build_next_action(learning.completed_lessons_count, learning.available_lessons_count, diary.notes_count)

    return BottleProgress(
        title="Моя бутылка",
        subtitle="Заполняется по мере уроков и заметок в дневнике.",
        fill_percent=fill_percent,
        completed_units=completed_units,
        total_units=total_units,
        source="learning_and_diary",
        breakdown=BottleBreakdown(
            learning=BottleLearningBreakdown(
                completed_lessons_count=learning.completed_lessons_count,
                available_lessons_count=learning.available_lessons_count,
            ),
            diary=BottleDiaryBreakdown(
                notes_count=diary.notes_count,
                target_notes_count=DIARY_TARGET_NOTES_COUNT,
                contributed_units=diary_contributed_units,
            ),
        ),
        next_action=next_action,
    )


def _build_next_action(
    completed_lessons_count: int,
    available_lessons_count: int,
    notes_count: int,
) -> BottleNextAction:
    if completed_lessons_count < available_lessons_count:
        return BottleNextAction(label="Продолжить уроки", href="/learn")
    if notes_count < DIARY_TARGET_NOTES_COUNT:
        return BottleNextAction(label="Добавить заметку", href="/diary/new")
    return BottleNextAction(label="Посмотреть профиль вкуса", href="/taste-profile")
