import type { LoginPayload, LoginResponse, UserDto } from "./types";
import { apiFetch } from "./client";

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/api/users/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getMe(): Promise<UserDto> {
  return apiFetch<UserDto>("/api/users/me");
}
