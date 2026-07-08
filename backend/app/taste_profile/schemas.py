from pydantic import BaseModel, Field


class TasteProfileSummary(BaseModel):
    title: str
    description: str


class TasteProfileOnboarding(BaseModel):
    wine_experience_level: str | None = None
    taste_preferences: list[str] = Field(default_factory=list)
    goals: list[str] = Field(default_factory=list)


class TasteProfileCountItem(BaseModel):
    key: str
    count: int


class TasteProfileStats(BaseModel):
    notes_count: int
    rated_notes_count: int = 0
    average_rating: float | None = None
    would_buy_again_ratio: float | None = None
    buy_again_count: int = 0
    shelf_items_count: int = 0
    favorite_wine_colors: list[TasteProfileCountItem] = Field(default_factory=list)
    sweetness_distribution: list[TasteProfileCountItem] = Field(default_factory=list)
    top_aroma_notes: list[TasteProfileCountItem] = Field(default_factory=list)
    top_taste_notes: list[TasteProfileCountItem] = Field(default_factory=list)
    top_grapes: list[TasteProfileCountItem] = Field(default_factory=list)
    top_styles: list[TasteProfileCountItem] = Field(default_factory=list)
    countries_tried: list[TasteProfileCountItem] = Field(default_factory=list)
    regions_tried: list[TasteProfileCountItem] = Field(default_factory=list)
    shelf_status_counts: list[TasteProfileCountItem] = Field(default_factory=list)


class TasteProfileInsight(BaseModel):
    key: str
    title: str
    description: str


class TasteProfileResponse(BaseModel):
    summary: TasteProfileSummary
    onboarding: TasteProfileOnboarding
    stats: TasteProfileStats
    insights: list[TasteProfileInsight]


class TasteProfilePreview(BaseModel):
    notes_count: int
    average_rating: float | None = None
