export type TasteProfileCountItem = {
  key: string;
  count: number;
};

export type TasteProfileSummary = {
  title: string;
  description: string;
};

export type TasteProfileOnboarding = {
  wine_experience_level: string | null;
  taste_preferences: string[];
  goals: string[];
};

export type TasteProfileStats = {
  notes_count: number;
  rated_notes_count: number;
  average_rating: number | null;
  would_buy_again_ratio: number | null;
  buy_again_count: number;
  shelf_items_count: number;
  favorite_wine_colors: TasteProfileCountItem[];
  sweetness_distribution: TasteProfileCountItem[];
  top_aroma_notes: TasteProfileCountItem[];
  top_taste_notes: TasteProfileCountItem[];
  top_grapes: TasteProfileCountItem[];
  top_styles: TasteProfileCountItem[];
  countries_tried: TasteProfileCountItem[];
  regions_tried: TasteProfileCountItem[];
  shelf_status_counts: TasteProfileCountItem[];
};

export type TasteProfileInsight = {
  key: string;
  title: string;
  description: string;
};

export type TasteProfileResponse = {
  summary: TasteProfileSummary;
  onboarding: TasteProfileOnboarding;
  stats: TasteProfileStats;
  insights: TasteProfileInsight[];
};
