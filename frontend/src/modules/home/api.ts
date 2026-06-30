import { apiClient } from "../../shared/api/client";

import type { HomeResponse } from "./types";

export async function getHome(): Promise<HomeResponse> {
  const response = await apiClient.get<HomeResponse>("/home");
  return response.data;
}
