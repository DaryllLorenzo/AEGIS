"use client";

import { Fragment } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { DocumentDto, Review } from "@/lib/api";
import { reviewStatusLabel } from "@/lib/utils";

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
    <ol className="lineage lineage--compact" aria-label="Version history">
      {chain.map((doc) => {
        const version = doc.version;
        const review = reviewByDoc.get(doc.id);
        const isCurrent = doc.id === currentDocId;

        return (
          <Fragment key={doc.id}>
            {chain.indexOf(doc) > 0 && (
              <ArrowRight className="lineage-sep" size={12} aria-hidden="true" />
            )}
            <li>
              {review ? (
                <Link
                  className={`lineage-chip${isCurrent ? " lineage-chip--current" : ""}`}
                  href={`/reviews/${review.id}`}
                  title={`Version ${version} — ${doc.name} (${reviewStatusLabel(review.status)})`}
                >
                  <code>v{version}</code>
                  {showNames && <span>{doc.name}</span>}
                  {review.status !== "Completed" && (
                    <em
                      className={`lineage-chip__status lineage-chip__status--${review.status.toLowerCase()}`}
                    >
                      {reviewStatusLabel(review.status)}
                    </em>
                  )}
                  {isCurrent && (
                    <em className="lineage-chip__current">Current</em>
                  )}
                </Link>
              ) : (
                <span
                  className={`lineage-chip lineage-chip--plain${isCurrent ? " lineage-chip--current" : ""}`}
                  title={`Version ${version} — ${doc.name}`}
                >
                  <code>v{version}</code>
                  {showNames && <span>{doc.name}</span>}
                  {isCurrent && (
                    <em className="lineage-chip__current">Current</em>
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
