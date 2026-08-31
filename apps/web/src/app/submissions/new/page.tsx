import { ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";

import AppShell from "@/components/aegis/AppShell";

export default function NewSubmissionPage() {
  return (
    <AppShell searchPlaceholder="Search submissions...">
      <div className="page-container">
        <div className="breadcrumb"><Link href="/submissions">My Submissions</Link><span>/</span><span>New submission</span></div>
        <div className="page-heading"><p className="eyebrow">Create research object</p><h1>New submission</h1><p>Start a document record and upload its first version.</p></div>
        <form className="content-panel login-form" style={{ marginTop: 26, maxWidth: 720 }}>
          <label htmlFor="submission-title">Document title</label><input id="submission-title" placeholder="e.g. Adaptive Learning Thesis" />
          <label htmlFor="submission-type">Document type</label><input id="submission-type" placeholder="Thesis, article, report..." />
          <label htmlFor="submission-group">Research group</label><input id="submission-group" defaultValue="AI in Education" />
          <label htmlFor="submission-file">Document file</label><input id="submission-file" type="file" />
          <div className="heading-actions"><Link className="button button--secondary" href="/submissions"><ArrowLeft size={16} />Cancel</Link><button className="button button--primary" type="submit"><Upload size={16} />Create submission</button></div>
        </form>
      </div>
    </AppShell>
  );
}
