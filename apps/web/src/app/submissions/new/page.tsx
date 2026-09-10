"use client";

import { ArrowLeft, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import AppShell from "@/components/aegis/AppShell";
import { uploadDocument, createReview } from "@/lib/api";

export default function NewSubmissionPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !title) {
      setError("Please provide a title and select a PDF file.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      // Create the document
      const document = await uploadDocument(file, title);

      // Create a review for the document
      const review = await createReview({
        documentId: document.id,
        title: title,
        kind: "Document Review",
        status: "Open",
      });

      // Redirect to the review workspace
      router.push(`/reviews/${review.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create submission");
      setUploading(false);
    }
  }

  return (
    <AppShell searchPlaceholder="Search submissions...">
      <div className="page-container">
        <div className="breadcrumb"><Link href="/submissions">My Submissions</Link><span>/</span><span>New submission</span></div>
        <div className="page-heading"><p className="eyebrow">Create research object</p><h1>New submission</h1><p>Start a document record and upload its first version.</p></div>
        <form className="content-panel login-form" style={{ marginTop: 26, maxWidth: 720 }} onSubmit={handleSubmit}>
          {error && <div className="error-message" style={{ color: "red", marginBottom: 16 }}>{error}</div>}
          <label htmlFor="submission-title">Document title</label>
          <input
            id="submission-title"
            placeholder="e.g. Adaptive Learning Thesis"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <label htmlFor="submission-file">Document file (PDF)</label>
          <input
            id="submission-file"
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
          />
          <div className="heading-actions">
            <Link className="button button--secondary" href="/submissions"><ArrowLeft size={16} />Cancel</Link>
            <button className="button button--primary" type="submit" disabled={uploading}>
              <Upload size={16} />{uploading ? "Creating..." : "Create submission"}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
