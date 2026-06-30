import { apiClient } from "../../shared/api/client";

import type { OnboardingCompleteResponse, OnboardingData, OnboardingStatus } from "./types";

export async function getOnboardingStatus(): Promise<OnboardingStatus> {
  const response = await apiClient.get<OnboardingStatus>("/onboarding/status");
  return response.data;
}

export async function completeOnboarding(payload: OnboardingData): Promise<OnboardingCompleteResponse> {
  const response = await apiClient.post<OnboardingCompleteResponse>("/onboarding/complete", payload);
  return response.data;
}

export async function resetDevOnboarding(): Promise<OnboardingStatus> {
  const response = await apiClient.post<OnboardingStatus>("/onboarding/reset-dev", {});
  return response.data;
}
