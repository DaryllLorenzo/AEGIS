"use client";

import { useFetch } from "./useFetch";
import { getReviewById } from "@aegis/api-client";
import type { Review } from "@aegis/domain";

export function useReview(id: string | undefined) {
  return useFetch<Review>(() => getReviewById(id!), [id]);
}
