"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  MessageSquareText,
  UserRoundPlus,
} from "lucide-react";
import { useEffect, useState } from "react";

import AppShell from "@/components/aegis/AppShell";
import AuthGuard from "@/components/aegis/AuthGuard";
import StatusPill from "@/components/aegis/StatusPill";
import { getReviews, reviewStatusLabel, reviewStatusClass, type Review } from "@/lib/api";

export default function Home() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    getReviews(1, 20)
      .then((r) => setReviews(r.items))
      .catch(() => setReviews([]));
  }, []);

  const metrics = [
    { label: "Pending reviews", value: reviews.filter((r) => r.status !== "Completed").length, note: "Requires action", icon: ClipboardCheck, tone: "blue" },
    { label: "Due soon", value: reviews.filter((r) => r.dueDate && new Date(r.dueDate).getTime() - Date.now() < 48 * 60 * 60 * 1000).length, note: "Next 48 hours", icon: Clock3, tone: "amber" },
    { label: "Completed this month", value: reviews.filter((r) => r.status === "Completed").length, note: "On track", icon: CheckCircle2, tone: "green" },
  ];

  return (
    <AuthGuard>
      <AppShell>
        <div className="page-container dashboard-page">
          <div className="page-heading page-heading--split">
            <div>
              <p className="eyebrow">Dashboard</p>
              <h1>Good morning</h1>
              <p>Here is the status of your research reviews.</p>
            </div>
            <div className="status-legend" aria-label="Review status legend">
              <span><i className="legend-dot legend-dot--green" /> Completed</span>
              <span><i className="legend-dot legend-dot--amber" /> In progress</span>
              <span><i className="legend-dot legend-dot--blue" /> Open</span>
            </div>
          </div>

          <section className="metrics-grid" aria-label="Review activity">
            {metrics.map(({ label, value, note, icon: Icon, tone }) => (
              <article className="metric-card" key={label}>
                <div className={`metric-card__icon metric-card__icon--${tone}`}><Icon size={21} /></div>
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
              <Link className="text-link" href="/reviews">View all <ArrowRight size={16} /></Link>
            </div>

            <div className="review-grid">
              {reviews.map((review) => (
                <article className={`review-card review-card--${reviewStatusClass(review.status)}`} key={review.id}>
                  <div className="review-card__topline">
                    <span className="review-card__group"><i />{review.kind ?? "Review"}</span>
                    <StatusPill status={reviewStatusLabel(review.status)} />
                  </div>
                  <h3>{review.kind} <span>&mdash;</span> {review.title}</h3>
                  <div className="review-card__metadata">
                    <code>Review #{review.id.slice(0, 8)}</code>
                    <span>
                      <CalendarDays size={15} /> Due {review.dueDate ? new Date(review.dueDate).toLocaleDateString() : "TBD"}
                    </span>
                  </div>
                  <div className="review-card__footer">
                    <div>
                      {review.assignee && (
                        <span><UserRoundPlus size={15} /> Assigned by {review.assignee}</span>
                      )}
                    </div>
                    <Link className={`button ${review.status === "Pending" ? "button--primary" : "button--secondary"}`} href={`/reviews/${review.id}`}>
                      {review.status === "Pending" ? "Start review" : "Continue"}
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
        </div>
      </AppShell>
    </AuthGuard>
  );
}
