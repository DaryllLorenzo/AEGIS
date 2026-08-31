import { ArrowLeft, FilePenLine } from "lucide-react";
import Link from "next/link";

import AppShell from "@/components/aegis/AppShell";

export default function ResearchPaperPage() {
  return (
    <AppShell searchPlaceholder="Search this document...">
      <div className="page-container">
        <div className="breadcrumb"><Link href="/groups">Groups</Link><span>/</span><Link href="/groups/ai-in-education">AI in Education</Link><span>/</span><Link href="/groups/ai-in-education/documents">Documents</Link><span>/</span><span>Research Paper</span></div>
        <div className="review-title-block"><div className="review-title-block__badges"><span className="review-round"><i />Draft</span><code>v2.1</code></div><h1>Research Paper</h1><p>Scientific article - updated Aug 26</p></div>
        <section className="content-panel draft-state"><FilePenLine size={42} /><strong>Currently in drafting phase</strong><p>No active reviews have started for version 2.1.</p><Link className="button button--secondary" href="/groups/ai-in-education/documents"><ArrowLeft size={16} />Back to documents</Link></section>
      </div>
    </AppShell>
  );
}
