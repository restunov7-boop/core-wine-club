from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.projects.models import Project
from app.shared.db import TimestampMixin


DISCOVERY_DIFFICULTIES = ("beginner", "curious", "confident")


class Discovery(TimestampMixin, Base):
    __tablename__ = "discoveries"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    slug: Mapped[str] = mapped_column(String(160), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    subtitle: Mapped[str | None] = mapped_column(String(255), nullable=True)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(64), nullable=False)
    difficulty: Mapped[str] = mapped_column(String(32), nullable=False)
    estimated_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    cover_image_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false", nullable=False)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, server_default="0", nullable=False)

    project: Mapped[Project] = relationship()

    __table_args__ = (
        UniqueConstraint("project_id", "slug", name="uq_discoveries_project_slug"),
        CheckConstraint(
            "difficulty in ('beginner', 'curious', 'confident')",
            name="ck_discoveries_difficulty",
        ),
    )
