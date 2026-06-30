from collections.abc import Callable
from typing import Annotated

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.auth.jwt import decode_access_token
from app.auth.service import user_id_from_token_payload
from app.database import get_db
from app.permissions.service import has_capability
from app.projects.models import ProjectUser
from app.projects.service import ensure_default_project, get_project_user
from app.shared.errors import AuthenticationError, PermissionDeniedError
from app.users.models import User
from app.users.service import get_user_by_id

security = HTTPBearer(auto_error=False)


def require_auth(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise AuthenticationError("Bearer token is required")

    payload = decode_access_token(credentials.credentials)
    user = get_user_by_id(db, user_id_from_token_payload(payload))
    if user is None or not user.is_active:
        raise AuthenticationError("Authenticated user was not found")
    return user


def require_project_user(
    user: Annotated[User, Depends(require_auth)],
    db: Annotated[Session, Depends(get_db)],
) -> ProjectUser:
    project = ensure_default_project(db)
    project_user = get_project_user(db, user, project)
    if project_user is None or project_user.status != "active":
        raise PermissionDeniedError("Active project access is required")
    return project_user


def require_capability(capability: str) -> Callable:
    def dependency(project_user=Depends(require_project_user)):
        if not has_capability(project_user.role, capability):
            raise PermissionDeniedError("Required capability is missing", details={"capability": capability})
        return project_user

    return dependency
