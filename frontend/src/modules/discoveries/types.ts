export type DiscoveryDifficulty = "beginner" | "curious" | "confident";
export type DiscoveryCategory = "basics" | "taste" | "ritual" | "pairing" | "culture";

export type DiscoveryListItem = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  summary: string;
  category: DiscoveryCategory;
  difficulty: DiscoveryDifficulty;
  estimated_minutes: number | null;
  cover_image_url: string | null;
};

export type DiscoveryDetail = DiscoveryListItem & {
  body: string;
  published_at: string | null;
};

export type DiscoveriesListResponse = {
  items: DiscoveryListItem[];
};

export type DiscoveryFilters = {
  category?: DiscoveryCategory;
  difficulty?: DiscoveryDifficulty;
};
