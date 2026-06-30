from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, Integer, JSON, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.projects.models import Project, ProjectUser
from app.shared.db import TimestampMixin


WINE_COLORS = ("red", "white", "rose", "sparkling", "orange", "dessert", "unknown")
SWEETNESS_LEVELS = ("dry", "semi_dry", "semi_sweet", "sweet", "unknown")


class TastingNote(TimestampMixin, Base):
    __tablename__ = "tasting_notes"

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
    wine_name: Mapped[str] = mapped_column(String(255), nullable=False)
    producer: Mapped[str | None] = mapped_column(String(255), nullable=True)
    country: Mapped[str | None] = mapped_column(String(120), nullable=True)
    region: Mapped[str | None] = mapped_column(String(160), nullable=True)
    grape: Mapped[str | None] = mapped_column(String(160), nullable=True)
    vintage: Mapped[int | None] = mapped_column(Integer, nullable=True)
    wine_color: Mapped[str | None] = mapped_column(String(32), nullable=True)
    sweetness: Mapped[str | None] = mapped_column(String(32), nullable=True)
    rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    occasion: Mapped[str | None] = mapped_column(String(255), nullable=True)
    price_text: Mapped[str | None] = mapped_column(String(120), nullable=True)
    tasted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    aroma_notes_json: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    taste_notes_json: Mapped[list[str] | None] = mapped_column(JSON, nullable=True)
    pairing: Mapped[str | None] = mapped_column(String(255), nullable=True)
    personal_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    would_buy_again: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    visibility: Mapped[str] = mapped_column(String(32), default="private", server_default="private", nullable=False)

    project: Mapped[Project] = relationship()
    project_user: Mapped[ProjectUser] = relationship()

    __table_args__ = (
        CheckConstraint(
            "wine_color is null or wine_color in ('red', 'white', 'rose', 'sparkling', 'orange', 'dessert', 'unknown')",
            name="ck_tasting_notes_wine_color",
        ),
        CheckConstraint(
            "sweetness is null or sweetness in ('dry', 'semi_dry', 'semi_sweet', 'sweet', 'unknown')",
            name="ck_tasting_notes_sweetness",
        ),
        CheckConstraint("rating is null or (rating >= 1 and rating <= 5)", name="ck_tasting_notes_rating"),
        CheckConstraint("visibility = 'private'", name="ck_tasting_notes_visibility_private"),
    )
