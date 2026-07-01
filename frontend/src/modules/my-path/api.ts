import { apiClient } from "../../shared/api/client";

import type { MyPathResponse } from "./types";

export async function getMyPath(): Promise<MyPathResponse> {
  const response = await apiClient.get<MyPathResponse>("/my-path");
  return response.data;
}
