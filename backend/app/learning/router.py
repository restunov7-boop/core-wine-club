from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.learning.service import get_learning_path_detail, get_lesson_detail, list_learning_path_summaries
from app.permissions.dependencies import require_capability
from app.projects.models import ProjectUser
from app.shared.responses import success_response

router = APIRouter(prefix="/learning", tags=["learning"])


@router.get("/paths")
def get_learning_paths(
    db: Annotated[Session, Depends(get_db)],
    project_user: Annotated[ProjectUser, Depends(require_capability("view_app"))],
) -> dict[str, object]:
    items = list_learning_path_summaries(db, project_user)
    return success_response({"items": [item.model_dump(mode="json") for item in items]})


@router.get("/paths/{slug}")
def get_learning_path(
    slug: str,
    db: Annotated[Session, Depends(get_db)],
    project_user: Annotated[ProjectUser, Depends(require_capability("view_app"))],
) -> dict[str, object]:
    learning_path = get_learning_path_detail(db, project_user, slug)
    return success_response(learning_path.model_dump(mode="json"))


@router.get("/lessons/{slug}")
def get_lesson(
    slug: str,
    db: Annotated[Session, Depends(get_db)],
    project_user: Annotated[ProjectUser, Depends(require_capability("view_app"))],
) -> dict[str, object]:
    lesson = get_lesson_detail(db, project_user, slug)
    return success_response(lesson.model_dump(mode="json"))
