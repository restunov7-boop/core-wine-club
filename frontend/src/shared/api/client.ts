export type ApiResponse<TData> = {
  data: TData;
  meta: Record<string, unknown>;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly payload: unknown,
  ) {
    super(message);
  }
}

type ApiErrorPayload = {
  error?: {
    message?: unknown;
  };
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";
let accessToken: string | null = null;

export function setApiAccessToken(token: string | null): void {
  accessToken = token;
}

async function request<TData>(path: string, init: RequestInit = {}): Promise<ApiResponse<TData>> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown network error";
    throw new ApiError("Не удалось связаться с сервером. Проверь соединение и попробуй снова.", 0, {
      detail,
      url: `${API_BASE_URL}${path}`,
    });
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(formatApiErrorMessage(response.status, payload as ApiErrorPayload | null), response.status, payload);
  }

  return payload as ApiResponse<TData>;
}

function formatApiErrorMessage(status: number, payload: ApiErrorPayload | null): string {
  const backendMessage = typeof payload?.error?.message === "string" ? payload.error.message : null;

  if (status === 401) {
    return "Не удалось подтвердить вход через Telegram. Открой приложение из бота ещё раз.";
  }
  if (status === 403) {
    return "Нет доступа к этому разделу.";
  }
  if (status === 404) {
    return "Эта запись не найдена или уже удалена.";
  }
  if (status === 502 || status === 503 || status === 504) {
    return "Сервер просыпается. Попробуй ещё раз через несколько секунд.";
  }
  if (status >= 500) {
    return "Сервер временно недоступен. Попробуй обновить страницу чуть позже.";
  }

  return backendMessage ?? "Не удалось выполнить запрос. Попробуй ещё раз.";
}

export const apiClient = {
  get: <TData>(path: string) => request<TData>(path),
  post: <TData>(path: string, body: unknown) =>
    request<TData>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <TData>(path: string, body: unknown) =>
    request<TData>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <TData>(path: string) => request<TData>(path, { method: "DELETE" }),
};
