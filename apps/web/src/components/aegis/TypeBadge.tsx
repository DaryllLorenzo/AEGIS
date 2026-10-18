import type { DocumentType } from "@aegis/domain";

import { Badge } from "@/components/ui/badge";
import { cn } from "cn";

const LABELS: Record<DocumentType, string> = {
  Thesis: "Thesis",
  Article: "Article",
};

const TONES: Record<string, string> = {
  thesis: "border-info/30 bg-info/10 text-info",
  article: "border-violet-300 bg-violet-500/10 text-violet-600",
};

/**
 * Small chip that identifies a document's type
 * (Thesis / Article). Used wherever documents are listed.
 */
export default function TypeBadge({ type }: { type: DocumentType }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded font-bold tracking-wide uppercase",
        TONES[type.toLowerCase()] ?? TONES.thesis,
      )}
    >
      {LABELS[type]}
    </Badge>
  );
}
