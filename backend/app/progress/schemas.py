from datetime import datetime

from pydantic import BaseModel


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
