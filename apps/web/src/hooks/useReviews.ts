"use client";

import { useFetch } from "./useFetch";
import { getReviews, type Review, type PaginatedList } from "@/lib/api";

export function useReviews(page = 1, pageSize = 20) {
  return useFetch<PaginatedList<Review>>(
    () => getReviews(page, pageSize),
    [page, pageSize],
  );
}
