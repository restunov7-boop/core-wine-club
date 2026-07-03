"""wine shelf foundation

Revision ID: 202607030001
Revises: 202607010001
Create Date: 2026-07-03 00:00:00.000000
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "202607030001"
down_revision: str | None = "202607010001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "wine_shelf_items",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("project_id", sa.Uuid(), nullable=False),
        sa.Column("project_user_id", sa.Uuid(), nullable=False),
        sa.Column("diary_note_id", sa.Uuid(), nullable=True),
        sa.Column("wine_name", sa.String(length=255), nullable=False),
        sa.Column("country", sa.String(length=120), nullable=True),
        sa.Column("region", sa.String(length=160), nullable=True),
        sa.Column("grape", sa.String(length=160), nullable=True),
        sa.Column("style", sa.String(length=80), nullable=True),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("personal_note", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint(
            "status in ('want_to_try', 'tried', 'liked', 'not_for_me', 'buy_again')",
            name="ck_wine_shelf_items_status",
        ),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["project_user_id"], ["project_users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["diary_note_id"], ["tasting_notes.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_wine_shelf_items_project_id", "wine_shelf_items", ["project_id"])
    op.create_index("ix_wine_shelf_items_project_user_id", "wine_shelf_items", ["project_user_id"])
    op.create_index("ix_wine_shelf_items_diary_note_id", "wine_shelf_items", ["diary_note_id"])
    op.create_index("ix_wine_shelf_items_status", "wine_shelf_items", ["status"])


def downgrade() -> None:
    op.drop_index("ix_wine_shelf_items_status", table_name="wine_shelf_items")
    op.drop_index("ix_wine_shelf_items_diary_note_id", table_name="wine_shelf_items")
    op.drop_index("ix_wine_shelf_items_project_user_id", table_name="wine_shelf_items")
    op.drop_index("ix_wine_shelf_items_project_id", table_name="wine_shelf_items")
    op.drop_table("wine_shelf_items")
