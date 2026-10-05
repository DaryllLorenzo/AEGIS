"use client";

import {
  ArrowLeft,
  FileUp,
  FolderTree,
  Info,
  Loader2,
  Tag,
  Upload,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

import {
  uploadDocument,
  createReview,
  getGroups,
  getDocuments,
  getDocumentById,
  getUserSelect,
  type GroupDto,
  type DocumentDto,
  type DocumentType,
  type SelectItem,
} from "@/lib/api";

function NewReviewForm() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const preParentId = searchParams.get("parentId") ?? "";
  const groupIdParam = (params?.id as string) ?? "";

  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [groupId, setGroupId] = useState(groupIdParam);
  const [documentId, setDocumentId] = useState("");
  const [docType, setDocType] = useState<DocumentType>("Thesis");
  const [mode, setMode] = useState<"upload" | "existing">("upload");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [groups, setGroups] = useState<GroupDto[]>([]);
  const [documents, setDocuments] = useState<DocumentDto[]>([]);
  const [assigneeOptions, setAssigneeOptions] = useState<SelectItem[]>([]);
  const [parent, setParent] = useState<DocumentDto | null>(null);

  // A new version is created from a parent document and always
  // requires a fresh PDF upload.
  const isVersion = !!preParentId;

  useEffect(() => {
    getGroups(1, 50)
      .then((r) => setGroups(r.items))
      .catch(() => setGroups([]));
  }, []);

  useEffect(() => {
    if (!groupId || isVersion) {
      setDocuments([]);
      return;
    }
    getDocuments(1, 50, groupId)
      .then((r) => setDocuments(r.items))
      .catch(() => setDocuments([]));
  }, [groupId, isVersion]);

  // New version: load the parent so its name, type, and version
  // number can be shown (both are inherited/derived server-side).
  useEffect(() => {
    if (!preParentId) return;
    let cancelled = false;
    getDocumentById(preParentId)
      .then((d) => {
        if (!cancelled) setParent(d);
      })
      .catch(() => {
        if (!cancelled) setParent(null);
      });
    return () => {
      cancelled = true;
    };
  }, [preParentId]);

  // Assignee picker: only members of the selected group may be
  // assigned (enforced by the backend; the picker lists them).
  useEffect(() => {
    if (!groupId) {
      setAssigneeOptions([]);
      setAssigneeId("");
      return;
    }
    let cancelled = false;
    getUserSelect(groupId)
      .then((items) => {
        if (!cancelled) setAssigneeOptions(items);
      })
      .catch(() => {
        if (!cancelled) setAssigneeOptions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [groupId]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    if (selected && selected.type !== "application/pdf") {
      setFile(null);
      setFileError("Only PDF files are accepted.");
      return;
    }
    setFileError(null);
    setFile(selected);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    if (fileError) return;

    const needsUpload = isVersion || mode === "upload";
    if (needsUpload && (!file || !groupId)) return;
    if (!isVersion && mode === "existing" && !documentId) return;

    setSubmitting(true);
    setError(null);

    try {
      let docId = documentId;

      if (needsUpload && file && groupId) {
        const doc = await uploadDocument(
          file,
          title,
          groupId,
          isVersion ? preParentId : undefined,
          docType,
        );
        docId = doc.id;
      }

      const review = await createReview({
        documentId: docId,
        title,
        kind: kind || undefined,
        dueDate: dueDate || undefined,
        assigneeId: assigneeId || undefined,
      });
      router.push(`/groups/${groupId}/reviews/${review.id}/workspace`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  const selectedGroup = groups.find((g) => g.id === groupId);
  const needsUpload = isVersion || mode === "upload";
  const canSubmit =
    !submitting &&
    !!title.trim() &&
    !fileError &&
    (needsUpload ? !!file && !!groupId : !!documentId);

  return (
    <form className="form-panel" onSubmit={handleSubmit}>
      {isVersion && (
        <div className="banner banner--success" role="status">
          <Info size={16} />
          <p>
            Creating a new version. A fresh PDF is required — the new
            document inherits its parent&apos;s name and the next version
            number.
          </p>
        </div>
      )}

      <section className="form-step">
        <header className="form-step__header">
          <span className="form-step__number">1</span>
          <div>
            <h2>
              <FolderTree size={18} /> Choose a group
            </h2>
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
              disabled
            >
              <option value="">Select a group</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
            {selectedGroup && (
              <p className="field__hint">
                Being created in {selectedGroup.name}; members are validated for this group.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="form-step">
        <header className="form-step__header">
          <span className="form-step__number">2</span>
          <div>
            <h2>
              <FileUp size={18} /> Add the document
            </h2>
            <p>
              {isVersion
                ? "Upload the new PDF for this version."
                : "Upload a new PDF or review a document that already exists in the group."}
            </p>
          </div>
        </header>
        <div className="form-step__body">
          {isVersion ? (
            <>
              <div className="field">
                <label htmlFor="review-file">
                  PDF file <span className="field__required">Required</span>
                </label>
                <input
                  id="review-file"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  required
                />
                {fileError ? (
                  <p className="field__error" role="alert">{fileError}</p>
                ) : (
                  file && <p className="field__hint">{file.name}</p>
                )}
              </div>
              {parent && (
                <div className="field__row">
                  <div className="field">
                    <label>Document name</label>
                    <p className="field__static">{parent.name}</p>
                    <p className="field__hint">Inherited from v{parent.version}</p>
                  </div>
                  <div className="field">
                    <label>Version</label>
                    <p className="field__static">v{parent.version + 1}</p>
                    <p className="field__hint">Auto-incremented, not editable</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
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
                <>
                  <div className="field">
                    <label htmlFor="review-file">PDF file</label>
                    <input
                      id="review-file"
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      required
                    />
                    {fileError && (
                      <p className="field__error" role="alert">{fileError}</p>
                    )}
                  </div>
                  <div className="field">
                    <label htmlFor="review-type">Document type</label>
                    <select
                      id="review-type"
                      value={docType}
                      onChange={(e) => setDocType(e.target.value as DocumentType)}
                    >
                      <option value="Thesis">Thesis</option>
                      <option value="Article">Article</option>
                    </select>
                  </div>
                </>
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
                      <option key={d.id} value={d.id}>
                        {d.name} (v{d.version})
                      </option>
                    ))}
                  </select>
                  {!groupId && (
                    <p className="field__hint">Choose a group first to see its documents.</p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section className="form-step">
        <header className="form-step__header">
          <span className="form-step__number">{isVersion ? "3" : "3"}</span>
          <div>
            <h2>
              <Tag size={18} /> Review details
            </h2>
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
            {isVersion && (
              <p className="field__hint">
                Names the review round. The document keeps its inherited name.
              </p>
            )}
          </div>
          <div className="field__row">
            <div className="field">
              <label htmlFor="review-kind">
                Kind <span className="field__optional">Optional</span>
              </label>
              <input
                id="review-kind"
                placeholder="e.g. Initial review, revision..."
                value={kind}
                onChange={(e) => setKind(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="review-assignee">Assignee</label>
              <select
                id="review-assignee"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                disabled={!groupId}
              >
                <option value="">Unassigned</option>
                {assigneeOptions.map((u) => (
                  <option key={u.id} value={u.id}>{u.label}</option>
                ))}
              </select>
              {!groupId ? (
                <p className="field__hint">Choose a group first to assign a reviewer.</p>
              ) : (
                <p className="field__hint">
                  <UserRound size={13} /> Only members of this group can be assigned.
                </p>
              )}
            </div>
          </div>
          <div className="field__row">
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
        </div>
      </section>

      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="form-actions">
        <Link className="button button--secondary" href={`/groups/${groupId}`}>
          <ArrowLeft size={16} /> Cancel
        </Link>
        <button
          className="button button--primary"
          type="submit"
          disabled={!canSubmit}
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Creating...
            </>
          ) : isVersion ? (
            <>
              <Upload size={16} /> Create new version
            </>
          ) : (
            <>
              <Upload size={16} /> Create document
            </>
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
        <Link href="/groups">My Groups</Link>
        <span>/</span>
        <span>New document</span>
      </div>
      <div className="page-heading">
        <p className="eyebrow">Create document</p>
        <h1>New document</h1>
        <p>Upload a document or select an existing one inside this group to start a review round.</p>
      </div>
      <Suspense fallback={<p className="muted">Loading...</p>}>
        <NewReviewForm />
      </Suspense>
    </div>
  );
}
