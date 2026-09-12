import type { LoginPayload, LoginResponse, RefreshResponse, UserDto } from "./types";
import { apiFetch } from "./client";

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/api/users/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function refreshAccessToken(refreshToken: string): Promise<RefreshResponse> {
  return apiFetch<RefreshResponse>("/api/users/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

export async function logoutUser(refreshToken: string): Promise<void> {
  await apiFetch<{ success: boolean }>("/api/users/logout", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
}

export async function getMe(): Promise<UserDto> {
  return apiFetch<UserDto>("/api/users/me");
}
