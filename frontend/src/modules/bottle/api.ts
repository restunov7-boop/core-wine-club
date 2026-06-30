import { apiClient } from "../../shared/api/client";

import type { BottleProgress } from "./types";

export async function getBottleProgress(): Promise<BottleProgress> {
  const response = await apiClient.get<BottleProgress>("/bottle/progress");
  return response.data;
}
