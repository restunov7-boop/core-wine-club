from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class LessonCompletionState(BaseModel):
    lesson_slug: str
    is_completed: bool
    completed_at: datetime | None = None


class LessonUncompleteState(BaseModel):
    lesson_slug: str
    is_completed: bool
    deleted: bool


class LearningProgressSummary(BaseModel):
    completed_lessons_count: int
    available_lessons_count: int
    completed_lesson_slugs: list[str]


class DiaryProgressSummary(BaseModel):
    notes_count: int
    created_note_events_count: int


class ProgressSummary(BaseModel):
    learning: LearningProgressSummary
    diary: DiaryProgressSummary


class ProgressActivityItem(BaseModel):
    id: UUID
    event_type: str
    source_type: str
    source_id: UUID | None = None
    source_slug: str | None = None
    title: str
    description: str
    occurred_at: datetime
    href: str | None = None


class ProgressActivityPreviewItem(BaseModel):
    id: UUID
    title: str
    description: str
    occurred_at: datetime
    href: str | None = None


class ProgressActivityResponse(BaseModel):
    items: list[ProgressActivityItem] = Field(default_factory=list)
