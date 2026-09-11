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
// Auth token management
// ---------------------------------------------------------------------------

let _authToken: string | null = null;

export function setAuthToken(token: string | null) {
  _authToken = token;
}

export function getAuthToken(): string | null {
  return _authToken;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ReviewStatus = "Pending" | "InProgress" | "Completed";

/** Normalize backend numeric ReviewStatus (0,1,2) to string. */
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

export type Review = {
  id: string;
  documentId: string;
  userId: string;
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
  groupId: string;
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

export type UserDto = {
  id: string;
  email: string;
  displayName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type GroupDto = {
  id: string;
  name: string;
  facultyId: string;
  description: string | null;
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
  const headers: Record<string, string> = { "Content-Type": "application/json", ...init?.headers as Record<string, string> };

  if (_authToken) {
    headers["Authorization"] = `Bearer ${_authToken}`;
  }

  const res = await fetch(url, { ...init, headers });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  email: string;
  displayName: string;
  expiresAt: string;
};

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  return apiFetch<LoginResponse>("/api/users/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getMe(): Promise<UserDto> {
  return apiFetch<UserDto>("/api/users/me");
}

// ---------------------------------------------------------------------------
// Groups
// ---------------------------------------------------------------------------

export async function getGroups(
  page = 1,
  pageSize = 50,
): Promise<PaginatedList<GroupDto>> {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  return apiFetch<PaginatedList<GroupDto>>(`/api/groups?${params}`);
}

export async function getGroupById(id: string): Promise<GroupDto> {
  return apiFetch<GroupDto>(`/api/groups/${id}`);
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export async function getUsers(
  page = 1,
  pageSize = 50,
): Promise<PaginatedList<UserDto>> {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  return apiFetch<PaginatedList<UserDto>>(`/api/users?${params}`);
}

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

export async function getDocuments(
  page = 1,
  pageSize = 20,
  groupId?: string,
): Promise<PaginatedList<DocumentDto>> {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (groupId) params.set("groupId", groupId);
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
  groupId: string,
  parentId?: string,
): Promise<DocumentDto> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("name", name);
  formData.append("groupId", groupId);
  if (parentId) formData.append("parentId", parentId);

  const headers: Record<string, string> = {};
  if (_authToken) {
    headers["Authorization"] = `Bearer ${_authToken}`;
  }

  const url = `${apiBaseUrl}/api/documents`;
  const res = await fetch(url, { method: "POST", body: formData, headers });

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

function reviewStatusToNumber(status: ReviewStatus): number {
  switch (status) {
    case "Pending": return 0;
    case "InProgress": return 1;
    case "Completed": return 2;
  }
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map backend numeric ReviewStatus to display label */
export function reviewStatusLabel(status: ReviewStatus): string {
  switch (status) {
    case "Pending": return "Open";
    case "InProgress": return "In progress";
    case "Completed": return "Completed";
  }
}

/** Map backend ReviewStatus to CSS class suffix */
export function reviewStatusClass(status: ReviewStatus): string {
  switch (status) {
    case "Pending": return "open";
    case "InProgress": return "in-progress";
    case "Completed": return "completed";
  }
}

/** Generate initials from a display name */
export function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}
