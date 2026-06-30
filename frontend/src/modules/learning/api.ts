import { apiClient } from "../../shared/api/client";

import type {
  LearningPathDetail,
  LearningPathsResponse,
  LessonCompletionState,
  LessonDetail,
  LessonUncompleteState,
} from "./types";

export async function getLearningPaths(): Promise<LearningPathsResponse> {
  const response = await apiClient.get<LearningPathsResponse>("/learning/paths");
  return response.data;
}

export async function getLearningPath(slug: string): Promise<LearningPathDetail> {
  const response = await apiClient.get<LearningPathDetail>(`/learning/paths/${encodeURIComponent(slug)}`);
  return response.data;
}

export async function getLesson(slug: string): Promise<LessonDetail> {
  const response = await apiClient.get<LessonDetail>(`/learning/lessons/${encodeURIComponent(slug)}`);
  return response.data;
}

export async function completeLesson(slug: string): Promise<LessonCompletionState> {
  const response = await apiClient.post<LessonCompletionState>(
    `/progress/lessons/${encodeURIComponent(slug)}/complete`,
    {},
  );
  return response.data;
}

export async function uncompleteLesson(slug: string): Promise<LessonUncompleteState> {
  const response = await apiClient.delete<LessonUncompleteState>(
    `/progress/lessons/${encodeURIComponent(slug)}/complete`,
  );
  return response.data;
}
