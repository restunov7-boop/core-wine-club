from datetime import date, datetime, time, timezone
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


WineColor = Literal["red", "white", "rose", "sparkling", "orange", "dessert", "unknown"]
Sweetness = Literal["dry", "semi_dry", "semi_sweet", "sweet", "unknown"]


def normalize_tasted_at(value: date | datetime | None) -> datetime | None:
    if value is None:
        return None
    if isinstance(value, datetime):
        return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
    return datetime.combine(value, time.min, tzinfo=timezone.utc)


class TastingNoteBase(BaseModel):
    wine_name: str = Field(min_length=1, max_length=255)
    producer: str | None = None
    country: str | None = None
    region: str | None = None
    grape: str | None = None
    vintage: int | None = None
    wine_color: WineColor | None = None
    sweetness: Sweetness | None = None
    rating: int | None = Field(default=None, ge=1, le=5)
    occasion: str | None = None
    price_text: str | None = None
    tasted_at: date | datetime | None = None
    aroma_notes: list[str] | None = None
    taste_notes: list[str] | None = None
    pairing: str | None = None
    personal_note: str | None = None
    would_buy_again: bool | None = None

    @field_validator("wine_name")
    @classmethod
    def clean_wine_name(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("wine_name is required")
        return cleaned

    @field_validator(
        "producer",
        "country",
        "region",
        "grape",
        "occasion",
        "price_text",
        "pairing",
        "personal_note",
        mode="before",
    )
    @classmethod
    def blank_to_none(cls, value: object) -> object:
        if isinstance(value, str):
            cleaned = value.strip()
            return cleaned or None
        return value

    @field_validator("aroma_notes", "taste_notes")
    @classmethod
    def clean_notes(cls, value: list[str] | None) -> list[str] | None:
        if value is None:
            return None
        cleaned = [item.strip() for item in value if item.strip()]
        return cleaned or None


class TastingNoteCreate(TastingNoteBase):
    pass


class TastingNoteUpdate(BaseModel):
    wine_name: str | None = Field(default=None, min_length=1, max_length=255)
    producer: str | None = None
    country: str | None = None
    region: str | None = None
    grape: str | None = None
    vintage: int | None = None
    wine_color: WineColor | None = None
    sweetness: Sweetness | None = None
    rating: int | None = Field(default=None, ge=1, le=5)
    occasion: str | None = None
    price_text: str | None = None
    tasted_at: date | datetime | None = None
    aroma_notes: list[str] | None = None
    taste_notes: list[str] | None = None
    pairing: str | None = None
    personal_note: str | None = None
    would_buy_again: bool | None = None
    visibility: Literal["private"] | None = None

    @field_validator("wine_name")
    @classmethod
    def clean_optional_wine_name(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("wine_name cannot be blank")
        return cleaned

    @field_validator(
        "producer",
        "country",
        "region",
        "grape",
        "occasion",
        "price_text",
        "pairing",
        "personal_note",
        mode="before",
    )
    @classmethod
    def blank_to_none(cls, value: object) -> object:
        if isinstance(value, str):
            cleaned = value.strip()
            return cleaned or None
        return value

    @field_validator("aroma_notes", "taste_notes")
    @classmethod
    def clean_notes(cls, value: list[str] | None) -> list[str] | None:
        if value is None:
            return None
        cleaned = [item.strip() for item in value if item.strip()]
        return cleaned or None


class TastingNoteListItem(BaseModel):
    id: UUID
    wine_name: str
    producer: str | None = None
    country: str | None = None
    region: str | None = None
    wine_color: str | None = None
    rating: int | None = None
    tasted_at: datetime | None = None
    would_buy_again: bool | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TastingNoteDetail(TastingNoteListItem):
    grape: str | None = None
    vintage: int | None = None
    sweetness: str | None = None
    occasion: str | None = None
    price_text: str | None = None
    aroma_notes: list[str] | None = None
    taste_notes: list[str] | None = None
    pairing: str | None = None
    personal_note: str | None = None
    visibility: str
    updated_at: datetime


class TastingNoteListResponse(BaseModel):
    items: list[TastingNoteListItem]
    total: int


class TastingNoteDeleteResponse(BaseModel):
    deleted: bool
