"""onboarding home foundation

Revision ID: 202606290002
Revises: 202606290001
Create Date: 2026-06-29 00:00:00.000000
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "202606290002"
down_revision: str | None = "202606290001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("project_users", sa.Column("onboarding_data_json", sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column("project_users", "onboarding_data_json")
