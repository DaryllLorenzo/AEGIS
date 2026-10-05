"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  FileUp,
  GitBranchPlus,
  Search,
  ShieldCheck,
} from "lucide-react";

import DocumentTree, {
  buildDocumentTree,
  buildReviewMap,
} from "@/components/aegis/DocumentTree";
import { getReviews } from "@/lib/api";
import { useFetch } from "@/hooks/useFetch";
import { useDocuments } from "@/hooks/useDocuments";
import { useAuth } from "@/lib/auth-context";
import { isReviewOverdue, submissionStatusLabel } from "@/lib/api";
import type { DocumentDto, Review } from "@/lib/api";

type SortKey = "updated" | "name";

export default function SubmissionsPage() {
  const { user } = useAuth();
  const [nonce, setNonce] = useState(0);
  const { data: reviewData, error, loading } = useFetch(
    () => getReviews(1, 100),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nonce],
  );
  const { data: docData } = useDocuments(1, 100);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("updated");

  const reviews = reviewData?.items ?? [];
  const docs = docData?.items ?? [];
  const myUserId = user?.userId;

  // My submissions = reviews I created (the document I submitted for review).
  const myReviews = useMemo(
    () =>
      myUserId ? reviews.filter((r) => r.userId === myUserId) : [],
    [reviews, myUserId],
  );

  // Expand my documents to their full version chains so parent/child
  // context is visible, then render them with the tree visual.
  const treeDocs = useMemo(() => {
    const byId = new Map(docs.map((d) => [d.id, d]));
    const keep = new Set<string>();

    for (const review of myReviews) {
      let current = byId.get(review.documentId);
      let guard = 0;
      // Walk up to the root so the whole version chain is included.
      while (current && guard++ < 100) {
        keep.add(current.id);
        current = current.parentId ? byId.get(current.parentId) : undefined;
      }
    }

    // Also include children (later versions) of every kept document.
    let grew = true;
    while (grew) {
      grew = false;
      for (const doc of docs) {
        if (doc.parentId && keep.has(doc.parentId) && !keep.has(doc.id)) {
          keep.add(doc.id);
          grew = true;
        }
      }
    }

    return docs.filter((d) => keep.has(d.id));
  }, [docs, myReviews]);

  const q = query.trim().toLowerCase();
  const filteredDocs = useMemo(() => {
    if (!q) return treeDocs;
    return treeDocs.filter((d) => d.name.toLowerCase().includes(q));
  }, [treeDocs, q]);

  const sortedDocs = useMemo(
    () =>
      [...filteredDocs].sort((a, b) => {
        if (sort === "name") return a.name.localeCompare(b.name);
        return (
          new Date(b.updatedAt ?? b.createdAt).getTime() -
          new Date(a.updatedAt ?? a.createdAt).getTime()
        );
      }),
    [filteredDocs, sort],
  );

  const nodes = useMemo(
    () => buildDocumentTree(sortedDocs),
    [sortedDocs],
  );
  const reviewsByDocument = useMemo(
    () => buildReviewMap(reviews),
    [reviews],
  );

  const myDocIds = useMemo(
    () => new Set(myReviews.map((r) => r.documentId)),
    [myReviews],
  );

  const counts = useMemo(() => {
    const mine = myReviews;
    return {
      total: myDocIds.size,
      underReview: mine.filter((r) => r.status === "InProgress").length,
      approved: mine.filter((r) => r.status === "Completed").length,
      versions: treeDocs.filter((d) => d.parentId).length,
    };
  }, [myReviews, myDocIds, treeDocs]);

  return (
    <div className="page-container submissions-page">
      <div className="page-heading page-heading--split">
        <div className="page-heading__start">
          <span className="page-heading__icon page-heading__icon--green">
            <FileUp size={22} />
          </span>
          <div>
            <p className="eyebrow">Research objects</p>
            <h1>My submissions</h1>
            <p>
              Documents you have submitted for review, with every version
              nested underneath. Track whether each version is submitted,
              under review, or approved.
            </p>
          </div>
        </div>
        <div className="heading-actions">
          <Link className="button button--primary" href="/reviews/new">
            <GitBranchPlus size={16} />
            Submit a document
          </Link>
        </div>
      </div>

      <section className="metrics-grid metrics-grid--4" aria-label="Submission summary">
        <article className="metric-card">
          <div className="metric-card__icon metric-card__icon--green">
            <FileUp size={21} />
          </div>
          <span className="metric-card__note">Submitted</span>
          <strong>{counts.total}</strong>
          <p>Documents</p>
        </article>
        <article className="metric-card">
          <div className="metric-card__icon metric-card__icon--amber">
            <Search size={21} />
          </div>
          <span className="metric-card__note">With reviewers</span>
          <strong>{counts.underReview}</strong>
          <p>Under review</p>
        </article>
        <article className="metric-card">
          <div className="metric-card__icon metric-card__icon--green">
            <ShieldCheck size={21} />
          </div>
          <span className="metric-card__note">Review closed</span>
          <strong>{counts.approved}</strong>
          <p>Approved</p>
        </article>
        <article className="metric-card">
          <div className="metric-card__icon metric-card__icon--blue">
            <GitBranchPlus size={21} />
          </div>
          <span className="metric-card__note">History</span>
          <strong>{counts.versions}</strong>
          <p>New versions</p>
        </article>
      </section>

      <div className="doc-toolbar">
        <label className="search-field">
          <Search size={17} aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter submissions..."
            aria-label="Filter submissions by name"
          />
        </label>
        <div className="sort-toggle" role="group" aria-label="Sort submissions">
          <button
            type="button"
            className={sort === "updated" ? "is-active" : ""}
            onClick={() => setSort("updated")}
          >
            Recently updated
          </button>
          <button
            type="button"
            className={sort === "name" ? "is-active" : ""}
            onClick={() => setSort("name")}
          >
            Name
          </button>
        </div>
      </div>

      {error && (
        <div className="list-error" role="alert">
          <p>{error}</p>
          <button
            className="button button--secondary button--sm"
            type="button"
            onClick={() => setNonce((n) => n + 1)}
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div aria-busy="true" aria-label="Loading submissions">
          {Array.from({ length: 3 }).map((_, i) => (
            <div className="skeleton-card" key={i}>
              <div className="skeleton skeleton-line skeleton-line--sm" />
              <div className="skeleton skeleton-line skeleton-line--lg" />
              <div className="skeleton skeleton-line" />
            </div>
          ))}
        </div>
      ) : nodes.length > 0 ? (
        <DocumentTree
          nodes={nodes}
          reviewsByDocument={reviewsByDocument}
          openLabel="View review"
          newVersionLabel="Upload new version of {name}"
          statusLabel={submissionStatusLabel}
        />
      ) : (
        <div className="empty-state">
          <FileUp size={28} />
          {q ? (
            <p>No submissions match &ldquo;{q}&rdquo;.</p>
          ) : (
            <>
              <strong>No submissions yet</strong>
              <p>
                Upload a document to start your first review round. Each new
                version you upload is nested under the previous one.
              </p>
              <Link className="button button--primary" href="/reviews/new">
                <FileUp size={16} />
                Submit a document
              </Link>
            </>
          )}
        </div>
      )}

      {!loading && myReviews.some((r) => isReviewOverdue(r)) && (
        <p className="submissions-note">
          <CalendarDays size={15} />
          Some of your submissions are past their review due date.
        </p>
      )}
    </div>
  );
}
