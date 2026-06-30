from pydantic import BaseModel


class BottleBreakdown(BaseModel):
    completed_lessons_count: int
    available_lessons_count: int


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
