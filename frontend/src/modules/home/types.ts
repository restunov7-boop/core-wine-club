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
  slug: string;
  title: string;
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
