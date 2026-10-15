import type { DocumentType } from "@aegis/domain";

const LABELS: Record<DocumentType, string> = {
  Thesis: "Thesis",
  Article: "Article",
};

/**
 * Small chip that identifies a document's type
 * (Thesis / Article). Used wherever documents are listed.
 */
export default function TypeBadge({ type }: { type: DocumentType }) {
  return <span className={`type-badge type-badge--${type.toLowerCase()}`}>{LABELS[type]}</span>;
}
