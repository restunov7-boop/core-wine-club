export type ProgressActivityItem = {
  id: string;
  event_type: "learning.lesson.completed" | "diary.note.created";
  source_type: "lesson" | "diary_note";
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
