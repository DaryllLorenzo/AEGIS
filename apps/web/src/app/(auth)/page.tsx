"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FolderPlus,
  ListChecks,
  PenLine,
  UserRoundPlus,
} from "lucide-react";

import StatusPill from "@/components/aegis/StatusPill";
import NewGroupDialog from "@/components/aegis/NewGroupDialog";
import { useDocuments } from "@/hooks/useDocuments";
import { useReviews } from "@/hooks/useReviews";
import { reviewStatusLabel, reviewStatusClass } from "@/lib/utils";

export default function Home() {
  const { data } = useReviews(1, 20);
  const reviews = data?.items ?? [];
  const { data: docData } = useDocuments(1, 100);
  const docById = useMemo(() => new Map((docData?.items ?? []).map((d) => [d.id, d])), [docData]);
  const [newGroupOpen, setNewGroupOpen] = useState(false);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const metrics = [
    {
      label: "Pending reviews",
      value: reviews.filter((r) => r.status !== "Completed").length,
      note: "Requires action",
      icon: ClipboardCheck,
      tone: "blue",
    },
    {
      label: "Due soon",
      value: reviews.filter(
        (r) => r.dueDate && new Date(r.dueDate).getTime() - Date.now() < 48 * 60 * 60 * 1000,
      ).length,
      note: "Next 48 hours",
      icon: Clock3,
      tone: "amber",
    },
    {
      label: "Completed",
      value: reviews.filter((r) => r.status === "Completed").length,
      note: "All time",
      icon: CheckCircle2,
      tone: "green",
    },
  ];

  const steps = [
    {
      icon: FolderPlus,
      title: "Create a group",
      text: "Organize your research into groups — one per lab or project.",
      action: (
        <button
          className="button button--secondary button--sm"
          type="button"
          onClick={() => setNewGroupOpen(true)}
        >
          <FolderPlus size={15} />
          New group
        </button>
      ),
    },
    {
      icon: ListChecks,
      title: "Set up a review",
      text: "Upload a document or pick an existing one, then assign a reviewer.",
      action: (
        <Link className="button button--secondary button--sm" href="/groups">
          <ListChecks size={15} />
          New review
        </Link>
      ),
    },
    {
      icon: PenLine,
      title: "Review the document",
      text: "Annotate the PDF, flag issues, then complete the review round.",
      action: (
        <Link className="button button--secondary button--sm" href="/groups">
          <PenLine size={15} />
          Open reviews
        </Link>
      ),
    },
  ];

  return (
    <div className="page-container dashboard-page">
      <div className="page-heading page-heading--split">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>{greeting}</h1>
          <p>Here is the status of your research reviews.</p>
        </div>
        <div className="status-legend" aria-label="Review status legend">
          <span><i className="legend-dot legend-dot--green" /> Completed</span>
          <span><i className="legend-dot legend-dot--amber" /> In progress</span>
          <span><i className="legend-dot legend-dot--blue" /> Open</span>
        </div>
      </div>

      <section className="workflow" aria-label="How AEGIS works">
        <div className="workflow__intro">
          <p className="eyebrow">Workflow</p>
          <h2>Start a review in three steps</h2>
        </div>
        <ol className="workflow__steps">
          {steps.map(({ icon: Icon, title, text, action }, i) => (
            <li className="workflow-step" key={title}>
              <span className="workflow-step__number" aria-hidden="true">
                {i + 1}
              </span>
              <span className="workflow-step__icon">
                <Icon size={20} />
              </span>
              <div className="workflow-step__copy">
                <h3>{title}</h3>
                <p>{text}</p>
                {action}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="metrics-grid" aria-label="Review activity">
        {metrics.map(({ label, value, note, icon: Icon, tone }) => (
          <article className="metric-card" key={label}>
            <div className={`metric-card__icon metric-card__icon--${tone}`}>
              <Icon size={21} />
            </div>
            <span className="metric-card__note">{note}</span>
            <strong>{value}</strong>
            <p>{label}</p>
          </article>
        ))}
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Your queue</p>
            <h2>Pending reviews</h2>
          </div>
          <Link className="text-link" href="/groups">
            View all <ArrowRight size={16} />
          </Link>
        </div>

        <div className="review-grid">
          {reviews.map((review) => (
            <article
              className={`review-card review-card--${reviewStatusClass(review.status)}`}
              key={review.id}
            >
              <div className="review-card__topline">
                <span className="review-card__group">
                  <i />
                  {review.kind ?? "Review"}
                </span>
                <StatusPill status={reviewStatusLabel(review.status)} />
              </div>
              <h3>{review.title}</h3>
              <div className="review-card__metadata">
                <code>Review #{review.id.slice(0, 8)}</code>
                <span>
                  <CalendarDays size={15} />
                  Due {review.dueDate ? new Date(review.dueDate).toLocaleDateString() : "TBD"}
                </span>
              </div>
              <div className="review-card__footer">
                <div>
                  {review.assigneeName ? (
                    <span>
                      <UserRoundPlus size={15} />
                      Assigned to {review.assigneeName}
                    </span>
                  ) : (
                    <span>
                      <UserRoundPlus size={15} />
                      Unassigned
                    </span>
                  )}
                </div>
                <Link
                  className={`button ${review.status === "Completed" ? "button--secondary" : "button--primary"}`}
                  href={`/groups/${docById.get(review.documentId)?.groupId ?? ""}/reviews/${review.id}/workspace`}
                >
                  {review.status === "Completed"
                    ? "View"
                    : review.status === "InProgress"
                      ? "Continue"
                      : "Start review"}
                  <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          ))}

          {reviews.length === 0 && (
            <p className="muted">No reviews found. Create one to get started.</p>
          )}
        </div>
      </section>

      <NewGroupDialog
        open={newGroupOpen}
        onClose={() => setNewGroupOpen(false)}
      />
    </div>
  );
}
