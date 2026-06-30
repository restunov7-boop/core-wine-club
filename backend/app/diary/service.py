from __future__ import annotations

from uuid import UUID

from sqlalchemy.orm import Session

from app.diary.models import TastingNote
from app.diary.schemas import TastingNoteCreate, TastingNoteDetail, TastingNoteListItem, TastingNoteUpdate, normalize_tasted_at
from app.projects.models import ProjectUser
from app.shared.errors import NotFoundError


def _owned_notes_query(db: Session, project_user: ProjectUser):
    return db.query(TastingNote).filter(
        TastingNote.project_id == project_user.project_id,
        TastingNote.project_user_id == project_user.id,
        TastingNote.visibility == "private",
    )


def count_tasting_notes(db: Session, project_user: ProjectUser) -> int:
    return _owned_notes_query(db, project_user).count()


def list_tasting_notes(
    db: Session,
    project_user: ProjectUser,
    limit: int = 20,
    offset: int = 0,
) -> tuple[list[TastingNote], int]:
    query = _owned_notes_query(db, project_user)
    total = query.count()
    items = query.order_by(TastingNote.tasted_at.desc(), TastingNote.created_at.desc()).offset(offset).limit(limit).all()
    return items, total


def get_tasting_note(db: Session, project_user: ProjectUser, note_id: UUID) -> TastingNote:
    note = _owned_notes_query(db, project_user).filter(TastingNote.id == note_id).one_or_none()
    if note is None:
        raise NotFoundError("Tasting note was not found")
    return note


def create_tasting_note(db: Session, project_user: ProjectUser, payload: TastingNoteCreate) -> TastingNote:
    note = TastingNote(
        project_id=project_user.project_id,
        project_user_id=project_user.id,
        visibility="private",
    )
    _apply_payload(note, payload.model_dump(exclude_unset=True))
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


def update_tasting_note(
    db: Session,
    project_user: ProjectUser,
    note_id: UUID,
    payload: TastingNoteUpdate,
) -> TastingNote:
    note = get_tasting_note(db, project_user, note_id)
    data = payload.model_dump(exclude_unset=True)
    data.pop("visibility", None)
    _apply_payload(note, data)
    note.visibility = "private"
    db.commit()
    db.refresh(note)
    return note


def delete_tasting_note(db: Session, project_user: ProjectUser, note_id: UUID) -> None:
    note = get_tasting_note(db, project_user, note_id)
    db.delete(note)
    db.commit()


def serialize_detail(note: TastingNote) -> TastingNoteDetail:
    return TastingNoteDetail.model_validate(_note_payload(note))


def serialize_list_item(note: TastingNote) -> TastingNoteListItem:
    return TastingNoteListItem.model_validate(note)


def _apply_payload(note: TastingNote, data: dict[str, object]) -> None:
    if "aroma_notes" in data:
        note.aroma_notes_json = data.pop("aroma_notes")  # type: ignore[assignment]
    if "taste_notes" in data:
        note.taste_notes_json = data.pop("taste_notes")  # type: ignore[assignment]
    if "tasted_at" in data:
        note.tasted_at = normalize_tasted_at(data.pop("tasted_at"))  # type: ignore[arg-type]

    for field, value in data.items():
        if field in {"project_id", "project_user_id", "visibility"}:
            continue
        setattr(note, field, value)


def _note_payload(note: TastingNote) -> dict[str, object]:
    return {
        "id": note.id,
        "wine_name": note.wine_name,
        "producer": note.producer,
        "country": note.country,
        "region": note.region,
        "grape": note.grape,
        "vintage": note.vintage,
        "wine_color": note.wine_color,
        "sweetness": note.sweetness,
        "rating": note.rating,
        "occasion": note.occasion,
        "price_text": note.price_text,
        "tasted_at": note.tasted_at,
        "aroma_notes": note.aroma_notes_json,
        "taste_notes": note.taste_notes_json,
        "pairing": note.pairing,
        "personal_note": note.personal_note,
        "would_buy_again": note.would_buy_again,
        "visibility": note.visibility,
        "created_at": note.created_at,
        "updated_at": note.updated_at,
    }
