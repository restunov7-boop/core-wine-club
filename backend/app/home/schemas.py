from datetime import datetime
from typing import TypeAlias

from pydantic import BaseModel, Field

HomeStatValue: TypeAlias = int | float | None


class HomeProject(BaseModel):
    slug: str
    name: str


class HomeUser(BaseModel):
    display_name: str | None


class HomeHero(BaseModel):
    title: str
    subtitle: str


class HomeSectionItem(BaseModel):
    id: str | None = None
    slug: str | None = None
    title: str
    description: str | None = None
    href: str | None = None
    occurred_at: datetime | None = None
    estimated_minutes: int | None = None
    lessons_count: int | None = None
    completed_lessons_count: int | None = None


class HomeSection(BaseModel):
    key: str
    title: str
    description: str
    href: str | None = None
    items: list[HomeSectionItem] = Field(default_factory=list)
    stats: dict[str, HomeStatValue] = Field(default_factory=dict)


class HomeResponse(BaseModel):
    project: HomeProject
    user: HomeUser
    onboarding_completed: bool
    hero: HomeHero
    sections: list[HomeSection]
