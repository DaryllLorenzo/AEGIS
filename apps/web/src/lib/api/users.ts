import type { PaginatedList, SelectItem, UserDto } from "./types";
import { apiFetch } from "./client";

/**
 * Shared entity-picker endpoint: GET /api/users/select
 * Returns { id, label } pairs. Pass groupId to scope to group
 * members (used by the assignee selector).
 */
export async function getUserSelect(groupId?: string, search?: string): Promise<SelectItem[]> {
  const params = new URLSearchParams();
  if (groupId) params.set("groupId", groupId);
  if (search) params.set("search", search);
  const query = params.toString();
  return apiFetch<SelectItem[]>(`/api/users/select${query ? `?${query}` : ""}`);
}

export async function getUsers(page = 1, pageSize = 100): Promise<PaginatedList<UserDto>> {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  return apiFetch<PaginatedList<UserDto>>(`/api/users?${params}`);
}

export async function getUserById(id: string): Promise<UserDto> {
  return apiFetch<UserDto>(`/api/users/${id}`);
}

export async function createUser(data: {
  email: string;
  displayName: string;
  password: string;
}): Promise<UserDto> {
  return apiFetch<UserDto>("/api/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateUser(
  id: string,
  data: { email: string; displayName: string },
): Promise<UserDto> {
  return apiFetch<UserDto>(`/api/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteUser(id: string): Promise<void> {
  await apiFetch(`/api/users/${id}`, { method: "DELETE" });
}

