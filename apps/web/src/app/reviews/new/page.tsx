"use client";

import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import AppShell from "@/components/aegis/AppShell";
import { uploadDocument, createReview } from "@/lib/api";

export default function NewReviewPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("");
  const [version, setVersion] = useState("");
  const [assignee, setAssignee] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !title.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const doc = await uploadDocument(file, title, 0);
      const review = await createReview({
        documentId: doc.id,
        title,
        kind: kind || undefined,
        version: version || undefined,
        status: "Open",
        assignee: assignee || undefined,
      });
      router.push(`/reviews/${review.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <div className="page-container">
        <div className="breadcrumb">
          <Link href="/reviews">My Reviews</Link>
          <span>/</span>
          <span>New review</span>
        </div>
        <div className="page-heading">
          <p className="eyebrow">Create review</p>
          <h1>New review</h1>
          <p>Upload a document and start a new review round.</p>
        </div>
        <form
          className="content-panel login-form"
          style={{ marginTop: 26, maxWidth: 720 }}
          onSubmit={handleSubmit}
        >
          <label htmlFor="review-title">Document title</label>
          <input
            id="review-title"
            placeholder="e.g. Adaptive Learning Thesis"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <label htmlFor="review-kind">Document type</label>
          <input
            id="review-kind"
            placeholder="Thesis, article, report..."
            value={kind}
            onChange={(e) => setKind(e.target.value)}
          />

          <label htmlFor="review-version">Version</label>
          <input
            id="review-version"
            placeholder="e.g. v1.0"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
          />

          <label htmlFor="review-assignee">Assignee</label>
          <input
            id="review-assignee"
            placeholder="e.g. Dr. Chen"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
          />

          <label htmlFor="review-file">PDF file</label>
          <input
            id="review-file"
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            required
          />

          {error && <p style={{ color: "red", fontSize: 14 }}>{error}</p>}

          <div className="heading-actions">
            <Link className="button button--secondary" href="/reviews">
              <ArrowLeft size={16} /> Cancel
            </Link>
            <button
              className="button button--primary"
              type="submit"
              disabled={submitting || !file || !title.trim()}
            >
              {submitting ? (
                <><Loader2 size={16} className="animate-spin" /> Creating...</>
              ) : (
                <><Upload size={16} /> Create review</>
              )}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
