from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.diary.schemas import TastingNoteCreate, TastingNoteDeleteResponse, TastingNoteListResponse, TastingNoteUpdate
from app.diary.service import (
    create_tasting_note,
    delete_tasting_note,
    get_tasting_note,
    list_tasting_notes,
    serialize_detail,
    serialize_list_item,
    update_tasting_note,
)
from app.permissions.dependencies import require_capability
from app.projects.models import ProjectUser
from app.shared.responses import success_response

router = APIRouter(prefix="/diary/notes", tags=["diary"])


@router.get("")
def get_notes(
    db: Annotated[Session, Depends(get_db)],
    project_user: Annotated[ProjectUser, Depends(require_capability("view_app"))],
    limit: Annotated[int, Query(ge=1, le=50)] = 20,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> dict[str, object]:
    items, total = list_tasting_notes(db, project_user, limit=limit, offset=offset)
    payload = TastingNoteListResponse(
        items=[serialize_list_item(item) for item in items],
        total=total,
    )
    return success_response(payload.model_dump(mode="json"))


@router.post("")
def post_note(
    payload: TastingNoteCreate,
    db: Annotated[Session, Depends(get_db)],
    project_user: Annotated[ProjectUser, Depends(require_capability("view_app"))],
) -> dict[str, object]:
    note = create_tasting_note(db, project_user, payload)
    return success_response(serialize_detail(note).model_dump(mode="json"))


@router.get("/{note_id}")
def get_note(
    note_id: UUID,
    db: Annotated[Session, Depends(get_db)],
    project_user: Annotated[ProjectUser, Depends(require_capability("view_app"))],
) -> dict[str, object]:
    note = get_tasting_note(db, project_user, note_id)
    return success_response(serialize_detail(note).model_dump(mode="json"))


@router.patch("/{note_id}")
def patch_note(
    note_id: UUID,
    payload: TastingNoteUpdate,
    db: Annotated[Session, Depends(get_db)],
    project_user: Annotated[ProjectUser, Depends(require_capability("view_app"))],
) -> dict[str, object]:
    note = update_tasting_note(db, project_user, note_id, payload)
    return success_response(serialize_detail(note).model_dump(mode="json"))


@router.delete("/{note_id}")
def delete_note(
    note_id: UUID,
    db: Annotated[Session, Depends(get_db)],
    project_user: Annotated[ProjectUser, Depends(require_capability("view_app"))],
) -> dict[str, object]:
    delete_tasting_note(db, project_user, note_id)
    return success_response(TastingNoteDeleteResponse(deleted=True).model_dump(mode="json"))
