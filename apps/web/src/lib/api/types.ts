// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

export type ReviewStatus = "Pending" | "InProgress" | "Completed";

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
