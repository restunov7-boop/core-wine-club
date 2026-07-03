from __future__ import annotations

import uuid

from sqlalchemy import CheckConstraint, ForeignKey, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.diary.models import TastingNote
from app.projects.models import Project, ProjectUser
from app.shared.db import TimestampMixin


WINE_SHELF_STATUSES = ("want_to_try", "tried", "liked", "not_for_me", "buy_again")


class WineShelfItem(TimestampMixin, Base):
    __tablename__ = "wine_shelf_items"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    project_user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("project_users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    diary_note_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("tasting_notes.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    wine_name: Mapped[str] = mapped_column(String(255), nullable=False)
    country: Mapped[str | None] = mapped_column(String(120), nullable=True)
    region: Mapped[str | None] = mapped_column(String(160), nullable=True)
    grape: Mapped[str | None] = mapped_column(String(160), nullable=True)
    style: Mapped[str | None] = mapped_column(String(80), nullable=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    personal_note: Mapped[str | None] = mapped_column(Text, nullable=True)

    project: Mapped[Project] = relationship()
    project_user: Mapped[ProjectUser] = relationship()
    diary_note: Mapped[TastingNote | None] = relationship()

    __table_args__ = (
        CheckConstraint(
            "status in ('want_to_try', 'tried', 'liked', 'not_for_me', 'buy_again')",
            name="ck_wine_shelf_items_status",
        ),
    )
