from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.permissions.dependencies import require_capability
from app.progress.service import build_progress_summary, mark_lesson_completed, unmark_lesson_completed
from app.projects.models import ProjectUser
from app.shared.responses import success_response

router = APIRouter(prefix="/progress", tags=["progress"])


@router.post("/lessons/{lesson_slug}/complete")
def complete_lesson(
    lesson_slug: str,
    db: Annotated[Session, Depends(get_db)],
    project_user: Annotated[ProjectUser, Depends(require_capability("view_app"))],
) -> dict[str, object]:
    completion = mark_lesson_completed(db, project_user, lesson_slug)
    return success_response(completion.model_dump(mode="json"))


@router.delete("/lessons/{lesson_slug}/complete")
def uncomplete_lesson(
    lesson_slug: str,
    db: Annotated[Session, Depends(get_db)],
    project_user: Annotated[ProjectUser, Depends(require_capability("view_app"))],
) -> dict[str, object]:
    completion = unmark_lesson_completed(db, project_user, lesson_slug)
    return success_response(completion.model_dump(mode="json"))


@router.get("/summary")
def get_progress_summary(
    db: Annotated[Session, Depends(get_db)],
    project_user: Annotated[ProjectUser, Depends(require_capability("view_app"))],
) -> dict[str, object]:
    summary = build_progress_summary(db, project_user)
    return success_response(summary.model_dump(mode="json"))
