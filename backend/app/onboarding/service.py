from datetime import UTC, datetime

from sqlalchemy.orm import Session

from app.auth.service import project_user_to_read
from app.onboarding.schemas import OnboardingCompleteResponse, OnboardingData, OnboardingStatus
from app.projects.models import ProjectUser
from app.users.models import User
from app.users.schemas import UserSummary


def get_onboarding_status(project_user: ProjectUser) -> OnboardingStatus:
    data = _parse_onboarding_data(project_user.onboarding_data_json)
    return OnboardingStatus(
        is_completed=project_user.onboarding_completed_at is not None,
        completed_at=project_user.onboarding_completed_at,
        onboarding_data=data,
    )


def complete_onboarding(
    db: Session,
    user: User,
    project_user: ProjectUser,
    payload: OnboardingData,
) -> OnboardingCompleteResponse:
    data = payload.model_dump(exclude_none=True)
    project_user.onboarding_data_json = data
    if project_user.onboarding_completed_at is None:
        project_user.onboarding_completed_at = datetime.now(UTC)

    if payload.display_name:
        user.display_name = payload.display_name

    db.add(user)
    db.add(project_user)
    db.commit()
    db.refresh(user)
    db.refresh(project_user)
    db.refresh(project_user.project)

    status = get_onboarding_status(project_user)
    return OnboardingCompleteResponse(
        is_completed=status.is_completed,
        completed_at=status.completed_at,
        onboarding_data=status.onboarding_data,
        user=UserSummary.model_validate(user),
        project_user=project_user_to_read(project_user),
    )


def reset_dev_onboarding(db: Session, project_user: ProjectUser) -> OnboardingStatus:
    project_user.onboarding_completed_at = None
    project_user.onboarding_data_json = None
    db.add(project_user)
    db.commit()
    db.refresh(project_user)
    return get_onboarding_status(project_user)


def _parse_onboarding_data(value: dict | None) -> OnboardingData | None:
    if value is None:
        return None
    return OnboardingData.model_validate(value)
