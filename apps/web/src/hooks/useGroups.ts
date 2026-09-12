"use client";

import { useFetch } from "./useFetch";
import { getGroups, type GroupDto, type PaginatedList } from "@/lib/api";

export function useGroups(page = 1, pageSize = 50) {
  return useFetch<PaginatedList<GroupDto>>(
    () => getGroups(page, pageSize),
    [page, pageSize],
  );
}
