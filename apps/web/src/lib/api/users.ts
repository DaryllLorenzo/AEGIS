import type { SelectItem } from "./types";
import { apiFetch } from "./client";

/**
 * Shared entity-picker endpoint: GET /api/users/select
 * Returns { id, label } pairs. Pass groupId to scope to group
 * members (used by the assignee selector).
 */
export async function getUserSelect(groupId?: string, search?: string): Promise<SelectItem[]> {
  const params = new URLSearchParams();
  if (groupId) params.set("groupId", groupId);
  if (search) params.set("search", search);
  const query = params.toString();
  return apiFetch<SelectItem[]>(`/api/users/select${query ? `?${query}` : ""}`);
}
