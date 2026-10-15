"use client";

import { useFetch } from "./useFetch";
import { getDocuments } from "@aegis/api-client";
import type { DocumentDto, PaginatedList } from "@aegis/domain";

export function useDocuments(page = 1, pageSize = 20, groupId?: string) {
  return useFetch<PaginatedList<DocumentDto>>(
    () => getDocuments(page, pageSize, groupId),
    [page, pageSize, groupId],
  );
}
