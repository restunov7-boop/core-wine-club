from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.permissions.dependencies import require_capability
from app.projects.models import ProjectUser
from app.shared.responses import success_response
from app.wine_shelf.schemas import (
    WineShelfItemCreate,
    WineShelfItemDeleteResponse,
    WineShelfItemListResponse,
    WineShelfItemUpdate,
    WineShelfStatus,
)
from app.wine_shelf.service import (
    create_wine_shelf_item,
    delete_wine_shelf_item,
    get_wine_shelf_item,
    list_wine_shelf_items,
    serialize_wine_shelf_item,
    update_wine_shelf_item,
)

router = APIRouter(prefix="/wine-shelf/items", tags=["wine-shelf"])


@router.get("")
def get_items(
    db: Annotated[Session, Depends(get_db)],
    project_user: Annotated[ProjectUser, Depends(require_capability("view_app"))],
    status: WineShelfStatus | None = None,
    limit: Annotated[int, Query(ge=1, le=100)] = 50,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> dict[str, object]:
    items, total = list_wine_shelf_items(db, project_user, status=status, limit=limit, offset=offset)
    payload = WineShelfItemListResponse(
        items=[serialize_wine_shelf_item(item) for item in items],
        total=total,
    )
    return success_response(payload.model_dump(mode="json"))


@router.post("")
def post_item(
    payload: WineShelfItemCreate,
    db: Annotated[Session, Depends(get_db)],
    project_user: Annotated[ProjectUser, Depends(require_capability("view_app"))],
) -> dict[str, object]:
    item = create_wine_shelf_item(db, project_user, payload)
    return success_response(serialize_wine_shelf_item(item).model_dump(mode="json"))


@router.get("/{item_id}")
def get_item(
    item_id: UUID,
    db: Annotated[Session, Depends(get_db)],
    project_user: Annotated[ProjectUser, Depends(require_capability("view_app"))],
) -> dict[str, object]:
    item = get_wine_shelf_item(db, project_user, item_id)
    return success_response(serialize_wine_shelf_item(item).model_dump(mode="json"))


@router.patch("/{item_id}")
def patch_item(
    item_id: UUID,
    payload: WineShelfItemUpdate,
    db: Annotated[Session, Depends(get_db)],
    project_user: Annotated[ProjectUser, Depends(require_capability("view_app"))],
) -> dict[str, object]:
    item = update_wine_shelf_item(db, project_user, item_id, payload)
    return success_response(serialize_wine_shelf_item(item).model_dump(mode="json"))


@router.delete("/{item_id}")
def delete_item(
    item_id: UUID,
    db: Annotated[Session, Depends(get_db)],
    project_user: Annotated[ProjectUser, Depends(require_capability("view_app"))],
) -> dict[str, object]:
    delete_wine_shelf_item(db, project_user, item_id)
    return success_response(WineShelfItemDeleteResponse(deleted=True).model_dump(mode="json"))
