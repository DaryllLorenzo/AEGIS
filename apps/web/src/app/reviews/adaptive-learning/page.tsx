import Link from "next/link";
import { ArrowRight, ClipboardList, Files, History } from "lucide-react";

import AppShell from "@/components/aegis/AppShell";
import Avatar from "@/components/aegis/Avatar";
import { reviewerProgress } from "@/lib/mock-data";

export default function ReviewOverviewPage() {
  return (
    <AppShell searchPlaceholder="Search reviews...">
      <div className="page-container review-overview-page">
        <div className="breadcrumb"><Link href="/reviews">My Reviews</Link><span>/</span><span>Review #4</span></div>
        <div className="review-title-block">
          <div className="review-title-block__badges"><span className="review-round"><i />Review #4 · Open</span><code>v1.4</code></div>
          <h1 className="serif-title">Adaptive Learning Thesis</h1>
          <p>Uploaded by <strong>Ana Martínez</strong> · 2 days ago</p>
        </div>

        <div className="review-overview-grid">
          <section className="content-panel instruction-panel">
            <div className="panel-heading"><ClipboardList size={21} /><div><p className="eyebrow">Reviewer brief</p><h2>Review instructions</h2></div></div>
            <blockquote>“Please focus on methodology, references, and statistical analysis. Flag claims that require stronger evidence.”</blockquote>
            <div className="review-focus"><span>Methodology</span><span>References</span><span>Statistics</span></div>
            <Link className="button button--primary" href="/reviews/adaptive-learning/workspace">Start review <ArrowRight size={17} /></Link>
          </section>

          <aside className="content-panel reviewers-panel">
            <div className="panel-title"><h2>Reviewers</h2><span>3 assigned</span></div>
            <div className="reviewer-list">
              {reviewerProgress.map((reviewer) => (
                <div className="reviewer-row" key={reviewer.name}>
                  <span className="avatar-status"><Avatar initials={reviewer.initials} tone={reviewer.status === "Completed" ? "sage" : "blue"} /><i className={`status-${reviewer.tone}`} /></span>
                  <strong>{reviewer.name}</strong>
                  <span>{reviewer.status}</span>
                </div>
              ))}
            </div>
            <div className="review-progress"><span><i />1 of 3 completed</span><div><i /></div></div>
          </aside>
        </div>

        <section className="content-panel previous-review-panel">
          <div className="panel-title"><div className="panel-heading"><History size={20} /><h2>Previous reviews</h2></div><Link className="text-link" href="/reviews/adaptive-learning/history">View all history <ArrowRight size={15} /></Link></div>
          <div className="previous-review-row">
            <span className="previous-review-row__icon"><Files size={22} /></span>
            <div><strong>Review #3 <code>v1.3</code></strong><span>Completed Aug 20</span></div>
            <div className="previous-review-row__count"><strong>23</strong><span>Annotations</span></div>
            <Link className="icon-button outlined" href="/reviews/adaptive-learning/history" aria-label="Open previous review"><ArrowRight size={18} /></Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
