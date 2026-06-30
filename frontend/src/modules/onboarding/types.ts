import type { AuthUser, ProjectUser } from "../auth/types";

export type WineExperienceLevel = "beginner" | "curious" | "confident";
export type TastePreference = "red" | "white" | "sparkling" | "rose" | "sweet" | "dry" | "not_sure";
export type OnboardingGoal =
  | "understand_wine"
  | "choose_bottle"
  | "build_taste"
  | "feel_confident"
  | "explore_culture";

export type OnboardingData = {
  wine_experience_level: WineExperienceLevel;
  taste_preferences: TastePreference[];
  goals: OnboardingGoal[];
  display_name?: string;
};

export type OnboardingStatus = {
  is_completed: boolean;
  completed_at: string | null;
  onboarding_data: OnboardingData | null;
};

export type OnboardingCompleteResponse = OnboardingStatus & {
  user: AuthUser;
  project_user: ProjectUser;
};
