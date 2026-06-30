export type LearningDifficulty = "beginner" | "curious" | "confident";
export type LessonType = "article" | "guide" | "ritual";

export type LearningPathListItem = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  summary: string;
  difficulty: LearningDifficulty;
  estimated_minutes: number | null;
  cover_image_url: string | null;
  lessons_count: number;
  completed_lessons_count: number;
};

export type LearningPathLessonItem = {
  slug: string;
  title: string;
  summary: string;
  lesson_type: LessonType;
  difficulty: LearningDifficulty;
  estimated_minutes: number | null;
  is_completed: boolean;
  completed_at: string | null;
};

export type LearningPathDetail = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  summary: string;
  description: string | null;
  difficulty: LearningDifficulty;
  estimated_minutes: number | null;
  lessons_count: number;
  completed_lessons_count: number;
  lessons: LearningPathLessonItem[];
};

export type LessonDetail = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  summary: string;
  body: string;
  lesson_type: LessonType;
  difficulty: LearningDifficulty;
  estimated_minutes: number | null;
  published_at: string | null;
  is_completed: boolean;
  completed_at: string | null;
};

export type LearningPathsResponse = {
  items: LearningPathListItem[];
};

export type LessonCompletionState = {
  lesson_slug: string;
  is_completed: boolean;
  completed_at: string | null;
};

export type LessonUncompleteState = {
  lesson_slug: string;
  is_completed: boolean;
  deleted: boolean;
};
