from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.onboarding.schemas import OnboardingData
from app.onboarding.service import complete_onboarding, get_onboarding_status, reset_dev_onboarding
from app.permissions.dependencies import require_auth, require_project_user
from app.projects.models import ProjectUser
from app.shared.errors import PermissionDeniedError
from app.shared.responses import success_response
from app.users.models import User

router = APIRouter(prefix="/onboarding", tags=["onboarding"])


@router.get("/status")
def onboarding_status(
    project_user: Annotated[ProjectUser, Depends(require_project_user)],
) -> dict[str, object]:
    return success_response(get_onboarding_status(project_user).model_dump(mode="json"))


@router.post("/complete")
def complete(
    payload: OnboardingData,
    user: Annotated[User, Depends(require_auth)],
    project_user: Annotated[ProjectUser, Depends(require_project_user)],
    db: Annotated[Session, Depends(get_db)],
) -> dict[str, object]:
    result = complete_onboarding(db, user, project_user, payload)
    return success_response(result.model_dump(mode="json"))


@router.post("/reset-dev")
def reset_dev(
    project_user: Annotated[ProjectUser, Depends(require_project_user)],
    db: Annotated[Session, Depends(get_db)],
) -> dict[str, object]:
    if not settings.dev_auth_enabled:
        raise PermissionDeniedError("Development onboarding reset is disabled")

    return success_response(reset_dev_onboarding(db, project_user).model_dump(mode="json"))
