import type { GroupDto, GroupMember, PaginatedList, SelectItem, UserDto } from "./types";
import { apiFetch } from "./client";

export type GetGroupsOptions = {
  /** When true, only groups the current user belongs to. */
  mine?: boolean;
  /** When set, only groups in this faculty. */
  facultyId?: string;
};

export async function getGroups(
  page = 1,
  pageSize = 50,
  options: GetGroupsOptions = {},
): Promise<PaginatedList<GroupDto>> {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (options.mine) params.set("mine", "true");
  if (options.facultyId) params.set("filters", `FacultyId==${options.facultyId}`);
  return apiFetch<PaginatedList<GroupDto>>(`/api/groups?${params}`);
}

export async function getGroupById(id: string): Promise<GroupDto> {
  return apiFetch<GroupDto>(`/api/groups/${id}`);
}

export async function getGroupMembers(groupId: string): Promise<GroupMember[]> {
  return apiFetch<GroupMember[]>(`/api/groups/${groupId}/members`);
}

export async function addGroupMember(
  groupId: string,
  userId: string,
  role?: "Submitter" | "Reviewer",
): Promise<GroupDto> {
  return apiFetch<GroupDto>(`/api/groups/${groupId}/members`, {
    method: "POST",
    body: JSON.stringify({ userId, role }),
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
  members?: { userId: string; roles: ("Submitter" | "Reviewer")[] }[];
}): Promise<GroupDto> {
  return apiFetch<GroupDto>("/api/groups", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
