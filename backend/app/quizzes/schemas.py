from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel


QuizDifficulty = Literal["beginner", "curious", "confident"]
QuizQuestionType = Literal["single_choice"]


class QuizOption(BaseModel):
    key: str
    label: str


class QuizListItem(BaseModel):
    id: UUID
    slug: str
    title: str
    subtitle: str | None = None
    summary: str
    difficulty: QuizDifficulty
    estimated_minutes: int | None = None
    questions_count: int
    is_completed: bool
    completed_at: datetime | None = None


class QuizQuestionPublic(BaseModel):
    id: UUID
    slug: str | None = None
    prompt: str
    question_type: QuizQuestionType
    options: list[QuizOption]


class QuizDetail(BaseModel):
    id: UUID
    slug: str
    title: str
    subtitle: str | None = None
    summary: str
    description: str | None = None
    difficulty: QuizDifficulty
    estimated_minutes: int | None = None
    is_completed: bool
    completed_at: datetime | None = None
    questions: list[QuizQuestionPublic]


class QuizAnswerInput(BaseModel):
    question_id: UUID
    selected_option_key: str


class QuizCheckRequest(BaseModel):
    answers: list[QuizAnswerInput]


class QuizCheckItem(BaseModel):
    question_id: UUID
    is_correct: bool
    selected_option_key: str
    correct_option_key: str
    explanation: str | None = None


class QuizCheckResult(BaseModel):
    quiz_slug: str
    total_questions: int
    correct_count: int
    is_completed: bool
    completed_at: datetime | None = None
    items: list[QuizCheckItem]
