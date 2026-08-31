import Link from "next/link";
import { ArrowRight, ArrowUpDown, FilePenLine, Filter, History, MessageSquareText, Plus } from "lucide-react";

import AppShell from "@/components/aegis/AppShell";
import GroupTabs from "@/components/aegis/GroupTabs";
import StatusPill from "@/components/aegis/StatusPill";

const history = [
  { version: "v1.4", date: "Aug 28", review: "Review #4", status: "In progress", annotations: null },
  { version: "v1.3", date: "Aug 20", review: "Review #3", status: "Completed", annotations: 17 },
  { version: "v1.2", date: "Aug 10", review: "Review #2", status: "Completed", annotations: 11 },
];

export default function DocumentsPage() {
  return (
    <AppShell searchPlaceholder="Search documents...">
      <div className="page-container documents-page">
        <div className="breadcrumb"><Link href="/groups">Groups</Link><span>/</span><Link href="/groups/ai-in-education">AI in Education</Link><span>/</span><span>Documents</span></div>
        <div className="page-heading page-heading--split">
          <div><p className="eyebrow">AI in Education</p><h1>Research objects</h1><p>Active documents and version history for your group.</p></div>
          <div className="heading-actions">
            <button className="button button--secondary" type="button"><Filter size={16} />Filter</button>
            <button className="button button--secondary" type="button"><ArrowUpDown size={16} />Sort</button>
            <Link className="button button--primary" href="/submissions/new"><Plus size={16} />New document</Link>
          </div>
        </div>
        <GroupTabs active="documents" />

        <div className="documents-grid">
          <article className="document-card">
            <div className="document-card__header"><div><p className="eyebrow">Thesis</p><h2>Adaptive Learning Thesis</h2></div><StatusPill status="Under review" /></div>
            <div className="document-meta"><code>v1.4</code><span>Updated Aug 28</span><span><MessageSquareText size={15} />4 reviews</span></div>
            <div className="version-history">
              <div className="version-history__title"><History size={16} /> Recent history</div>
              {history.map((item) => (
                <div className="version-row" key={item.version}>
                  <i className={item.status === "Completed" ? "is-complete" : "is-progress"} />
                  <code>{item.version}</code>
                  <div><strong>{item.review}</strong><span className={item.status === "Completed" ? "is-complete" : "is-progress"}>{item.status}</span>{item.annotations && <small>{item.annotations} annotations</small>}</div>
                  <time>{item.date}</time>
                </div>
              ))}
            </div>
            <div className="document-card__footer"><Link className="button button--secondary" href="/reviews/adaptive-learning">Open document <ArrowRight size={16} /></Link></div>
          </article>

          <article className="document-card">
            <div className="document-card__header"><div><p className="eyebrow">Scientific article</p><h2>Research Paper</h2></div><StatusPill status="Draft" /></div>
            <div className="document-meta"><code>v2.1</code><span>Updated Aug 26</span><span><MessageSquareText size={15} />2 reviews</span></div>
            <div className="draft-state"><FilePenLine size={36} /><strong>Currently in drafting phase</strong><p>No active reviews have started for v2.1.</p></div>
            <div className="document-card__footer"><Link className="button button--secondary" href="/groups/ai-in-education/documents/research-paper">Open document <ArrowRight size={16} /></Link></div>
          </article>
        </div>
      </div>
    </AppShell>
  );
}
