export type ProgressActivityItem = {
  id: string;
  event_type: "learning.lesson.completed" | "diary.note.created" | "quiz.completed";
  source_type: "lesson" | "diary_note" | "quiz";
  source_id: string | null;
  source_slug: string | null;
  title: string;
  description: string;
  occurred_at: string;
  href: string | null;
};

export type ProgressActivityPreviewItem = {
  id: string;
  title: string;
  description: string;
  occurred_at: string;
  href: string | null;
};

export type ProgressActivityResponse = {
  items: ProgressActivityItem[];
};

export type ProgressSummary = {
  learning: {
    completed_lessons_count: number;
    available_lessons_count: number;
    completed_lesson_slugs: string[];
  };
  diary: {
    notes_count: number;
    created_note_events_count: number;
  };
  quizzes: {
    completed_quizzes_count: number;
    available_quizzes_count: number;
    completed_quiz_slugs: string[];
  };
};
