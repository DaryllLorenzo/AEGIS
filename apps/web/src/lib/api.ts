/**
 * Base URL of the AEGIS API.
 *
 * API_URL is the address reachable from the Next.js server (the Aspire endpoint in
 * development, the compose service name in Docker). NEXT_PUBLIC_API_URL is the address the
 * browser uses and is the only one inlined into client bundles.
 */
export const apiBaseUrl =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5180";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ReviewStatus = "Open" | "In progress" | "Completed";

export type Review = {
  id: string;
  documentId: string;
  title: string;
  kind: string | null;
  version: string | null;
  status: ReviewStatus;
  dueDate: string | null;
  assignee: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type PaginatedList<T> = {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type DocumentDto = {
  id: string;
  parentId: string | null;
  totalPages: number;
  name: string;
  objectKey: string;
  bucketName: string;
  fileSize: number;
  mimeType: string;
  checksum: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type AnnotationGeometry =
  | { x: number; y: number; width: number; height: number }
  | { cx: number; cy: number; radius: number }
  | { cx: number; cy: number; radiusX: number; radiusY: number }
  | { lines: { x: number; y: number; width: number; height: number }[] };

export type AnnotationDto = {
  id: string;
  documentId: string;
  pageNumber: number;
  type: string;
  geometry: string;
  content: string | null;
  color: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type AnnotationPayload = {
  id?: string;
  pageNumber: number;
  type: string;
  geometry: AnnotationGeometry;
  content?: string | null;
  color?: string | null;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${apiBaseUrl}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

export async function getDocuments(
  page = 1,
  pageSize = 20,
): Promise<PaginatedList<DocumentDto>> {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  return apiFetch<PaginatedList<DocumentDto>>(`/api/documents?${params}`);
}

export async function getDocumentById(id: string): Promise<DocumentDto> {
  return apiFetch<DocumentDto>(`/api/documents/${id}`);
}

export function getDocumentDownloadUrl(id: string): string {
  return `${apiBaseUrl}/api/documents/${id}/download`;
}

export async function uploadDocument(
  file: File,
  name: string,
  parentId?: string,
): Promise<DocumentDto> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("name", name);
  if (parentId) formData.append("parentId", parentId);

  const url = `${apiBaseUrl}/api/documents`;
  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }

  return res.json();
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export async function getReviews(
  page = 1,
  pageSize = 20,
): Promise<PaginatedList<Review>> {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  return apiFetch<PaginatedList<Review>>(`/api/reviews?${params}`);
}

export async function getReviewById(id: string): Promise<Review> {
  return apiFetch<Review>(`/api/reviews/${id}`);
}

export async function createReview(data: {
  documentId: string;
  title: string;
  kind?: string;
  version?: string;
  status?: string;
  dueDate?: string;
  assignee?: string;
}): Promise<Review> {
  return apiFetch<Review>("/api/reviews", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ---------------------------------------------------------------------------
// Annotations
// ---------------------------------------------------------------------------

export async function getAnnotationsByDocumentId(
  documentId: string,
): Promise<AnnotationDto[]> {
  return apiFetch<AnnotationDto[]>(`/api/annotations/document/${documentId}`);
}

export async function bulkUpdateAnnotations(
  documentId: string,
  annotations: AnnotationPayload[],
): Promise<AnnotationDto[]> {
  return apiFetch<AnnotationDto[]>(`/api/annotations/document/${documentId}`, {
    method: "PUT",
    body: JSON.stringify({ annotations }),
  });
}
