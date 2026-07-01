import { apiClient } from "../../shared/api/client";

import type { ProgressActivityResponse } from "./types";

export async function getProgressActivity(limit = 20): Promise<ProgressActivityResponse> {
  const response = await apiClient.get<ProgressActivityResponse>(`/progress/activity?limit=${limit}`);
  return response.data;
}
