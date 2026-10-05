"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import {
  ArrowUpRight,
  FileUp,
} from "lucide-react";

import DocumentTree, {
  buildDocumentTree,
  buildReviewMap,
} from "@/components/aegis/DocumentTree";
import StatusPill from "@/components/aegis/StatusPill";
import TypeBadge from "@/components/aegis/TypeBadge";
import { useGroup } from "@/hooks/useGroup";
import { useDocuments } from "@/hooks/useDocuments";
import { useReviews } from "@/hooks/useReviews";
import { useFetch } from "@/hooks/useFetch";
import { getGroupMembers, initialsFromName } from "@/lib/api";
import { reviewStatusLabel } from "@/lib/utils";
import type { GroupMember } from "@/lib/api";

export default function GroupOverviewPage() {
  const params = useParams();
  const groupId = params?.id as string;

  const { data: group, error } = useGroup(groupId);
  const { data: docData } = useDocuments(1, 100, groupId);
  const { data: reviewData } = useReviews(1, 100);
  const { data: membersData } = useFetch(
    () => getGroupMembers(groupId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [groupId],
  );

  const members: GroupMember[] = membersData ?? [];
  const documents = docData?.items ?? [];
  const docIds = useMemo(() => new Set(documents.map((d) => d.id)), [documents]);
  const reviews = useMemo(
    () => (reviewData?.items ?? []).filter((r) => docIds.has(r.documentId)),
    [reviewData, docIds],
  );
  const docById = useMemo(
    () => new Map(documents.map((d) => [d.id, d])),
    [documents],
  );
  const nodes = useMemo(() => buildDocumentTree(documents), [documents]);
  const reviewsByDocument = useMemo(
    () => buildReviewMap(reviews),
    [reviews],
  );

  const openCount = reviews.filter((r) => r.status !== "Completed").length;
  const completedCount = reviews.filter((r) => r.status === "Completed").length;
  const latestReview = useMemo(
    () =>
      reviews.reduce<typeof reviews[number] | null>(
        (latest, r) =>
          !latest || new Date(r.createdAt) > new Date(latest.createdAt) ? r : latest,
        null,
      ),
    [reviews],
  );
  const primaryDoc = useMemo(() => {
    if (documents.length === 0) return null;
    return [...documents].sort((a, b) => a.version - b.version).at(-1) ?? null;
  }, [documents]);
  const versionsCount = documents.length;

  if (error) {
    return (
      <div className="page-container">
        <p>{error}</p>
        <Link href="/groups">Back to groups</Link>
      </div>
    );
  }

  return (
    <div className="page-container group-page">
      <div className="breadcrumb">
        <Link href="/groups">Groups</Link>
        <span>/</span>
        <span>{group?.name ?? "Loading..."}</span>
      </div>
      <div className="page-heading">
        <p className="eyebrow">Research group</p>
        <h1 className="serif-title">{group?.name ?? "Loading..."}</h1>
        <p>{group?.description ?? " "}</p>
      </div>

      <div className="group-layout">
        <div className="group-layout__main">
          {documents.length === 0 ? (
            <section className="content-panel">
              <div className="empty-state">
                <FileUp size={28} />
                <strong>No document in review yet in this group.</strong>
                <p>Upload a PDF to start the first review round in this group.</p>
                <Link
                  className="button button--primary"
                  href={`/groups/${groupId}/documents/new`}
                >
                  <FileUp size={16} />
                  Upload document
                </Link>
              </div>
            </section>
          ) : (
            <>
              <section className="content-panel">
                <div className="section-heading section-heading--compact">
                  <div>
                    <p className="eyebrow">Document</p>
                    <h2>Current version</h2>
                  </div>
                </div>
                <div className="doc-tree-title">
                  <strong>{primaryDoc?.name}</strong>
                  {primaryDoc && <code className="doc-tree-version">v{primaryDoc.version}</code>}
                  {primaryDoc && <TypeBadge type={primaryDoc.type} />}
                  {latestReview && <StatusPill status={reviewStatusLabel(latestReview.status)} />}
                </div>
                <div className="detail-hint">
                  {reviews.filter((r) => r.status !== "Completed").length} open review(s);{" "}
                  {completedCount} completed.
                </div>
              </section>

              <section className="content-panel">
                <div className="section-heading section-heading--compact">
                  <div>
                    <p className="eyebrow">Versioning</p>
                    <h2>Document versions</h2>
                  </div>
                </div>
                <DocumentTree nodes={nodes} reviewsByDocument={reviewsByDocument} />
              </section>

              <section className="content-panel">
                <div className="section-heading section-heading--compact">
                  <div>
                    <p className="eyebrow">Review rounds</p>
                    <h2>Reviews for this document</h2>
                  </div>
                </div>
                {reviews.length === 0 ? (
                  <p className="muted">No review rounds yet. Each uploaded version can start one.</p>
                ) : (
                  <ul className="review-list">
                    {reviews
                      .slice()
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .map((review) => {
                        const rDoc = docById.get(review.documentId);
                        return (
                          <li key={review.id} className="review-list__row">
                            <Link
                              className="review-list__main"
                              href={`/groups/${groupId}/reviews/${review.id}/workspace`}
                            >
                              <strong>{review.title}</strong>
                              <small>
                                {rDoc?.name ?? "Document"} · v{rDoc?.version ?? "?"} ·{" "}
                                {review.assigneeName ?? "Unassigned"}
                              </small>
                            </Link>
                            <StatusPill status={reviewStatusLabel(review.status)} />
                            <Link
                              className="button button--secondary button--sm"
                              href={`/groups/${groupId}/reviews/${review.id}/workspace`}
                            >
                              Open review
                            </Link>
                          </li>
                        );
                      })}
                  </ul>
                )}
              </section>
            </>
          )}
        </div>

        <aside className="group-layout__aside">
          <section className="content-panel stats-panel">
            <h2>Group stats</h2>
            <div>
              <span>
                <strong>{documents.length}</strong>
                Documents
              </span>
              <span>
                <strong>{versionsCount}</strong>
                Versions
              </span>
              <span>
                <strong>{members.length}</strong>
                Participants
              </span>
              <span>
                <strong>{openCount}</strong>
                Open reviews
              </span>
              <span>
                <strong>{completedCount}</strong>
                Completed
              </span>
            </div>
          </section>

          <section className="content-panel">
            <div className="section-heading section-heading--compact">
              <div>
                <p className="eyebrow">Membership</p>
                <h2>Participants</h2>
              </div>
            </div>
            {members.length === 0 ? (
              <p className="muted">No participants linked to this group yet.</p>
            ) : (
              <ul className="member-list">
                {members.map((m) => (
                  <li key={m.id} className="member-list__row">
                    <span className="member-list__avatar" aria-hidden="true">
                      {initialsFromName(m.displayName)}
                    </span>
                    <span className="member-list__name">{m.displayName}</span>
                    <span className="member-list__roles">
                      {m.roles.map((role) => (
                        <span
                          key={role}
                          className={`role-badge role-badge--${role.toLowerCase()}`}
                        >
                          {role}
                        </span>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {latestReview && (
            <Link
              className="content-panel latest-review"
              href={`/groups/${groupId}/reviews/${latestReview.id}/workspace`}
            >
              <div className="section-heading section-heading--compact">
                <div>
                  <p className="eyebrow">Latest activity</p>
                  <h2>Most recent review</h2>
                </div>
                <ArrowUpRight size={17} />
              </div>
              <strong>{latestReview.title}</strong>
              <p>
                {docById.get(latestReview.documentId)?.name ?? "Document"}
                {docById.get(latestReview.documentId)?.version
                  ? ` · v${docById.get(latestReview.documentId)!.version}`
                  : ""}
              </p>
              <span className={`status-pill status-pill--${latestReview.status.toLowerCase()}`}>
                {reviewStatusLabel(latestReview.status)}
              </span>
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}
