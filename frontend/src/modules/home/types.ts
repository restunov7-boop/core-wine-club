export type HomeProject = {
  slug: string;
  name: string;
};

export type HomeUser = {
  display_name: string | null;
};

export type HomeHero = {
  title: string;
  subtitle: string;
};

export type HomeSectionItem = {
  id: string | null;
  slug: string | null;
  title: string;
  description: string | null;
  href: string | null;
  occurred_at: string | null;
  estimated_minutes: number | null;
  lessons_count: number | null;
  completed_lessons_count: number | null;
};

export type HomeSection = {
  key: string;
  title: string;
  description: string;
  href: string | null;
  items: HomeSectionItem[];
  stats: Record<string, number | null>;
};

export type HomeResponse = {
  project: HomeProject;
  user: HomeUser;
  onboarding_completed: boolean;
  hero: HomeHero;
  sections: HomeSection[];
};
