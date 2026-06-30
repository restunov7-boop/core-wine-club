export type BottleBreakdown = {
  completed_lessons_count: number;
  available_lessons_count: number;
};

export type BottleNextAction = {
  label: string;
  href: string;
};

export type BottleProgress = {
  title: string;
  subtitle: string;
  fill_percent: number;
  completed_units: number;
  total_units: number;
  source: "learning_lessons";
  breakdown: BottleBreakdown;
  next_action: BottleNextAction;
};
