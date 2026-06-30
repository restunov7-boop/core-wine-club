from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.discoveries.schemas import DiscoveryCategory, DiscoveryDetail, DiscoveryDifficulty, DiscoveryListItem
from app.discoveries.service import get_published_discovery_by_slug, list_published_discoveries
from app.permissions.dependencies import require_capability
from app.projects.models import ProjectUser
from app.shared.responses import success_response

router = APIRouter(prefix="/discoveries", tags=["discoveries"])


@router.get("")
def get_discoveries(
    db: Annotated[Session, Depends(get_db)],
    project_user: Annotated[ProjectUser, Depends(require_capability("view_app"))],
    category: Annotated[DiscoveryCategory | None, Query()] = None,
    difficulty: Annotated[DiscoveryDifficulty | None, Query()] = None,
) -> dict[str, object]:
    items = list_published_discoveries(db, project_user, category=category, difficulty=difficulty)
    return success_response({"items": [DiscoveryListItem.model_validate(item).model_dump(mode="json") for item in items]})


@router.get("/{slug}")
def get_discovery(
    slug: str,
    db: Annotated[Session, Depends(get_db)],
    project_user: Annotated[ProjectUser, Depends(require_capability("view_app"))],
) -> dict[str, object]:
    discovery = get_published_discovery_by_slug(db, project_user, slug)
    return success_response(DiscoveryDetail.model_validate(discovery).model_dump(mode="json"))
