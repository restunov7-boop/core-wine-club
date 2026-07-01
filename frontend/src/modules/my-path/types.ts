export type MyPathSummary = {
  completed_lessons_count: number;
  available_lessons_count: number;
  diary_notes_count: number;
  diary_target_notes_count: number;
  bottle_fill_percent: number;
  recent_activity_count: number;
};

export type MyPathAction = {
  key: string;
  title: string;
  description: string;
  href: string;
  priority: number;
};

export type MyPathSection = {
  key: string;
  title: string;
  description: string;
  href: string;
};

export type MyPathResponse = {
  title: string;
  subtitle: string;
  summary: MyPathSummary;
  next_actions: MyPathAction[];
  sections: MyPathSection[];
};
