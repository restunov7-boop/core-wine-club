import { apiClient } from "../../shared/api/client";

import type { DiscoveriesListResponse, DiscoveryDetail, DiscoveryFilters } from "./types";

export async function getDiscoveries(filters: DiscoveryFilters = {}): Promise<DiscoveriesListResponse> {
  const search = new URLSearchParams();
  if (filters.category) {
    search.set("category", filters.category);
  }
  if (filters.difficulty) {
    search.set("difficulty", filters.difficulty);
  }

  const query = search.toString();
  const response = await apiClient.get<DiscoveriesListResponse>(`/discoveries${query ? `?${query}` : ""}`);
  return response.data;
}

export async function getDiscovery(slug: string): Promise<DiscoveryDetail> {
  const response = await apiClient.get<DiscoveryDetail>(`/discoveries/${encodeURIComponent(slug)}`);
  return response.data;
}
