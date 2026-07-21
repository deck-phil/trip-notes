import type { AuthUser, AuthUserResponse } from "../types/auth";
import { API_BASE, request } from "./http";

export async function login(
  username: string,
  password: string,
): Promise<AuthUser> {
  const data = await request<AuthUserResponse>(`${API_BASE}/auth/login/`, {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  return data.user;
}

export async function logout(): Promise<void> {
  await request<{ detail: string }>(`${API_BASE}/auth/logout/`, {
    method: "POST",
  });
}

export async function getCurrentUser(): Promise<AuthUser> {
  const data = await request<AuthUserResponse>(`${API_BASE}/auth/me/`, {
    method: "GET",
  });

  return data.user;
}
