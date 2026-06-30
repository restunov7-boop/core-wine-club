from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.projects.models import Project
from app.shared.db import TimestampMixin


LEARNING_DIFFICULTIES = ("beginner", "curious", "confident")
LESSON_TYPES = ("article", "guide", "ritual")


class LearningPath(TimestampMixin, Base):
    __tablename__ = "learning_paths"

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
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    difficulty: Mapped[str] = mapped_column(String(32), nullable=False)
    estimated_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    cover_image_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false", nullable=False)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, server_default="0", nullable=False)

    project: Mapped[Project] = relationship()
    path_lessons: Mapped[list[LearningPathLesson]] = relationship(back_populates="learning_path")

    __table_args__ = (
        UniqueConstraint("project_id", "slug", name="uq_learning_paths_project_slug"),
        CheckConstraint(
            "difficulty in ('beginner', 'curious', 'confident')",
            name="ck_learning_paths_difficulty",
        ),
    )


class Lesson(TimestampMixin, Base):
    __tablename__ = "lessons"

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
    lesson_type: Mapped[str] = mapped_column(String(32), nullable=False)
    difficulty: Mapped[str] = mapped_column(String(32), nullable=False)
    estimated_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    cover_image_url: Mapped[str | None] = mapped_column(String(1024), nullable=True)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false", nullable=False)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, server_default="0", nullable=False)

    project: Mapped[Project] = relationship()
    path_lessons: Mapped[list[LearningPathLesson]] = relationship(back_populates="lesson")

    __table_args__ = (
        UniqueConstraint("project_id", "slug", name="uq_lessons_project_slug"),
        CheckConstraint(
            "lesson_type in ('article', 'guide', 'ritual')",
            name="ck_lessons_lesson_type",
        ),
        CheckConstraint(
            "difficulty in ('beginner', 'curious', 'confident')",
            name="ck_lessons_difficulty",
        ),
    )


class LearningPathLesson(Base):
    __tablename__ = "learning_path_lessons"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    learning_path_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("learning_paths.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    lesson_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("lessons.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    sort_order: Mapped[int] = mapped_column(Integer, default=0, server_default="0", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    project: Mapped[Project] = relationship()
    learning_path: Mapped[LearningPath] = relationship(back_populates="path_lessons")
    lesson: Mapped[Lesson] = relationship(back_populates="path_lessons")

    __table_args__ = (
        UniqueConstraint("learning_path_id", "lesson_id", name="uq_learning_path_lessons_path_lesson"),
    )
