import type {ApiErrorShape, AuthUser, AuthUserResponse} from "../types/auth";

const API_BASE = "http://localhost:8000/api";

function getCookie(name: string): string | null {
  const cookieString = document.cookie;
  if (!cookieString) return null;

  const cookies = cookieString.split(";").map((cookie) => cookie.trim());
  const match = cookies.find((cookie) => cookie.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

async function parseJson<T>(res: Response): Promise<T | null> {
  const text = await res.text();
  if (!text) return null;
  return JSON.parse(text) as T; 
}

async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
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

export async function login(username: string, password: string): Promise<AuthUser> {
  await getCsrfToken();

  const csrfToken = getCookie("csrftoken");

  const data = await request<AuthUserResponse>(`${API_BASE}/auth/login/`, {
    method: "POST",
    headers: {
      "X-CSRFToken": csrfToken ?? "",
    },
    body: JSON.stringify({username, password}),
  });

  return data.user;
}

export async function logout(): Promise<void> {
  await getCsrfToken();

  const csrfToken = getCookie("csrftoken");

  await request<{ detail: string }>(`${API_BASE}/auth/logout/`, {
    method: "POST",
    headers: {
      "X-CSRFToken": csrfToken ?? "",
    },
  });
}

export async function getCurrentUser(): Promise<AuthUser> {
  const data = await request<AuthUserResponse>(`${API_BASE}/auth/me/`, {
    method: "GET",
  });

  return data.user;
}

export async function getCsrfToken(): Promise<void> {
  await fetch(`${API_BASE}/auth/csrf/`, {
    method: "GET",
    credentials: "include",
  });
}