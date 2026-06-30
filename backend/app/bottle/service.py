from sqlalchemy.orm import Session

from app.bottle.schemas import BottleBreakdown, BottleNextAction, BottleProgress
from app.progress.service import build_learning_progress_summary
from app.projects.models import ProjectUser


def build_bottle_progress(db: Session, project_user: ProjectUser) -> BottleProgress:
    learning = build_learning_progress_summary(db, project_user)
    total_units = learning.available_lessons_count
    completed_units = min(learning.completed_lessons_count, total_units)
    fill_percent = 0 if total_units == 0 else min(100, int((completed_units / total_units) * 100))

    return BottleProgress(
        title="Моя бутылка",
        subtitle="Заполняется по мере прохождения уроков.",
        fill_percent=fill_percent,
        completed_units=completed_units,
        total_units=total_units,
        source="learning_lessons",
        breakdown=BottleBreakdown(
            completed_lessons_count=learning.completed_lessons_count,
            available_lessons_count=learning.available_lessons_count,
        ),
        next_action=BottleNextAction(
            label="Продолжить уроки",
            href="/learn",
        ),
    )
