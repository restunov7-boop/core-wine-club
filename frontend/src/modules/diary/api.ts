import { apiClient } from "../../shared/api/client";

import type { TastingNoteDetail, TastingNotePayload, TastingNotesListResponse } from "./types";

export async function getTastingNotes(limit = 20, offset = 0): Promise<TastingNotesListResponse> {
  const response = await apiClient.get<TastingNotesListResponse>(`/diary/notes?limit=${limit}&offset=${offset}`);
  return response.data;
}

export async function createTastingNote(payload: TastingNotePayload): Promise<TastingNoteDetail> {
  const response = await apiClient.post<TastingNoteDetail>("/diary/notes", payload);
  return response.data;
}

export async function getTastingNote(noteId: string): Promise<TastingNoteDetail> {
  const response = await apiClient.get<TastingNoteDetail>(`/diary/notes/${encodeURIComponent(noteId)}`);
  return response.data;
}

export async function updateTastingNote(noteId: string, payload: TastingNotePayload): Promise<TastingNoteDetail> {
  const response = await apiClient.patch<TastingNoteDetail>(`/diary/notes/${encodeURIComponent(noteId)}`, payload);
  return response.data;
}

export async function deleteTastingNote(noteId: string): Promise<{ deleted: boolean }> {
  const response = await apiClient.delete<{ deleted: boolean }>(`/diary/notes/${encodeURIComponent(noteId)}`);
  return response.data;
}
