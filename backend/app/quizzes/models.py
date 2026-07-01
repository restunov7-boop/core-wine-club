from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, Integer, JSON, String, Text, UniqueConstraint, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.projects.models import Project
from app.shared.db import TimestampMixin


QUIZ_DIFFICULTIES = ("beginner", "curious", "confident")
QUIZ_QUESTION_TYPES = ("single_choice",)


class Quiz(TimestampMixin, Base):
    __tablename__ = "quizzes"

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
    is_published: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false", nullable=False)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, server_default="0", nullable=False)

    project: Mapped[Project] = relationship()
    questions: Mapped[list[QuizQuestion]] = relationship(back_populates="quiz")

    __table_args__ = (
        UniqueConstraint("project_id", "slug", name="uq_quizzes_project_slug"),
        CheckConstraint(
            "difficulty in ('beginner', 'curious', 'confident')",
            name="ck_quizzes_difficulty",
        ),
    )


class QuizQuestion(TimestampMixin, Base):
    __tablename__ = "quiz_questions"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    quiz_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("quizzes.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    slug: Mapped[str | None] = mapped_column(String(160), nullable=True)
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    question_type: Mapped[str] = mapped_column(String(32), nullable=False)
    options_json: Mapped[list[dict[str, str]]] = mapped_column(JSON, nullable=False)
    correct_option_key: Mapped[str] = mapped_column(String(80), nullable=False)
    explanation: Mapped[str | None] = mapped_column(Text, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, server_default="0", nullable=False)

    project: Mapped[Project] = relationship()
    quiz: Mapped[Quiz] = relationship(back_populates="questions")

    __table_args__ = (
        CheckConstraint("question_type in ('single_choice')", name="ck_quiz_questions_question_type"),
    )
