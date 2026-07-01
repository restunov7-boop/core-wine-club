from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.my_path.service import build_my_path
from app.permissions.dependencies import require_capability
from app.projects.models import ProjectUser
from app.shared.responses import success_response

router = APIRouter(prefix="/my-path", tags=["my-path"])


@router.get("")
def get_my_path(
    db: Annotated[Session, Depends(get_db)],
    project_user: Annotated[ProjectUser, Depends(require_capability("view_app"))],
) -> dict[str, object]:
    my_path = build_my_path(db, project_user)
    return success_response(my_path.model_dump(mode="json"))
