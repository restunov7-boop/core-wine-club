import { apiClient } from "../../shared/api/client";

import type { ProgressActivityResponse, ProgressSummary } from "./types";

export async function getProgressActivity(limit = 20): Promise<ProgressActivityResponse> {
  const response = await apiClient.get<ProgressActivityResponse>(`/progress/activity?limit=${limit}`);
  return response.data;
}

export async function getProgressSummary(): Promise<ProgressSummary> {
  const response = await apiClient.get<ProgressSummary>("/progress/summary");
  return response.data;
}
