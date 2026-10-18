"use client";

import { Fragment } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { reviewStatusLabel } from "@aegis/domain";
import type { DocumentDto, Review } from "@aegis/domain";
import { cn } from "cn";

type VersionChainProps = {
  docs: DocumentDto[];
  reviews: Review[];
  currentDocId: string;
  /** Show document names inside the chips (default: compact v-chips only). */
  showNames?: boolean;
};

/**
 * Compact version lineage: walks the parent chain of a document and renders
 * one chip per version (v1 -> v2 -> v3), highlighting the current one and
 * linking each version to its latest review.
 */
export default function VersionChain({
  docs,
  reviews,
  currentDocId,
  showNames = false,
}: VersionChainProps) {
  const byId = new Map(docs.map((d) => [d.id, d]));

  const reviewByDoc = new Map<string, Review>();
  for (const review of reviews) {
    const existing = reviewByDoc.get(review.documentId);
    if (!existing || new Date(review.createdAt) > new Date(existing.createdAt)) {
      reviewByDoc.set(review.documentId, review);
    }
  }

  const chain: DocumentDto[] = [];
  let current = byId.get(currentDocId);
  let guard = 0;
  while (current && guard++ < 100) {
    chain.unshift(current);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }

  if (chain.length < 2) return null;

  return (
    <ol className="flex flex-wrap items-center gap-1.5" aria-label="Version history">
      {chain.map((doc) => {
        const version = doc.version;
        const review = reviewByDoc.get(doc.id);
        const isCurrent = doc.id === currentDocId;

        const chipClass = cn(
          "inline-flex flex-wrap items-center gap-1.5 rounded-lg border bg-card px-2.5 py-1.5 text-xs transition",
          isCurrent && "border-primary ring-2 ring-primary/15",
        );

        return (
          <Fragment key={doc.id}>
            {chain.indexOf(doc) > 0 && (
              <ArrowRight className="size-3 shrink-0 text-muted-foreground" aria-hidden="true" />
            )}
            <li>
              {review ? (
                <Link
                  className={cn(chipClass, "hover:border-primary hover:shadow-sm")}
                  href={`/groups/${doc.groupId}/reviews/${review.id}/workspace`}
                  title={`Version ${version} — ${doc.name} (${reviewStatusLabel(review.status)})`}
                >
                  <code className="rounded border bg-muted px-1.5 py-0.5 text-primary">
                    v{version}
                  </code>
                  {showNames && (
                    <span className="max-w-[180px] truncate font-semibold">{doc.name}</span>
                  )}
                  {review.status !== "Completed" && (
                    <em
                      className={cn(
                        "text-[0.68rem] font-bold uppercase not-italic",
                        review.status === "InProgress" ? "text-warning" : "text-info",
                      )}
                    >
                      {reviewStatusLabel(review.status)}
                    </em>
                  )}
                  {isCurrent && (
                    <em className="rounded bg-primary px-1.5 py-0.5 text-[0.64rem] font-bold tracking-wide text-primary-foreground uppercase not-italic">
                      Current
                    </em>
                  )}
                </Link>
              ) : (
                <span className={chipClass} title={`Version ${version} — ${doc.name}`}>
                  <code className="rounded border bg-muted px-1.5 py-0.5 text-primary">
                    v{version}
                  </code>
                  {showNames && (
                    <span className="max-w-[180px] truncate font-semibold">{doc.name}</span>
                  )}
                  {isCurrent && (
                    <em className="rounded bg-primary px-1.5 py-0.5 text-[0.64rem] font-bold tracking-wide text-primary-foreground uppercase not-italic">
                      Current
                    </em>
                  )}
                </span>
              )}
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}
