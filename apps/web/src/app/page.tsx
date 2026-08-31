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

import AppShell from "@/components/aegis/AppShell";
import Avatar from "@/components/aegis/Avatar";
import StatusPill from "@/components/aegis/StatusPill";
import { pendingReviews } from "@/lib/mock-data";

const metrics = [
  { label: "Pending reviews", value: 4, note: "Requires action", icon: ClipboardCheck, tone: "blue" },
  { label: "Due soon", value: 2, note: "Next 48 hours", icon: Clock3, tone: "amber" },
  { label: "Completed this month", value: 7, note: "On track", icon: CheckCircle2, tone: "green" },
];

export default function Home() {
  return (
    <AppShell>
      <div className="page-container dashboard-page">
        <div className="page-heading page-heading--split">
          <div>
            <p className="eyebrow">Sunday, August 30</p>
            <h1>Good morning, María</h1>
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
            {pendingReviews.map((review) => (
              <article className={`review-card review-card--${review.status.toLowerCase().replace(" ", "-")}`} key={review.id}>
                <div className="review-card__topline">
                  <span className="review-card__group"><i />{review.group}</span>
                  <StatusPill status={review.status} />
                </div>
                <h3>{review.kind} <span>—</span> {review.title}</h3>
                <div className="review-card__metadata">
                  <code>Review #{review.id}</code>
                  <span className={review.dueTone === "urgent" ? "is-urgent" : ""}>
                    <CalendarDays size={15} /> Due {review.due}
                  </span>
                </div>
                <div className="review-card__footer">
                  <div>
                    <span><UserRoundPlus size={15} /> Assigned by {review.assignee}</span>
                    <span><MessageSquareText size={15} /> {review.annotations} annotations</span>
                  </div>
                  <div className="avatar-stack" aria-label={`${review.reviewers.length} reviewers`}>
                    {review.reviewers.map((reviewer, index) => <Avatar key={reviewer} initials={reviewer} tone={index === 1 ? "blue" : "sage"} size="sm" />)}
                  </div>
                  <Link className={`button ${review.status === "Open" ? "button--primary" : "button--secondary"}`} href={review.id === 4 ? "/reviews/adaptive-learning" : "/reviews/image-segmentation"}>
                    {review.status === "Open" ? "Start review" : "Continue"}
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
