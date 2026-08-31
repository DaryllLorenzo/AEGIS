import { ArrowRight, CheckCircle2, Clock3 } from "lucide-react";
import Link from "next/link";

import AppShell from "@/components/aegis/AppShell";
import GroupTabs from "@/components/aegis/GroupTabs";

export default function GroupReviewsPage() {
  return (
    <AppShell searchPlaceholder="Search group reviews...">
      <div className="page-container">
        <div className="breadcrumb"><Link href="/groups">Groups</Link><span>/</span><Link href="/groups/ai-in-education">AI in Education</Link><span>/</span><span>Reviews</span></div>
        <div className="page-heading"><p className="eyebrow">AI in Education</p><h1>Review rounds</h1><p>Current and completed reviews for documents in this research group.</p></div>
        <GroupTabs active="reviews" />
        <div className="navigation-grid">
          <Link className="navigation-card" href="/reviews/adaptive-learning"><span className="navigation-card__icon"><Clock3 size={21} /></span><span className="navigation-card__copy"><h2>Adaptive Learning Thesis - Review #4</h2><p>Three reviewers are evaluating version 1.4.</p><small>Open - 1 of 3 completed</small></span><ArrowRight size={18} /></Link>
          <Link className="navigation-card" href="/reviews/adaptive-learning/history"><span className="navigation-card__icon"><CheckCircle2 size={21} /></span><span className="navigation-card__copy"><h2>Completed review history</h2><p>Browse previous rounds, versions, and annotation counts.</p><small>3 completed rounds</small></span><ArrowRight size={18} /></Link>
        </div>
      </div>
    </AppShell>
  );
}
