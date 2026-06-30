from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.bottle.service import build_bottle_progress
from app.database import get_db
from app.permissions.dependencies import require_capability
from app.projects.models import ProjectUser
from app.shared.responses import success_response

router = APIRouter(prefix="/bottle", tags=["bottle"])


@router.get("/progress")
def get_bottle_progress(
    db: Annotated[Session, Depends(get_db)],
    project_user: Annotated[ProjectUser, Depends(require_capability("view_app"))],
) -> dict[str, object]:
    progress = build_bottle_progress(db, project_user)
    return success_response(progress.model_dump(mode="json"))
