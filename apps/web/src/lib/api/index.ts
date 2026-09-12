// Barrel export — re-export everything from the modular API files.
// Existing imports like `from "@/lib/api"` will continue to work.

export { apiBaseUrl, setAuthToken, getAuthToken, setTokenRefresher, setAuthFailureHandler } from "./client";
export { apiFetch } from "./client";

export type {
  ReviewStatus,
  Review,
  PaginatedList,
  DocumentDto,
  UserDto,
  GroupDto,
  AnnotationGeometry,
  AnnotationDto,
  AnnotationPayload,
  LoginPayload,
  LoginResponse,
  RefreshResponse,
} from "./types";

export { login, refreshAccessToken, logoutUser, getMe } from "./auth";
export { getGroups, getGroupById } from "./groups";
export { getUsers } from "./users";
export { getDocuments, getDocumentById, getDocumentDownloadUrl, uploadDocument } from "./documents";
export { getReviews, getReviewById, createReview, updateReview } from "./reviews";
export { getAnnotationsByDocumentId, bulkUpdateAnnotations } from "./annotations";

// UI helpers (moved from the old monolithic api.ts)
export { reviewStatusLabel, reviewStatusClass, initialsFromName } from "@/lib/utils";
