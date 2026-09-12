import type { AnnotationDto, AnnotationPayload } from "./types";
import { apiFetch } from "./client";

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
