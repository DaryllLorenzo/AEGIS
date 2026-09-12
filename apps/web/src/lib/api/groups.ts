import type { GroupDto, PaginatedList } from "./types";
import { apiFetch } from "./client";

export async function getGroups(
  page = 1,
  pageSize = 50,
): Promise<PaginatedList<GroupDto>> {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  return apiFetch<PaginatedList<GroupDto>>(`/api/groups?${params}`);
}

export async function getGroupById(id: string): Promise<GroupDto> {
  return apiFetch<GroupDto>(`/api/groups/${id}`);
}
