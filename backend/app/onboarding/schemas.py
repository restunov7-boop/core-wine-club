from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

from app.projects.schemas import ProjectUserRead
from app.users.schemas import UserSummary

WineExperienceLevel = Literal["beginner", "curious", "confident"]
TastePreference = Literal["red", "white", "sparkling", "rose", "sweet", "dry", "not_sure"]
OnboardingGoal = Literal[
    "understand_wine",
    "choose_bottle",
    "build_taste",
    "feel_confident",
    "explore_culture",
]


class OnboardingData(BaseModel):
    wine_experience_level: WineExperienceLevel
    taste_preferences: list[TastePreference] = Field(min_length=1)
    goals: list[OnboardingGoal] = Field(min_length=1)
    display_name: str | None = Field(default=None, max_length=255)


class OnboardingStatus(BaseModel):
    is_completed: bool
    completed_at: datetime | None
    onboarding_data: OnboardingData | None


class OnboardingCompleteResponse(OnboardingStatus):
    user: UserSummary
    project_user: ProjectUserRead
