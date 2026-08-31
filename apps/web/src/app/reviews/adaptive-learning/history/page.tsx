import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

import AppShell from "@/components/aegis/AppShell";

const rounds = [
  { id: 3, version: "v1.3", date: "Aug 20", annotations: 23 },
  { id: 2, version: "v1.2", date: "Aug 10", annotations: 11 },
  { id: 1, version: "v1.0", date: "Jul 28", annotations: 8 },
];

export default function ReviewHistoryPage() {
  return (
    <AppShell searchPlaceholder="Search review history...">
      <div className="page-container">
        <div className="breadcrumb"><Link href="/reviews">My Reviews</Link><span>/</span><Link href="/reviews/adaptive-learning">Adaptive Learning Thesis</Link><span>/</span><span>History</span></div>
        <div className="page-heading"><p className="eyebrow">Adaptive Learning Thesis</p><h1>Review history</h1><p>Completed rounds and their document versions.</p></div>
        <div className="navigation-grid">
          {rounds.map((round) => <Link className="navigation-card" href="/reviews/adaptive-learning" key={round.id}><span className="navigation-card__icon"><CheckCircle2 size={21} /></span><span className="navigation-card__copy"><h2>Review #{round.id}</h2><p>Completed {round.date} for document version {round.version}.</p><small>{round.annotations} annotations</small></span><ArrowRight size={18} /></Link>)}
        </div>
      </div>
    </AppShell>
  );
}
