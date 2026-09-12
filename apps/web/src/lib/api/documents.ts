import type { DocumentDto, PaginatedList } from "./types";
import { apiFetch, apiBaseUrl, getAuthToken } from "./client";

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
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = `${apiBaseUrl}/api/documents`;
  const res = await fetch(url, { method: "POST", body: formData, headers });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }

  return res.json();
}
