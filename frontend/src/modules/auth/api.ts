import { apiClient } from "../../shared/api/client";

import type { AuthSession, MeResponse } from "./types";

export async function loginWithTelegram(initData: string): Promise<AuthSession> {
  const response = await apiClient.post<AuthSession>("/auth/telegram", { init_data: initData });
  return response.data;
}

export async function getMe(): Promise<MeResponse> {
  const response = await apiClient.get<MeResponse>("/auth/me");
  return response.data;
}
