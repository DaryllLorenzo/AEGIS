"use client";

import { ArrowLeft, FileUp, FolderTree, Info, Loader2, Tag, Upload, UserRound, CalendarDays } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

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
  const [dueDate, setDueDate] = useState("");
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
    if (!groupId) {
      setDocuments([]);
      return;
    }
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

      const review = await createReview({
        documentId: docId,
        title,
        kind: kind || undefined,
        version: version || undefined,
        dueDate: dueDate || undefined,
        assignee: assignee || undefined,
      });
      router.push(`/reviews/${review.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedGroup = groups.find((g) => g.id === groupId);

  return (
    <form className="form-panel" onSubmit={handleSubmit}>
      {isVersion && (
        <div className="banner banner--success" role="status">
          <Info size={16} />
          <p>
            Creating a new version. The selected document will be linked as the
            parent of the new file.
          </p>
        </div>
      )}

      <section className="form-step">
        <header className="form-step__header">
          <span className="form-step__number">1</span>
          <div>
            <h2><FolderTree size={18} /> Choose a group</h2>
            <p>Groups keep documents, versions, and reviews together.</p>
          </div>
        </header>
        <div className="form-step__body">
          <div className="field">
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
            {isVersion && preGroupId && selectedGroup && (
              <p className="field__hint">Locked to {selectedGroup.name} because this is a new version.</p>
            )}
          </div>
        </div>
      </section>

      {!isVersion && (
        <section className="form-step">
          <header className="form-step__header">
            <span className="form-step__number">2</span>
            <div>
              <h2><FileUp size={18} /> Add the document</h2>
              <p>Upload a new PDF or review a document that already exists in the group.</p>
            </div>
          </header>
          <div className="form-step__body">
            <div className="segmented" role="group" aria-label="Document source">
              <button
                type="button"
                className={mode === "upload" ? "is-active" : ""}
                onClick={() => setMode("upload")}
              >
                <Upload size={15} />
                Upload new file
              </button>
              <button
                type="button"
                className={mode === "existing" ? "is-active" : ""}
                onClick={() => setMode("existing")}
              >
                <FileUp size={15} />
                Use existing document
              </button>
            </div>

            {mode === "upload" && (
              <div className="field">
                <label htmlFor="review-file">PDF file</label>
                <input
                  id="review-file"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  required
                />
              </div>
            )}

            {mode === "existing" && (
              <div className="field">
                <label htmlFor="review-document">Document</label>
                <select
                  id="review-document"
                  value={documentId}
                  onChange={(e) => setDocumentId(e.target.value)}
                  required
                  disabled={!groupId}
                >
                  <option value="">Select a document</option>
                  {documents.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                {!groupId && (
                  <p className="field__hint">Choose a group first to see its documents.</p>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="form-step">
        <header className="form-step__header">
          <span className="form-step__number">{isVersion ? "2" : "3"}</span>
          <div>
            <h2><Tag size={18} /> Review details</h2>
            <p>Name the review round and set expectations for the reviewer.</p>
          </div>
        </header>
        <div className="form-step__body">
          <div className="field">
            <label htmlFor="review-title">Document title</label>
            <input
              id="review-title"
              placeholder="e.g. Adaptive Learning Thesis"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="field__row">
            <div className="field">
              <label htmlFor="review-kind">Document type</label>
              <input
                id="review-kind"
                placeholder="Thesis, article, report..."
                value={kind}
                onChange={(e) => setKind(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="review-version">Version</label>
              <input
                id="review-version"
                placeholder="e.g. v2.0"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
              />
            </div>
          </div>
          <div className="field__row">
            <div className="field">
              <label htmlFor="review-assignee">Assignee</label>
              <input
                id="review-assignee"
                placeholder="e.g. Dr. Chen"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="review-due">Due date</label>
              <input
                id="review-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="review-notes">
              Notes <span className="field__optional">Optional</span>
            </label>
            <p className="field__hint">
              <UserRound size={13} />
              Reviewers see this round&apos;s status and due date on their dashboard.
            </p>
          </div>
        </div>
      </section>

      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="form-actions">
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
          ) : isVersion ? (
            <><Upload size={16} /> Create new version</>
          ) : (
            <><Upload size={16} /> Create review</>
          )}
        </button>
      </div>
    </form>
  );
}

export default function NewReviewPage() {
  return (
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
      <Suspense fallback={<p className="muted">Loading...</p>}>
        <NewReviewForm />
      </Suspense>
    </div>
  );
}
