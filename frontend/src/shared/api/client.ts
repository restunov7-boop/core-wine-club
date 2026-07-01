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
    throw new ApiError("Не удалось связаться с сервером. Проверь, что backend запущен.", 0, {
      detail,
      url: `${API_BASE_URL}${path}`,
    });
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof payload?.error?.message === "string" ? payload.error.message : "Не удалось выполнить запрос";
    throw new ApiError(message, response.status, payload);
  }

  return payload as ApiResponse<TData>;
}

export const apiClient = {
  get: <TData>(path: string) => request<TData>(path),
  post: <TData>(path: string, body: unknown) =>
    request<TData>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <TData>(path: string, body: unknown) =>
    request<TData>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <TData>(path: string) => request<TData>(path, { method: "DELETE" }),
};
