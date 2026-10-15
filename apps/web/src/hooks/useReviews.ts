"use client";

import { useFetch } from "./useFetch";
import { getReviews } from "@aegis/api-client";
import type { Review, PaginatedList } from "@aegis/domain";

export function useReviews(page = 1, pageSize = 20) {
  return useFetch<PaginatedList<Review>>(() => getReviews(page, pageSize), [page, pageSize]);
}
