"use client";

import Link from "next/link";
import { Fragment, useMemo } from "react";
import { useParams } from "next/navigation";
import { ArrowRight, CheckCircle2, ClipboardList, FileText } from "lucide-react";

import { useReview } from "@/hooks/useReview";
import { useDocuments } from "@/hooks/useDocuments";
import { useReviews } from "@/hooks/useReviews";
import { reviewStatusLabel } from "@/lib/utils";
import { reviewNextAction } from "@/lib/api";
import type { DocumentDto, Review } from "@/lib/api";

function buildLineage(allDocs: DocumentDto[], currentId: string): DocumentDto[] {
  const byId = new Map(allDocs.map((d) => [d.id, d]));
  const chain: DocumentDto[] = [];
  let current = byId.get(currentId);
  let guard = 0;
  while (current && guard++ < 100) {
    chain.unshift(current);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return chain;
}

function buildReviewMap(reviews: Review[]): Map<string, Review> {
  const map = new Map<string, Review>();
  for (const review of reviews) {
    const existing = map.get(review.documentId);
    if (!existing || new Date(review.createdAt) > new Date(existing.createdAt)) {
      map.set(review.documentId, review);
    }
  }
  return map;
}

export default function ReviewOverviewPage() {
  const params = useParams();
  const reviewId = params?.id as string;

  const { data: review, error } = useReview(reviewId);
  const { data: docData } = useDocuments(1, 100);
  const { data: reviewData } = useReviews(1, 100);

  const lineage = useMemo(() => {
    if (!review) return [];
    return buildLineage(docData?.items ?? [], review.documentId);
  }, [review, docData]);

  const reviewByDocument = useMemo(
    () => buildReviewMap(reviewData?.items ?? []),
    [reviewData],
  );

  const nextAction = review ? reviewNextAction(review.status) : null;

  const document = useMemo(
    () => (docData?.items ?? []).find((d) => d.id === review?.documentId),
    [docData, review],
  );

  if (error) {
    return (
      <div className="page-container">
        <p>{error}</p>
        <Link href="/reviews">Back to reviews</Link>
      </div>
    );
  }

  return (
    <div className="page-container review-overview-page">
      <div className="breadcrumb">
        <Link href="/reviews">My Reviews</Link>
        <span>/</span>
        <span>{review?.title ?? "Loading..."}</span>
      </div>

      <div className="review-title-block">
        <div className="review-title-block__badges">
          <span className="review-round">
            <i />
            Review · {review ? reviewStatusLabel(review.status) : "Loading"}
          </span>
          {review?.version && <code>{review.version}</code>}
        </div>
        <h1 className="serif-title">{review?.title ?? "Loading..."}</h1>
        <p>
          {document ? (
            <>
              Document <strong>{document.name}</strong>
              {document.totalPages ? ` · ${document.totalPages} pages` : ""}
              {review?.assignee ? ` · assigned to ${review.assignee}` : ""}
            </>
          ) : (
            "Loading document details..."
          )}
        </p>
      </div>

      {lineage.length > 1 && (
        <section className="content-panel lineage-panel">
          <div className="section-heading section-heading--compact">
            <div>
              <p className="eyebrow">Document lineage</p>
              <h2>Version history</h2>
            </div>
          </div>
          <ol className="lineage">
            {lineage.map((doc, index) => {
              const version = index + 1;
              const versionReview = reviewByDocument.get(doc.id);
              const isCurrent = doc.id === review?.documentId;
              return (
                <Fragment key={doc.id}>
                  {index > 0 && (
                    <ArrowRight className="lineage-sep" size={14} aria-hidden="true" />
                  )}
                  <li>
                    {versionReview ? (
                      <Link
                        className={`lineage-chip${isCurrent ? " lineage-chip--current" : ""}`}
                        href={`/reviews/${versionReview.id}`}
                      >
                        <code>v{version}</code>
                        <span>{doc.name}</span>
                        {versionReview.status !== "Completed" && (
                          <em className="lineage-chip__status">
                            {reviewStatusLabel(versionReview.status)}
                          </em>
                        )}
                        {isCurrent && <em className="lineage-chip__current">Current</em>}
                      </Link>
                    ) : (
                      <span
                        className={`lineage-chip lineage-chip--plain${isCurrent ? " lineage-chip--current" : ""}`}
                      >
                        <code>v{version}</code>
                        <span>{doc.name}</span>
                        {isCurrent && <em className="lineage-chip__current">Current</em>}
                      </span>
                    )}
                  </li>
                </Fragment>
              );
            })}
          </ol>
        </section>
      )}

      <div className="review-overview-grid">
        <section className="content-panel instruction-panel">
          <div className="panel-heading">
            <ClipboardList size={21} />
            <div>
              <p className="eyebrow">Reviewer brief</p>
              <h2>Review instructions</h2>
            </div>
          </div>
          <blockquote>
            &ldquo;Please focus on methodology, references, and statistical
            analysis. Flag claims that require stronger evidence.&rdquo;
          </blockquote>
          <div className="review-focus">
            <span>Methodology</span>
            <span>References</span>
            <span>Statistics</span>
          </div>
          {nextAction ? (
            <Link className="button button--primary" href={`/reviews/${reviewId}/workspace`}>
              {nextAction.label} <ArrowRight size={17} />
            </Link>
          ) : (
            <div className="review-closed-note">
              <CheckCircle2 size={16} />
              This review round is closed. Upload a new version to start
              another round.
            </div>
          )}
        </section>

        <aside className="review-overview__aside">
          <section className="content-panel">
            <div className="panel-heading">
              <FileText size={19} />
              <div>
                <p className="eyebrow">Document</p>
                <h2>Details</h2>
              </div>
            </div>
            <dl className="detail-list">
              <div>
                <dt>Name</dt>
                <dd>{document?.name ?? "—"}</dd>
              </div>
              <div>
                <dt>Pages</dt>
                <dd>{document?.totalPages ?? "—"}</dd>
              </div>
              <div>
                <dt>Version lineage</dt>
                <dd>{lineage.length > 0 ? `v${lineage.length}` : "—"}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{review ? reviewStatusLabel(review.status) : "—"}</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}
