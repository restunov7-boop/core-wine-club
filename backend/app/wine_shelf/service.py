from __future__ import annotations

from uuid import UUID

from sqlalchemy.orm import Session

from app.diary.models import TastingNote
from app.projects.models import ProjectUser
from app.shared.errors import NotFoundError
from app.wine_shelf.models import WineShelfItem
from app.wine_shelf.schemas import WineShelfItemCreate, WineShelfItemRead, WineShelfItemUpdate, WineShelfStatus


def _owned_shelf_query(db: Session, project_user: ProjectUser):
    return db.query(WineShelfItem).filter(
        WineShelfItem.project_id == project_user.project_id,
        WineShelfItem.project_user_id == project_user.id,
    )


def list_wine_shelf_items(
    db: Session,
    project_user: ProjectUser,
    status: WineShelfStatus | None = None,
    limit: int = 50,
    offset: int = 0,
) -> tuple[list[WineShelfItem], int]:
    query = _owned_shelf_query(db, project_user)
    if status is not None:
        query = query.filter(WineShelfItem.status == status)

    total = query.count()
    items = query.order_by(WineShelfItem.updated_at.desc(), WineShelfItem.created_at.desc()).offset(offset).limit(limit).all()
    return items, total


def get_wine_shelf_item(db: Session, project_user: ProjectUser, item_id: UUID) -> WineShelfItem:
    item = _owned_shelf_query(db, project_user).filter(WineShelfItem.id == item_id).one_or_none()
    if item is None:
        raise NotFoundError("Wine shelf item was not found")
    return item


def create_wine_shelf_item(db: Session, project_user: ProjectUser, payload: WineShelfItemCreate) -> WineShelfItem:
    data = payload.model_dump()
    _validate_diary_note_id(db, project_user, data.get("diary_note_id"))
    item = WineShelfItem(
        project_id=project_user.project_id,
        project_user_id=project_user.id,
    )
    _apply_payload(item, data)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def update_wine_shelf_item(
    db: Session,
    project_user: ProjectUser,
    item_id: UUID,
    payload: WineShelfItemUpdate,
) -> WineShelfItem:
    item = get_wine_shelf_item(db, project_user, item_id)
    data = payload.model_dump(exclude_unset=True)
    if "diary_note_id" in data:
        _validate_diary_note_id(db, project_user, data.get("diary_note_id"))

    _apply_payload(item, data)
    db.commit()
    db.refresh(item)
    return item


def delete_wine_shelf_item(db: Session, project_user: ProjectUser, item_id: UUID) -> None:
    item = get_wine_shelf_item(db, project_user, item_id)
    db.delete(item)
    db.commit()


def serialize_wine_shelf_item(item: WineShelfItem) -> WineShelfItemRead:
    return WineShelfItemRead.model_validate(item)


def _validate_diary_note_id(db: Session, project_user: ProjectUser, diary_note_id: object) -> None:
    if diary_note_id is None:
        return

    note = (
        db.query(TastingNote)
        .filter(
            TastingNote.id == diary_note_id,
            TastingNote.project_id == project_user.project_id,
            TastingNote.project_user_id == project_user.id,
            TastingNote.visibility == "private",
        )
        .one_or_none()
    )
    if note is None:
        raise NotFoundError("Diary note was not found")


def _apply_payload(item: WineShelfItem, data: dict[str, object]) -> None:
    for field, value in data.items():
        if field in {"project_id", "project_user_id"}:
            continue
        setattr(item, field, value)
