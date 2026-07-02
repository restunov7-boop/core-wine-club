from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


LearningDifficulty = Literal["beginner", "curious", "confident"]
LessonType = Literal["article", "guide", "ritual"]


class LearningPathListItem(BaseModel):
    id: UUID
    slug: str
    title: str
    subtitle: str | None = None
    summary: str
    difficulty: str
    estimated_minutes: int | None = None
    cover_image_url: str | None = None
    lessons_count: int
    completed_lessons_count: int
    recommended_quizzes_count: int = 0
    completed_recommended_quizzes_count: int = 0


class LearningRecommendedQuiz(BaseModel):
    slug: str
    title: str
    subtitle: str | None = None
    summary: str
    difficulty: str
    estimated_minutes: int | None = None
    questions_count: int
    is_completed: bool
    completed_at: datetime | None = None
    href: str


class LearningPathLessonItem(BaseModel):
    slug: str
    title: str
    summary: str
    lesson_type: str
    difficulty: str
    estimated_minutes: int | None = None
    is_completed: bool
    completed_at: datetime | None = None


class LearningPathDetail(BaseModel):
    id: UUID
    slug: str
    title: str
    subtitle: str | None = None
    summary: str
    description: str | None = None
    difficulty: str
    estimated_minutes: int | None = None
    lessons_count: int
    completed_lessons_count: int
    lessons: list[LearningPathLessonItem]
    recommended_quizzes: list[LearningRecommendedQuiz] = Field(default_factory=list)


class LearningNextStep(BaseModel):
    type: Literal["quiz", "my_path"]
    title: str
    description: str
    href: str
    quiz_slug: str | None = None


class LessonDetail(BaseModel):
    id: UUID
    slug: str
    title: str
    subtitle: str | None = None
    summary: str
    body: str
    lesson_type: str
    difficulty: str
    estimated_minutes: int | None = None
    published_at: datetime | None = None
    is_completed: bool
    completed_at: datetime | None = None
    next_step: LearningNextStep | None = None

    model_config = ConfigDict(from_attributes=True)


class LearningPathPreview(BaseModel):
    slug: str
    title: str
    lessons_count: int
    completed_lessons_count: int
    estimated_minutes: int | None = None
