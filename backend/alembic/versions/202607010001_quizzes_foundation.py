"""quizzes foundation

Revision ID: 202607010001
Revises: 202606300002
Create Date: 2026-07-01 00:00:00.000000
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "202607010001"
down_revision: str | None = "202606300002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "quizzes",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("project_id", sa.Uuid(), nullable=False),
        sa.Column("slug", sa.String(length=160), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("subtitle", sa.String(length=255), nullable=True),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("difficulty", sa.String(length=32), nullable=False),
        sa.Column("estimated_minutes", sa.Integer(), nullable=True),
        sa.Column("is_published", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("sort_order", sa.Integer(), server_default="0", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint(
            "difficulty in ('beginner', 'curious', 'confident')",
            name="ck_quizzes_difficulty",
        ),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("project_id", "slug", name="uq_quizzes_project_slug"),
    )
    op.create_index("ix_quizzes_project_id", "quizzes", ["project_id"])

    op.create_table(
        "quiz_questions",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("project_id", sa.Uuid(), nullable=False),
        sa.Column("quiz_id", sa.Uuid(), nullable=False),
        sa.Column("slug", sa.String(length=160), nullable=True),
        sa.Column("prompt", sa.Text(), nullable=False),
        sa.Column("question_type", sa.String(length=32), nullable=False),
        sa.Column("options_json", sa.JSON(), nullable=False),
        sa.Column("correct_option_key", sa.String(length=80), nullable=False),
        sa.Column("explanation", sa.Text(), nullable=True),
        sa.Column("sort_order", sa.Integer(), server_default="0", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("question_type in ('single_choice')", name="ck_quiz_questions_question_type"),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["quiz_id"], ["quizzes.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_quiz_questions_project_id", "quiz_questions", ["project_id"])
    op.create_index("ix_quiz_questions_quiz_id", "quiz_questions", ["quiz_id"])


def downgrade() -> None:
    op.drop_index("ix_quiz_questions_quiz_id", table_name="quiz_questions")
    op.drop_index("ix_quiz_questions_project_id", table_name="quiz_questions")
    op.drop_table("quiz_questions")
    op.drop_index("ix_quizzes_project_id", table_name="quizzes")
    op.drop_table("quizzes")
