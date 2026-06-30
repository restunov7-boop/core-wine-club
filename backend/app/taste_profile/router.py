from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.permissions.dependencies import require_capability
from app.projects.models import ProjectUser
from app.shared.responses import success_response
from app.taste_profile.service import build_taste_profile

router = APIRouter(prefix="/taste-profile", tags=["taste-profile"])


@router.get("")
def get_taste_profile(
    db: Annotated[Session, Depends(get_db)],
    project_user: Annotated[ProjectUser, Depends(require_capability("view_app"))],
) -> dict[str, object]:
    return success_response(build_taste_profile(db, project_user).model_dump(mode="json"))
