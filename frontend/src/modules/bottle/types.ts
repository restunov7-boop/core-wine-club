export type BottleLearningBreakdown = {
  completed_lessons_count: number;
  available_lessons_count: number;
};

export type BottleDiaryBreakdown = {
  notes_count: number;
  target_notes_count: number;
  contributed_units: number;
};

export type BottleBreakdown = {
  learning: BottleLearningBreakdown;
  diary: BottleDiaryBreakdown;
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
  source: "learning_and_diary";
  breakdown: BottleBreakdown;
  next_action: BottleNextAction;
};
