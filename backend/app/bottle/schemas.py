from pydantic import BaseModel, Field

from app.progress.schemas import ProgressActivityPreviewItem


class BottleLearningBreakdown(BaseModel):
    completed_lessons_count: int
    available_lessons_count: int


class BottleDiaryBreakdown(BaseModel):
    notes_count: int
    target_notes_count: int
    contributed_units: int


class BottleBreakdown(BaseModel):
    learning: BottleLearningBreakdown
    diary: BottleDiaryBreakdown


class BottleNextAction(BaseModel):
    label: str
    href: str


class BottleProgress(BaseModel):
    title: str
    subtitle: str
    fill_percent: int
    completed_units: int
    total_units: int
    source: str
    breakdown: BottleBreakdown
    next_action: BottleNextAction
    activity_preview: list[ProgressActivityPreviewItem] = Field(default_factory=list)
