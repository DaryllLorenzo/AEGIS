"use client";

import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { uploadDocument, createReview, getGroups, type GroupDto } from "@/lib/api";

export default function NewSubmissionPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [groupId, setGroupId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [groups, setGroups] = useState<GroupDto[]>([]);

  useEffect(() => {
    getGroups(1, 50)
      .then((r) => setGroups(r.items))
      .catch(() => setGroups([]));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !title || !groupId) {
      setError("Please provide a title, select a group, and choose a PDF file.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const document = await uploadDocument(file, title, groupId);

      const review = await createReview({
        documentId: document.id,
        title: title,
        kind: "Document Review",
      });

      router.push(`/reviews/${review.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create submission");
      setUploading(false);
    }
  }

  return (
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
        <label htmlFor="submission-group">Group</label>
        <select id="submission-group" value={groupId} onChange={(e) => setGroupId(e.target.value)} required>
          <option value="">Select a group</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
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
          <button className="button button--primary" type="submit" disabled={uploading || !title || !file || !groupId}>
            {uploading ? (
              <><Loader2 size={16} className="animate-spin" /> Creating...</>
            ) : (
              <><Upload size={16} /> Create submission</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
