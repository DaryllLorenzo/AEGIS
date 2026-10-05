import type { GroupDto, PaginatedList, SelectItem, UserDto } from "./types";
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

export async function getGroupMembers(groupId: string): Promise<UserDto[]> {
  return apiFetch<UserDto[]>(`/api/groups/${groupId}/members`);
}

export async function addGroupMember(
  groupId: string,
  userId: string,
  roleId?: string,
): Promise<GroupDto> {
  return apiFetch<GroupDto>(`/api/groups/${groupId}/members`, {
    method: "POST",
    body: JSON.stringify({ userId, roleId }),
  });
}

export async function removeGroupMember(
  groupId: string,
  userId: string,
): Promise<GroupDto> {
  return apiFetch<GroupDto>(`/api/groups/${groupId}/members/${userId}`, {
    method: "DELETE",
  });
}

export async function createGroup(data: {
  name: string;
  facultyId: string;
  description?: string;
  userIds?: string[];
}): Promise<GroupDto> {
  return apiFetch<GroupDto>("/api/groups", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
