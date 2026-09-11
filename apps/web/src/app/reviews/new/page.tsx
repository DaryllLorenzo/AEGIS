"use client";

import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

import AppShell from "@/components/aegis/AppShell";
import AuthGuard from "@/components/aegis/AuthGuard";
import { uploadDocument, createReview, getGroups, getDocuments, type GroupDto, type DocumentDto } from "@/lib/api";

function NewReviewForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preParentId = searchParams.get("parentId") ?? "";
  const preGroupId = searchParams.get("groupId") ?? "";

  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("");
  const [version, setVersion] = useState("");
  const [assignee, setAssignee] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [groupId, setGroupId] = useState(preGroupId);
  const [documentId, setDocumentId] = useState("");
  const [mode, setMode] = useState<"upload" | "existing">("upload");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [groups, setGroups] = useState<GroupDto[]>([]);
  const [documents, setDocuments] = useState<DocumentDto[]>([]);

  const isVersion = !!preParentId;

  useEffect(() => {
    getGroups(1, 50)
      .then((r) => setGroups(r.items))
      .catch(() => setGroups([]));
  }, []);

  useEffect(() => {
    if (!groupId) { setDocuments([]); return; }
    getDocuments(1, 50, groupId)
      .then((r) => setDocuments(r.items))
      .catch(() => setDocuments([]));
  }, [groupId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    if (mode === "upload" && (!file || !groupId)) return;
    if (mode === "existing" && !documentId) return;

    setSubmitting(true);
    setError(null);

    try {
      let docId = documentId;

      if (mode === "upload" && file && groupId) {
        const doc = await uploadDocument(file, title, groupId, isVersion ? preParentId : undefined);
        docId = doc.id;
      }

      await createReview({
        documentId: docId,
        title,
        kind: kind || undefined,
        version: version || undefined,
        assignee: assignee || undefined,
      });
      router.push("/reviews");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      className="content-panel login-form"
      style={{ marginTop: 26, maxWidth: 720 }}
      onSubmit={handleSubmit}
    >
      {isVersion && (
        <div style={{ background: "#e8f5e9", padding: "10px 14px", borderRadius: 6, marginBottom: 16, fontSize: 14 }}>
          Creating a new version. The previous document will be linked as parent.
        </div>
      )}

      <label htmlFor="review-title">Document title</label>
      <input
        id="review-title"
        placeholder="e.g. Adaptive Learning Thesis"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <label htmlFor="review-group">Group</label>
      <select
        id="review-group"
        value={groupId}
        onChange={(e) => setGroupId(e.target.value)}
        required
        disabled={isVersion && !!preGroupId}
      >
        <option value="">Select a group</option>
        {groups.map((g) => (
          <option key={g.id} value={g.id}>{g.name}</option>
        ))}
      </select>

      {!isVersion && (
        <>
          <label>Document source</label>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button type="button" className={`button ${mode === "upload" ? "button--primary" : "button--secondary"}`} onClick={() => setMode("upload")}>
              Upload new file
            </button>
            <button type="button" className={`button ${mode === "existing" ? "button--primary" : "button--secondary"}`} onClick={() => setMode("existing")}>
              Use existing document
            </button>
          </div>
        </>
      )}

      {mode === "upload" && (
        <>
          <label htmlFor="review-file">PDF file</label>
          <input
            id="review-file"
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            required
          />
        </>
      )}

      {mode === "existing" && !isVersion && (
        <>
          <label htmlFor="review-document">Document</label>
          <select id="review-document" value={documentId} onChange={(e) => setDocumentId(e.target.value)} required disabled={!groupId}>
            <option value="">Select a document</option>
            {documents.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </>
      )}

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
        placeholder="e.g. v2.0"
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

      {error && <p style={{ color: "red", fontSize: 14 }}>{error}</p>}

      <div className="heading-actions">
        <Link className="button button--secondary" href="/reviews">
          <ArrowLeft size={16} /> Cancel
        </Link>
        <button
          className="button button--primary"
          type="submit"
          disabled={submitting || !title.trim()}
        >
          {submitting ? (
            <><Loader2 size={16} className="animate-spin" /> Creating...</>
          ) : (
            <><Upload size={16} /> {isVersion ? "Create new version" : "Create review"}</>
          )}
        </button>
      </div>
    </form>
  );
}

export default function NewReviewPage() {
  return (
    <AuthGuard>
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
            <p>Upload a document or select an existing one to start a new review round.</p>
          </div>
          <Suspense fallback={<p>Loading...</p>}>
            <NewReviewForm />
          </Suspense>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
