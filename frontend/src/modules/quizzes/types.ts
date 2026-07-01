export type QuizDifficulty = "beginner" | "curious" | "confident";
export type QuizQuestionType = "single_choice";

export type QuizListItem = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  summary: string;
  difficulty: QuizDifficulty;
  estimated_minutes: number | null;
  questions_count: number;
};

export type QuizOption = {
  key: string;
  label: string;
};

export type QuizQuestion = {
  id: string;
  slug: string | null;
  prompt: string;
  question_type: QuizQuestionType;
  options: QuizOption[];
};

export type QuizDetail = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  summary: string;
  description: string | null;
  difficulty: QuizDifficulty;
  estimated_minutes: number | null;
  questions: QuizQuestion[];
};

export type QuizzesResponse = {
  items: QuizListItem[];
};

export type QuizAnswerInput = {
  question_id: string;
  selected_option_key: string;
};

export type QuizCheckItem = {
  question_id: string;
  is_correct: boolean;
  selected_option_key: string;
  correct_option_key: string;
  explanation: string | null;
};

export type QuizCheckResult = {
  quiz_slug: string;
  total_questions: number;
  correct_count: number;
  items: QuizCheckItem[];
};
