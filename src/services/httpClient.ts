export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  requiresAuth?: boolean;
}

const TOKEN_STORAGE_KEY = "auth_token";

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function storeToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearStoredToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export async function apiRequest<T>(
  baseUrl: string,
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, requiresAuth = false, headers, ...restOptions } = options;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string> | undefined),
  };

  if (requiresAuth) {
    const token = getStoredToken();

    if (!token) {
      throw new ApiError("Authentication required.", 401);
    }

    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...restOptions,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const message =
      (data &&
        typeof data === "object" &&
        "message" in data &&
        typeof data.message === "string" &&
        data.message) ||
      (data &&
        typeof data === "object" &&
        "title" in data &&
        typeof data.title === "string" &&
        data.title) ||
      `Request failed with status ${response.status}`;

    throw new ApiError(message, response.status);
  }

  return data as T;
}
