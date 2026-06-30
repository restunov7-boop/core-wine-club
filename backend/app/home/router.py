from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.home.service import build_home_response
from app.permissions.dependencies import require_auth, require_capability
from app.projects.models import ProjectUser
from app.shared.responses import success_response
from app.users.models import User

router = APIRouter(prefix="/home", tags=["home"])


@router.get("")
def get_home(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_auth)],
    project_user: Annotated[ProjectUser, Depends(require_capability("view_app"))],
) -> dict[str, object]:
    return success_response(build_home_response(db, user, project_user).model_dump(mode="json"))
