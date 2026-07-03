from typing import Literal
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


WineShelfStatus = Literal["want_to_try", "tried", "liked", "not_for_me", "buy_again"]


class WineShelfItemBase(BaseModel):
    diary_note_id: UUID | None = None
    wine_name: str = Field(min_length=1, max_length=255)
    country: str | None = None
    region: str | None = None
    grape: str | None = None
    style: str | None = None
    status: WineShelfStatus = "want_to_try"
    personal_note: str | None = None

    @field_validator("wine_name")
    @classmethod
    def clean_wine_name(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("wine_name is required")
        return cleaned

    @field_validator("country", "region", "grape", "style", "personal_note", mode="before")
    @classmethod
    def blank_to_none(cls, value: object) -> object:
        if isinstance(value, str):
            cleaned = value.strip()
            return cleaned or None
        return value


class WineShelfItemCreate(WineShelfItemBase):
    pass


class WineShelfItemUpdate(BaseModel):
    diary_note_id: UUID | None = None
    wine_name: str | None = Field(default=None, min_length=1, max_length=255)
    country: str | None = None
    region: str | None = None
    grape: str | None = None
    style: str | None = None
    status: WineShelfStatus | None = None
    personal_note: str | None = None

    @field_validator("wine_name")
    @classmethod
    def clean_optional_wine_name(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("wine_name cannot be blank")
        return cleaned

    @field_validator("country", "region", "grape", "style", "personal_note", mode="before")
    @classmethod
    def blank_to_none(cls, value: object) -> object:
        if isinstance(value, str):
            cleaned = value.strip()
            return cleaned or None
        return value


class WineShelfItemRead(BaseModel):
    id: UUID
    diary_note_id: UUID | None = None
    wine_name: str
    country: str | None = None
    region: str | None = None
    grape: str | None = None
    style: str | None = None
    status: str
    personal_note: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WineShelfItemListResponse(BaseModel):
    items: list[WineShelfItemRead]
    total: int


class WineShelfItemDeleteResponse(BaseModel):
    deleted: bool
