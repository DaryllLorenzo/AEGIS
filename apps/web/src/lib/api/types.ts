// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

export type ReviewStatus = "Pending" | "InProgress" | "Completed";

/** Document type enum — mirrors the backend DocumentType enum. */
export type DocumentType = "Thesis" | "Article";

export type Review = {
  id: string;
  documentId: string;
  userId: string;
  title: string;
  kind: string | null;
  version: string | null;
  status: ReviewStatus;
  dueDate: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
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
  type: DocumentType;
  version: number;
  objectKey: string;
  bucketName: string;
  fileSize: number;
  mimeType: string;
  checksum: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
};

/** Shared shape for entity pickers (dropdowns, autocomplete). */
export type SelectItem = {
  id: string;
  label: string;
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
  /** User who created the group (holds the Creator role). */
  createdByUserId: string | null;
  createdAt: string;
  updatedAt: string | null;
};

/** A user linked to a group, with the roles they hold in that group. */
export type GroupMember = {
  id: string;
  email: string;
  displayName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  roles: string[];
};

export type FacultyDto = {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
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

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  refreshToken: string;
  email: string;
  displayName: string;
  expiresAt: string;
};

export type RefreshResponse = {
  token: string;
  refreshToken: string;
  expiresAt: string;
};
