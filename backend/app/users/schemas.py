from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class UserRead(BaseModel):
    id: UUID
    display_name: str | None = None
    avatar_url: str | None = None
    locale: str | None = None
    timezone: str | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserSummary(BaseModel):
    id: UUID
    display_name: str | None = None
    avatar_url: str | None = None

    model_config = ConfigDict(from_attributes=True)
