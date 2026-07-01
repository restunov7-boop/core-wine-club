import { apiClient } from "../../shared/api/client";

import type { QuizAnswerInput, QuizCheckResult, QuizDetail, QuizzesResponse } from "./types";

export async function getQuizzes(): Promise<QuizzesResponse> {
  const response = await apiClient.get<QuizzesResponse>("/quizzes");
  return response.data;
}

export async function getQuiz(slug: string): Promise<QuizDetail> {
  const response = await apiClient.get<QuizDetail>(`/quizzes/${encodeURIComponent(slug)}`);
  return response.data;
}

export async function checkQuiz(slug: string, answers: QuizAnswerInput[]): Promise<QuizCheckResult> {
  const response = await apiClient.post<QuizCheckResult>(`/quizzes/${encodeURIComponent(slug)}/check`, {
    answers,
  });
  return response.data;
}
