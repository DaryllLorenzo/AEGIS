"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  FileCheck2,
  FilePlus2,
  FileUp,
} from "lucide-react";

import GroupTabs from "@/components/aegis/GroupTabs";
import { useGroup } from "@/hooks/useGroup";
import { useDocuments } from "@/hooks/useDocuments";
import { useReviews } from "@/hooks/useReviews";
import { useFetch } from "@/hooks/useFetch";
import { getGroupMembers, initialsFromName } from "@/lib/api";
import { reviewStatusLabel } from "@/lib/utils";
import type { UserDto } from "@/lib/api";

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

  const members: UserDto[] = membersData ?? [];

  const documents = docData?.items ?? [];
  const docIds = useMemo(() => new Set(documents.map((d) => d.id)), [documents]);
  const reviews = useMemo(
    () => (reviewData?.items ?? []).filter((r) => docIds.has(r.documentId)),
    [reviewData, docIds],
  );

  const openCount = reviews.filter((r) => r.status !== "Completed").length;
  const completedCount = reviews.filter((r) => r.status === "Completed").length;
  const latestReview = reviews.reduce<typeof reviews[number] | null>(
    (latest, r) =>
      !latest || new Date(r.createdAt) > new Date(latest.createdAt) ? r : latest,
    null,
  );
  const docById = useMemo(
    () => new Map(documents.map((d) => [d.id, d])),
    [documents],
  );

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
      <GroupTabs groupId={groupId} active="overview" />

      <div className="group-layout">
        <div className="group-layout__main">
          <section className="content-panel research-topic">
            <div className="section-heading section-heading--compact">
              <div>
                <p className="eyebrow">About</p>
                <h2>Research topic</h2>
              </div>
              <Link className="text-link" href={`/groups/${groupId}/documents`}>
                Documents <ArrowRight size={16} />
              </Link>
            </div>
            <p>{group?.description || "No description provided for this group yet."}</p>
          </section>

          <section className="content-panel">
            <div className="section-heading section-heading--compact">
              <div>
                <p className="eyebrow">Quick actions</p>
                <h2>Start working</h2>
              </div>
            </div>
            <div className="action-row">
              <Link className="action-card" href={`/reviews/new?groupId=${groupId}`}>
                <span className="action-card__icon">
                  <FilePlus2 size={20} />
                </span>
                <span className="action-card__copy">
                  <strong>New document</strong>
                  <p>Upload a PDF and start a review round.</p>
                </span>
                <ArrowUpRight size={17} className="action-card__arrow" />
              </Link>
              <Link className="action-card" href={`/groups/${groupId}/reviews`}>
                <span className="action-card__icon action-card__icon--amber">
                  <FileCheck2 size={20} />
                </span>
                <span className="action-card__copy">
                  <strong>Review rounds</strong>
                  <p>See every review for this group&apos;s documents.</p>
                </span>
                <ArrowUpRight size={17} className="action-card__arrow" />
              </Link>
            </div>
          </section>
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
                <strong>{openCount}</strong>
                Open reviews
              </span>
              <span>
                <strong>{completedCount}</strong>
                Completed
              </span>
              <span>
                <strong>{documents.filter((d) => d.parentId).length}</strong>
                Versions
              </span>
            </div>
          </section>

          <section className="content-panel">
            <div className="section-heading section-heading--compact">
              <div>
                <p className="eyebrow">Membership</p>
                <h2>Members</h2>
              </div>
            </div>
            {members.length === 0 ? (
              <p className="muted">No members linked to this group yet.</p>
            ) : (
              <ul className="member-list">
                {members.map((m) => (
                  <li key={m.id} className="member-list__row">
                    <span className="member-list__avatar" aria-hidden="true">
                      {initialsFromName(m.displayName)}
                    </span>
                    <span className="member-list__name">{m.displayName}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {latestReview && (
            <Link
              className="content-panel latest-review"
              href={`/reviews/${latestReview.id}`}
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
                {latestReview.version ? ` · ${latestReview.version}` : ""}
              </p>
              <span className={`status-pill status-pill--${latestReview.status.toLowerCase()}`}>
                {reviewStatusLabel(latestReview.status)}
              </span>
            </Link>
          )}

          <section className="content-panel upload-hint">
            <div className="section-heading section-heading--compact">
              <div>
                <p className="eyebrow">Tip</p>
                <h2>New version?</h2>
              </div>
            </div>
            <p>
              When a document is revised, upload it from the documents page and
              it will automatically nest under the original as a child version.
            </p>
            <Link className="button button--secondary button--sm" href={`/groups/${groupId}/documents`}>
              <FileUp size={15} />
              Open documents
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
