"""tasting diary foundation

Revision ID: 202606290004
Revises: 202606290003
Create Date: 2026-06-29 00:00:00.000000
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "202606290004"
down_revision: str | None = "202606290003"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "tasting_notes",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("project_id", sa.Uuid(), nullable=False),
        sa.Column("project_user_id", sa.Uuid(), nullable=False),
        sa.Column("wine_name", sa.String(length=255), nullable=False),
        sa.Column("producer", sa.String(length=255), nullable=True),
        sa.Column("country", sa.String(length=120), nullable=True),
        sa.Column("region", sa.String(length=160), nullable=True),
        sa.Column("grape", sa.String(length=160), nullable=True),
        sa.Column("vintage", sa.Integer(), nullable=True),
        sa.Column("wine_color", sa.String(length=32), nullable=True),
        sa.Column("sweetness", sa.String(length=32), nullable=True),
        sa.Column("rating", sa.Integer(), nullable=True),
        sa.Column("occasion", sa.String(length=255), nullable=True),
        sa.Column("price_text", sa.String(length=120), nullable=True),
        sa.Column("tasted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("aroma_notes_json", sa.JSON(), nullable=True),
        sa.Column("taste_notes_json", sa.JSON(), nullable=True),
        sa.Column("pairing", sa.String(length=255), nullable=True),
        sa.Column("personal_note", sa.Text(), nullable=True),
        sa.Column("would_buy_again", sa.Boolean(), nullable=True),
        sa.Column("visibility", sa.String(length=32), server_default="private", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint(
            "wine_color is null or wine_color in ('red', 'white', 'rose', 'sparkling', 'orange', 'dessert', 'unknown')",
            name="ck_tasting_notes_wine_color",
        ),
        sa.CheckConstraint(
            "sweetness is null or sweetness in ('dry', 'semi_dry', 'semi_sweet', 'sweet', 'unknown')",
            name="ck_tasting_notes_sweetness",
        ),
        sa.CheckConstraint("rating is null or (rating >= 1 and rating <= 5)", name="ck_tasting_notes_rating"),
        sa.CheckConstraint("visibility = 'private'", name="ck_tasting_notes_visibility_private"),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["project_user_id"], ["project_users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_tasting_notes_project_id", "tasting_notes", ["project_id"])
    op.create_index("ix_tasting_notes_project_user_id", "tasting_notes", ["project_user_id"])


def downgrade() -> None:
    op.drop_index("ix_tasting_notes_project_user_id", table_name="tasting_notes")
    op.drop_index("ix_tasting_notes_project_id", table_name="tasting_notes")
    op.drop_table("tasting_notes")
