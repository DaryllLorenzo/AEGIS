"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  FileText,
  Folder,
  ListChecks,
  Play,
  Search,
  UserRound,
  Zap,
} from "lucide-react";

import StatusPill from "@/components/aegis/StatusPill";
import VersionChain from "@/components/aegis/VersionChain";
import { getReviews, updateReview } from "@/lib/api";
import { useFetch } from "@/hooks/useFetch";
import { useDocuments } from "@/hooks/useDocuments";
import { useGroups } from "@/hooks/useGroups";
import { useAuth } from "@/lib/auth-context";
import { reviewStatusLabel, reviewStatusClass } from "@/lib/utils";
import {
  isReviewOverdue,
  nextReviewStatus,
  reviewNextAction,
  REVIEW_STATUS_ORDER,
  type Review,
  type DocumentDto,
  type GroupDto,
} from "@/lib/api";

type Filter = "all" | "to-start" | "in-progress" | "completed" | "overdue";
type SortKey = "dueDate" | "title" | "status";
type Scope = "mine" | "all";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "to-start", label: "To start" },
  { key: "in-progress", label: "In progress" },
  { key: "completed", label: "Completed" },
  { key: "overdue", label: "Overdue" },
];

export default function ReviewsPage() {
  const { user } = useAuth();
  const [nonce, setNonce] = useState(0);
  const { data: reviewData, error, loading } = useFetch(
    () => getReviews(1, 100),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nonce],
  );
  const { data: docData } = useDocuments(1, 100);
  const { data: groupData } = useGroups(1, 100);

  const [scope, setScope] = useState<Scope>("mine");
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("dueDate");

  const reviews = reviewData?.items ?? [];
  const docs = docData?.items ?? [];
  const groups = groupData?.items ?? [];
  const myName = user?.displayName;

  const docById = useMemo(
    () => new Map(docs.map((d) => [d.id, d])),
    [docs],
  );
  const groupById = useMemo(
    () => new Map(groups.map((g) => [g.id, g])),
    [groups],
  );

  // Scope: reviews assigned to me (assignee matches my display name) or all.
  const scoped = useMemo(() => {
    if (scope === "all" || !myName) return reviews;
    const name = myName.trim().toLowerCase();
    return reviews.filter(
      (r) => r.assignee && r.assignee.trim().toLowerCase() === name,
    );
  }, [reviews, scope, myName]);

  const counts = useMemo(
    () => ({
      all: scoped.length,
      "to-start": scoped.filter((r) => r.status === "Pending").length,
      "in-progress": scoped.filter((r) => r.status === "InProgress").length,
      completed: scoped.filter((r) => r.status === "Completed").length,
      overdue: scoped.filter(isReviewOverdue).length,
    }),
    [scoped],
  );

  const visible = useMemo(() => {
    let list = scoped;
    if (filter === "to-start") list = list.filter((r) => r.status === "Pending");
    if (filter === "in-progress")
      list = list.filter((r) => r.status === "InProgress");
    if (filter === "completed")
      list = list.filter((r) => r.status === "Completed");
    if (filter === "overdue") list = list.filter(isReviewOverdue);

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((r) => {
        const doc = docById.get(r.documentId);
        return (
          r.title.toLowerCase().includes(q) ||
          r.kind?.toLowerCase().includes(q) ||
          r.assignee?.toLowerCase().includes(q) ||
          doc?.name.toLowerCase().includes(q)
        );
      });
    }

    return [...list].sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "status")
        return REVIEW_STATUS_ORDER[a.status] - REVIEW_STATUS_ORDER[b.status];
      const ad = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      const bd = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
      return ad - bd;
    });
  }, [scoped, filter, query, sort, docById]);

  return (
    <div className="page-container reviews-page">
      <div className="page-heading page-heading--split">
        <div className="page-heading__start">
          <span className="page-heading__icon page-heading__icon--blue">
            <ClipboardList size={22} />
          </span>
          <div>
            <p className="eyebrow">Review queue</p>
            <h1>My reviews</h1>
            <p>
              Review rounds assigned to you. Start pending reviews, continue
              open ones, and close them out when the annotation pass is done.
            </p>
          </div>
        </div>
        <div className="heading-actions">
          <Link className="button button--primary" href="/reviews/new">
            <ListChecks size={16} />
            New review
          </Link>
        </div>
      </div>

      <section className="metrics-grid metrics-grid--4" aria-label="Review summary">
        <article className="metric-card">
          <div className="metric-card__icon metric-card__icon--blue">
            <Play size={21} />
          </div>
          <span className="metric-card__note">Next action</span>
          <strong>{counts["to-start"]}</strong>
          <p>To start</p>
        </article>
        <article className="metric-card">
          <div className="metric-card__icon metric-card__icon--amber">
            <Zap size={21} />
          </div>
          <span className="metric-card__note">Annotation pass</span>
          <strong>{counts["in-progress"]}</strong>
          <p>In progress</p>
        </article>
        <article className="metric-card">
          <div className="metric-card__icon metric-card__icon--green">
            <ListChecks size={21} />
          </div>
          <span className="metric-card__note">All time</span>
          <strong>{counts.completed}</strong>
          <p>Completed</p>
        </article>
        <article className="metric-card">
          <div className="metric-card__icon metric-card__icon--red">
            <CalendarDays size={21} />
          </div>
          <span className="metric-card__note">Past due date</span>
          <strong>{counts.overdue}</strong>
          <p>Overdue</p>
        </article>
      </section>

      <div className="list-toolbar">
        <div className="segmented segmented--auto" role="group" aria-label="Review scope">
          <button
            type="button"
            className={scope === "mine" ? "is-active" : ""}
            onClick={() => setScope("mine")}
          >
            <UserRound size={15} />
            Assigned to me
          </button>
          <button
            type="button"
            className={scope === "all" ? "is-active" : ""}
            onClick={() => setScope("all")}
          >
            All reviews
          </button>
        </div>
        <label className="search-field">
          <Search size={17} aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, document, or reviewer..."
            aria-label="Search reviews"
          />
        </label>
        <div className="sort-toggle" role="group" aria-label="Sort reviews">
          <button
            type="button"
            className={sort === "dueDate" ? "is-active" : ""}
            onClick={() => setSort("dueDate")}
          >
            Due date
          </button>
          <button
            type="button"
            className={sort === "title" ? "is-active" : ""}
            onClick={() => setSort("title")}
          >
            Title
          </button>
          <button
            type="button"
            className={sort === "status" ? "is-active" : ""}
            onClick={() => setSort("status")}
          >
            Status
          </button>
        </div>
      </div>

      <ul className="filter-tabs" role="group" aria-label="Filter reviews">
        {FILTERS.map(({ key, label }) => (
          <li key={key}>
            <button
              type="button"
              className={filter === key ? "is-active" : ""}
              onClick={() => setFilter(key)}
            >
              {label}
              <span className="count">{counts[key]}</span>
            </button>
          </li>
        ))}
      </ul>

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
        <div className="review-grid" aria-busy="true" aria-label="Loading reviews">
          {Array.from({ length: 4 }).map((_, i) => (
            <div className="skeleton-card" key={i}>
              <div className="skeleton skeleton-line skeleton-line--sm" />
              <div className="skeleton skeleton-line skeleton-line--lg" />
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-line skeleton-line--sm" />
            </div>
          ))}
        </div>
      ) : visible.length > 0 ? (
        <div className="review-grid">
          {visible.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              doc={docById.get(review.documentId)}
              group={
                docById.get(review.documentId)
                  ? groupById.get(docById.get(review.documentId)!.groupId)
                  : undefined
              }
              docs={docs}
              reviews={reviews}
              onChanged={() => setNonce((n) => n + 1)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <ClipboardList size={28} />
          {scoped.length === 0 && scope === "mine" ? (
            <>
              <strong>Nothing is assigned to you</strong>
              <p>
                When a review is assigned to you it shows up here with its
                status, due date, and next action.
              </p>
              <button
                className="button button--secondary"
                type="button"
                onClick={() => setScope("all")}
              >
                View all reviews
              </button>
            </>
          ) : (
            <>
              <strong>No reviews match this view</strong>
              <p>Try a different filter or clear the search.</p>
              <button
                className="button button--secondary"
                type="button"
                onClick={() => {
                  setFilter("all");
                  setQuery("");
                }}
              >
                Clear filters
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

type ReviewCardProps = {
  review: Review;
  doc?: DocumentDto;
  group?: GroupDto;
  docs: DocumentDto[];
  reviews: Review[];
  onChanged: () => void;
};

function ReviewCard({
  review,
  doc,
  group,
  docs,
  reviews,
  onChanged,
}: ReviewCardProps) {
  const [busy, setBusy] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  const action = reviewNextAction(review.status);
  const overdue = isReviewOverdue(review);

  /**
   * Quick action: performs the single legal transition for the
   * current status (Pending -> InProgress, InProgress -> Completed)
   * and refetches the queue. Never sends an invalid transition.
   */
  async function handleQuickAction() {
    if (!action || busy) return;
    const target = nextReviewStatus(review.status);
    if (!target) return;

    setBusy(true);
    setCardError(null);
    try {
      await updateReview(review.id, {
        title: review.title,
        kind: review.kind ?? undefined,
        version: review.version ?? undefined,
        status: target,
        dueDate: review.dueDate ?? undefined,
        assignee: review.assignee ?? undefined,
      });
      onChanged();
    } catch (err) {
      setCardError(
        err instanceof Error
          ? err.message
          : "Could not update the review. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <article
      className={`review-card review-card--${reviewStatusClass(review.status)}`}
    >
      <div className="review-card__topline">
        <span className="review-card__group">
          <i />
          {review.kind ?? "Review"}
        </span>
        <StatusPill status={reviewStatusLabel(review.status)} />
      </div>

      <h3>
        <Link className="review-card__title-link" href={`/reviews/${review.id}`}>
          {review.title}
        </Link>
      </h3>

      {doc && (
        <VersionChain docs={docs} reviews={reviews} currentDocId={doc.id} />
      )}

      <div className="review-card__metadata">
        {doc && (
          <span>
            <FileText size={15} />
            {doc.name}
          </span>
        )}
        {group && (
          <span>
            <Folder size={15} />
            {group.name}
          </span>
        )}
        <span className={overdue ? "is-urgent" : undefined}>
          <CalendarDays size={15} />
          {overdue ? "Overdue " : "Due "}
          {review.dueDate
            ? new Date(review.dueDate).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })
            : "TBD"}
        </span>
        <span>
          <UserRound size={15} />
          {review.assignee ?? "Unassigned"}
        </span>
      </div>

      {cardError && (
        <p className="review-card__error" role="alert">
          {cardError}
        </p>
      )}

      <div className="review-card__footer">
        <div>
          {action ? (
            <span className="review-card__next">
              <Zap size={14} />
              Next: {action.label}
            </span>
          ) : (
            <span className="review-card__done">Review round closed</span>
          )}
        </div>
        <div className="review-card__cta">
          {review.status === "Completed" ? (
            <Link
              className="button button--secondary"
              href={`/reviews/${review.id}`}
            >
              View <ArrowRight size={16} />
            </Link>
          ) : (
            <>
              <Link
                className="button button--secondary button--sm"
                href={`/reviews/${review.id}`}
              >
                {review.status === "InProgress" ? "Continue" : "Open"}
              </Link>
              <button
                className="button button--primary"
                type="button"
                onClick={handleQuickAction}
                disabled={busy}
                title={action?.hint}
              >
                {busy ? "Saving..." : action?.label}
                <ArrowRight size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
