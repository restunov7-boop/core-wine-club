from pydantic import BaseModel, Field


class MyPathSummary(BaseModel):
    completed_lessons_count: int
    available_lessons_count: int
    diary_notes_count: int
    diary_target_notes_count: int
    bottle_fill_percent: int
    recent_activity_count: int


class MyPathAction(BaseModel):
    key: str
    title: str
    description: str
    href: str
    priority: int


class MyPathSection(BaseModel):
    key: str
    title: str
    description: str
    href: str


class MyPathResponse(BaseModel):
    title: str = "Мой путь"
    subtitle: str = "Спокойный маршрут по твоему винному опыту."
    summary: MyPathSummary
    next_actions: list[MyPathAction] = Field(default_factory=list)
    sections: list[MyPathSection] = Field(default_factory=list)
