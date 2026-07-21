import type { ApiErrorShape } from "../types/auth";

export const API_BASE = "http://localhost:8000/api";

export class ApiError extends Error {
  status: number;
  data?: ApiErrorShape | null;

  constructor(status: number, message: string, data?: ApiErrorShape | null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export function getCookie(name: string): string | null {
  const cookieString = document.cookie;
  if (!cookieString) return null;

  const cookies = cookieString.split(";").map((cookie) => cookie.trim());
  const match = cookies.find((cookie) => cookie.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

export async function parseJson<T>(res: Response): Promise<T | null> {
  const text = await res.text();
  if (!text) return null;
  return JSON.parse(text) as T;
}

function isUnsafeMethod(method?: string): boolean {
  if (!method) return false;
  return !["GET", "HEAD", "OPTIONS", "TRACE"].includes(method.toUpperCase());
}

export async function getCsrfToken(): Promise<void> {
  await fetch(`${API_BASE}/auth/csrf/`, {
    method: "GET",
    credentials: "include",
  });
}

export async function request<T>(
  url: string,
  init: RequestInit = {},
): Promise<T> {
  const method = init.method ?? "GET";
  const headers = new Headers(init.headers ?? {});

  if (isUnsafeMethod(method)) {
    await getCsrfToken();

    const csrfToken = getCookie("csrftoken");
    if (csrfToken) {
      headers.set("X-CSRFToken", csrfToken);
    }
  }

  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    credentials: "include",
    ...init,
    method,
    headers,
  });

  const data = await parseJson<T | ApiErrorShape>(response);

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "detail" in data && data.detail
        ? data.detail
        : "Request failed.";

    throw new Error(message);
  }

  return data as T;
}
