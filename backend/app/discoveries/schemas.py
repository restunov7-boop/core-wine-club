from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict


DiscoveryDifficulty = Literal["beginner", "curious", "confident"]
DiscoveryCategory = Literal["basics", "taste", "ritual", "pairing", "culture"]


class DiscoveryListItem(BaseModel):
    id: UUID
    slug: str
    title: str
    subtitle: str | None = None
    summary: str
    category: str
    difficulty: str
    estimated_minutes: int | None = None
    cover_image_url: str | None = None

    model_config = ConfigDict(from_attributes=True)


class DiscoveryDetail(DiscoveryListItem):
    body: str
    published_at: datetime | None = None


class DiscoveryPreview(BaseModel):
    slug: str
    title: str
    estimated_minutes: int | None = None

    model_config = ConfigDict(from_attributes=True)
