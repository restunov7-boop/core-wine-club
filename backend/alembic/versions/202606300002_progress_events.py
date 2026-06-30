"""progress events ledger

Revision ID: 202606300002
Revises: 202606300001
Create Date: 2026-06-30 00:00:00.000000
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "202606300002"
down_revision: str | None = "202606300001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "progress_events",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("project_id", sa.Uuid(), nullable=False),
        sa.Column("project_user_id", sa.Uuid(), nullable=False),
        sa.Column("event_type", sa.String(length=120), nullable=False),
        sa.Column("source_type", sa.String(length=80), nullable=False),
        sa.Column("source_id", sa.Uuid(), nullable=True),
        sa.Column("source_slug", sa.String(length=160), nullable=True),
        sa.Column("metadata_json", sa.JSON(), nullable=True),
        sa.Column("occurred_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["project_id"], ["projects.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["project_user_id"], ["project_users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "project_id",
            "project_user_id",
            "event_type",
            "source_type",
            "source_id",
            name="uq_progress_events_project_user_event_source",
        ),
    )
    op.create_index("ix_progress_events_project_id", "progress_events", ["project_id"])
    op.create_index("ix_progress_events_project_user_id", "progress_events", ["project_user_id"])
    op.create_index("ix_progress_events_source_id", "progress_events", ["source_id"])


def downgrade() -> None:
    op.drop_index("ix_progress_events_source_id", table_name="progress_events")
    op.drop_index("ix_progress_events_project_user_id", table_name="progress_events")
    op.drop_index("ix_progress_events_project_id", table_name="progress_events")
    op.drop_table("progress_events")
