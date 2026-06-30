import { apiClient } from "../../shared/api/client";

import type { TasteProfileResponse } from "./types";

export async function getTasteProfile(): Promise<TasteProfileResponse> {
  const response = await apiClient.get<TasteProfileResponse>("/taste-profile");
  return response.data;
}
