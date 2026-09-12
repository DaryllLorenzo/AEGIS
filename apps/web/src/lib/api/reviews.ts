import type { Review, ReviewStatus, PaginatedList } from "./types";
import { apiFetch } from "./client";

// ---------------------------------------------------------------------------
// Review status normalization (backend may send numeric 0,1,2)
// ---------------------------------------------------------------------------

function normalizeReviewStatus(raw: unknown): ReviewStatus {
  if (typeof raw === "number") {
    switch (raw) {
      case 0: return "Pending";
      case 1: return "InProgress";
      case 2: return "Completed";
      default: return "Pending";
    }
  }
  return (raw as string) as ReviewStatus ?? "Pending";
}

function normalizeReview<T extends { status: unknown }>(review: T): T {
  return { ...review, status: normalizeReviewStatus((review as { status: unknown }).status) };
}

function reviewStatusToNumber(status: ReviewStatus): number {
  switch (status) {
    case "Pending": return 0;
    case "InProgress": return 1;
    case "Completed": return 2;
  }
}

// ---------------------------------------------------------------------------
// Review API calls
// ---------------------------------------------------------------------------

export async function getReviews(
  page = 1,
  pageSize = 20,
): Promise<PaginatedList<Review>> {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  const result = await apiFetch<PaginatedList<Review>>(`/api/reviews?${params}`);
  return { ...result, items: result.items.map(normalizeReview) };
}

export async function getReviewById(id: string): Promise<Review> {
  const review = await apiFetch<Review>(`/api/reviews/${id}`);
  return normalizeReview(review);
}

export async function createReview(data: {
  documentId: string;
  title: string;
  kind?: string;
  version?: string;
  dueDate?: string;
  assignee?: string;
}): Promise<Review> {
  const review = await apiFetch<Review>("/api/reviews", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return normalizeReview(review);
}

export async function updateReview(
  id: string,
  data: {
    title: string;
    kind?: string;
    version?: string;
    status?: ReviewStatus;
    dueDate?: string;
    assignee?: string;
  },
): Promise<Review> {
  const body: Record<string, unknown> = { title: data.title };
  if (data.kind !== undefined) body.kind = data.kind;
  if (data.version !== undefined) body.version = data.version;
  if (data.status !== undefined) body.status = reviewStatusToNumber(data.status);
  if (data.dueDate !== undefined) body.dueDate = data.dueDate;
  if (data.assignee !== undefined) body.assignee = data.assignee;

  const review = await apiFetch<Review>(`/api/reviews/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  return normalizeReview(review);
}
