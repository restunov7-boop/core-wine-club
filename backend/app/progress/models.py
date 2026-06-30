from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, JSON, String, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.projects.models import Project, ProjectUser
from app.shared.db import TimestampMixin


class ProgressEvent(TimestampMixin, Base):
    __tablename__ = "progress_events"

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
    event_type: Mapped[str] = mapped_column(String(120), nullable=False)
    source_type: Mapped[str] = mapped_column(String(80), nullable=False)
    source_id: Mapped[uuid.UUID | None] = mapped_column(Uuid(as_uuid=True), nullable=True, index=True)
    source_slug: Mapped[str | None] = mapped_column(String(160), nullable=True)
    metadata_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    project: Mapped[Project] = relationship()
    project_user: Mapped[ProjectUser] = relationship()

    __table_args__ = (
        UniqueConstraint(
            "project_id",
            "project_user_id",
            "event_type",
            "source_type",
            "source_id",
            name="uq_progress_events_project_user_event_source",
        ),
    )
