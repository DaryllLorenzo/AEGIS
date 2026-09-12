"use client";

import { useFetch } from "./useFetch";
import { getDocuments, type DocumentDto, type PaginatedList } from "@/lib/api";

export function useDocuments(page = 1, pageSize = 20, groupId?: string) {
  return useFetch<PaginatedList<DocumentDto>>(
    () => getDocuments(page, pageSize, groupId),
    [page, pageSize, groupId],
  );
}
