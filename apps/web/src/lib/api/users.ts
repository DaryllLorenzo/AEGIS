import type { PaginatedList, UserDto } from "./types";
import { apiFetch } from "./client";

export async function getUsers(
  page = 1,
  pageSize = 50,
): Promise<PaginatedList<UserDto>> {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  return apiFetch<PaginatedList<UserDto>>(`/api/users?${params}`);
}
