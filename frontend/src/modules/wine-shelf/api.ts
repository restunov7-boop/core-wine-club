import { apiClient } from "../../shared/api/client";

import type { WineShelfItem, WineShelfItemPayload, WineShelfItemUpdatePayload, WineShelfListResponse, WineShelfStatus } from "./types";

export async function listShelfItems(status?: WineShelfStatus, limit = 50, offset = 0): Promise<WineShelfListResponse> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  if (status) {
    params.set("status", status);
  }
  const response = await apiClient.get<WineShelfListResponse>(`/wine-shelf/items?${params.toString()}`);
  return response.data;
}

export async function createShelfItem(payload: WineShelfItemPayload): Promise<WineShelfItem> {
  const response = await apiClient.post<WineShelfItem>("/wine-shelf/items", payload);
  return response.data;
}

export async function getShelfItem(itemId: string): Promise<WineShelfItem> {
  const response = await apiClient.get<WineShelfItem>(`/wine-shelf/items/${encodeURIComponent(itemId)}`);
  return response.data;
}

export async function updateShelfItem(itemId: string, payload: WineShelfItemUpdatePayload): Promise<WineShelfItem> {
  const response = await apiClient.patch<WineShelfItem>(`/wine-shelf/items/${encodeURIComponent(itemId)}`, payload);
  return response.data;
}

export async function deleteShelfItem(itemId: string): Promise<{ deleted: boolean }> {
  const response = await apiClient.delete<{ deleted: boolean }>(`/wine-shelf/items/${encodeURIComponent(itemId)}`);
  return response.data;
}
