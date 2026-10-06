import type { FacultyDto, PaginatedList } from "./types";
import { apiFetch } from "./client";

export async function getFaculties(
  page = 1,
  pageSize = 50,
): Promise<PaginatedList<FacultyDto>> {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  return apiFetch<PaginatedList<FacultyDto>>(`/api/faculties?${params}`);
}

export async function getFacultyById(id: string): Promise<FacultyDto> {
  return apiFetch<FacultyDto>(`/api/faculties/${id}`);
}

export async function createFaculty(data: {
  name: string;
  code?: string;
  description?: string;
}): Promise<FacultyDto> {
  return apiFetch<FacultyDto>("/api/faculties", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateFaculty(
  id: string,
  data: { name: string; code?: string; description?: string },
): Promise<FacultyDto> {
  return apiFetch<FacultyDto>(`/api/faculties/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteFaculty(id: string): Promise<void> {
  await apiFetch(`/api/faculties/${id}`, { method: "DELETE" });
}
