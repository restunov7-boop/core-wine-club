"""learning foundation

Revision ID: 202606300001
Revises: 202606290004
Create Date: 2026-06-30 00:00:00.000000
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "202606300001"
down_revision: str | None = "202606290004"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "learning_paths",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("project_id", sa.Uuid(), nullable=False),
        sa.Column("slug", sa.String(length=160), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("subtitle", sa.String(length=255), nullable=True),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("difficulty", sa.String(length=32), nullable=False),
        sa.Column("estimated_minutes", sa.Integer(), nullable=True),
        sa.Column("cover_image_url", sa.String(length=1024), nullable=True),
        sa.Column("is_published", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("sort_order", sa.Integer(), server_default="0", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint(
            "difficulty in ('beginner', 'curious', 'confident')",
            name="ck_learning_paths_difficulty",
        ),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("project_id", "slug", name="uq_learning_paths_project_slug"),
    )
    op.create_index("ix_learning_paths_project_id", "learning_paths", ["project_id"])

    op.create_table(
        "lessons",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("project_id", sa.Uuid(), nullable=False),
        sa.Column("slug", sa.String(length=160), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("subtitle", sa.String(length=255), nullable=True),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("lesson_type", sa.String(length=32), nullable=False),
        sa.Column("difficulty", sa.String(length=32), nullable=False),
        sa.Column("estimated_minutes", sa.Integer(), nullable=True),
        sa.Column("cover_image_url", sa.String(length=1024), nullable=True),
        sa.Column("is_published", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("sort_order", sa.Integer(), server_default="0", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint("lesson_type in ('article', 'guide', 'ritual')", name="ck_lessons_lesson_type"),
        sa.CheckConstraint(
            "difficulty in ('beginner', 'curious', 'confident')",
            name="ck_lessons_difficulty",
        ),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("project_id", "slug", name="uq_lessons_project_slug"),
    )
    op.create_index("ix_lessons_project_id", "lessons", ["project_id"])

    op.create_table(
        "learning_path_lessons",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("project_id", sa.Uuid(), nullable=False),
        sa.Column("learning_path_id", sa.Uuid(), nullable=False),
        sa.Column("lesson_id", sa.Uuid(), nullable=False),
        sa.Column("sort_order", sa.Integer(), server_default="0", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["learning_path_id"], ["learning_paths.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["lesson_id"], ["lessons.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("learning_path_id", "lesson_id", name="uq_learning_path_lessons_path_lesson"),
    )
    op.create_index("ix_learning_path_lessons_project_id", "learning_path_lessons", ["project_id"])
    op.create_index("ix_learning_path_lessons_learning_path_id", "learning_path_lessons", ["learning_path_id"])
    op.create_index("ix_learning_path_lessons_lesson_id", "learning_path_lessons", ["lesson_id"])


def downgrade() -> None:
    op.drop_index("ix_learning_path_lessons_lesson_id", table_name="learning_path_lessons")
    op.drop_index("ix_learning_path_lessons_learning_path_id", table_name="learning_path_lessons")
    op.drop_index("ix_learning_path_lessons_project_id", table_name="learning_path_lessons")
    op.drop_table("learning_path_lessons")
    op.drop_index("ix_lessons_project_id", table_name="lessons")
    op.drop_table("lessons")
    op.drop_index("ix_learning_paths_project_id", table_name="learning_paths")
    op.drop_table("learning_paths")
