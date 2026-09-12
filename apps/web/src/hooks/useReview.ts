"use client";

import { useFetch } from "./useFetch";
import { getReviewById, type Review } from "@/lib/api";

export function useReview(id: string | undefined) {
  return useFetch<Review>(
    () => getReviewById(id!),
    [id],
  );
}
