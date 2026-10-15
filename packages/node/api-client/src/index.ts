export {
  getApiBaseUrl,
  setApiBaseUrl,
  setAuthToken,
  getAuthToken,
  setTokenRefresher,
  setAuthFailureHandler,
  apiFetch,
} from "./client";

export { login, refreshAccessToken, logoutUser, getMe } from "./api/auth";
export {
  getGroups,
  getGroupById,
  createGroup,
  getGroupMembers,
  addGroupMember,
  removeGroupMember,
} from "./api/groups";
export type { GetGroupsOptions } from "./api/groups";
export {
  getFaculties,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
} from "./api/faculties";
export {
  getDocuments,
  getDocumentById,
  getDocumentDownloadUrl,
  uploadDocument,
} from "./api/documents";
export { getReviews, getReviewById, createReview, updateReview } from "./api/reviews";
export { getAnnotationsByDocumentId, bulkUpdateAnnotations } from "./api/annotations";
export {
  getUserSelect,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "./api/users";
