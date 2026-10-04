import type { FacultyDto, PaginatedList } from "./types";
import { apiFetch } from "./client";

export async function getFaculties(
  page = 1,
  pageSize = 50,
): Promise<PaginatedList<FacultyDto>> {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  return apiFetch<PaginatedList<FacultyDto>>(`/api/faculties?${params}`);
}
