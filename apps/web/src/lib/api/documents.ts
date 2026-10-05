import type { DocumentDto, DocumentType, PaginatedList } from "./types";
import { apiFetch, apiBaseUrl, getAuthToken } from "./client";

// Backend serializes the DocumentType enum as a numeric value
// (0 = Thesis, 1 = Article). Normalize to the string union the UI expects.

function normalizeDocumentType(raw: unknown): DocumentType {
  if (typeof raw === "number") {
    switch (raw) {
      case 0: return "Thesis";
      case 1: return "Article";
      default: return "Thesis";
    }
  }
  return raw as DocumentType;
}

function normalizeDocument<T extends { type: unknown }>(doc: T): T {
  return { ...doc, type: normalizeDocumentType((doc as { type: unknown }).type) };
}

export async function getDocuments(
  page = 1,
  pageSize = 20,
  groupId?: string,
): Promise<PaginatedList<DocumentDto>> {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (groupId) params.set("groupId", groupId);
  const result = await apiFetch<PaginatedList<DocumentDto>>(`/api/documents?${params}`);
  return { ...result, items: result.items.map(normalizeDocument) };
}

export async function getDocumentById(id: string): Promise<DocumentDto> {
  const doc = await apiFetch<DocumentDto>(`/api/documents/${id}`);
  return normalizeDocument(doc);
}

export function getDocumentDownloadUrl(id: string): string {
  return `${apiBaseUrl}/api/documents/${id}/download`;
}

export async function uploadDocument(
  file: File,
  name: string,
  groupId: string,
  parentId?: string,
  type: DocumentType = "Thesis",
): Promise<DocumentDto> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("name", name);
  formData.append("groupId", groupId);
  formData.append("type", type);
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

  const json = await res.json();
  return normalizeDocument(json);
}
