"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  FileText,
  Lock,
  Menu,
  MessageSquarePlus,
  Play,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  getReviewById,
  getDocumentById,
  getDocumentDownloadUrl,
  getAuthToken,
  updateReview,
  reviewNextAction,
  nextReviewStatus,
  type Review,
  type DocumentDto,
} from "@/lib/api";
import { reviewStatusLabel, initialsFromName } from "@/lib/utils";

import Brand from "./Brand";
import PdfAnnotator from "../pdf-annotator/PdfAnnotator";
import type { Annotation } from "../pdf-annotator/types";

type Props = {
  reviewId: string;
};

export default function ReviewWorkspace({ reviewId }: Props) {
  const [review, setReview] = useState<Review | null>(null);
  const [doc, setDoc] = useState<DocumentDto | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  useEffect(() => {
    if (!reviewId) return;
    let cancelled = false;

    (async () => {
      try {
        const r = await getReviewById(reviewId);
        if (cancelled) return;
        setReview(r);

        const d = await getDocumentById(r.documentId);
        if (cancelled) return;
        setDoc(d);

        const url = getDocumentDownloadUrl(r.documentId);
        const headers: Record<string, string> = {};
        const token = getAuthToken();
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const response = await fetch(url, { headers });
        if (!response.ok) {
          throw new Error(`API ${response.status}: ${response.statusText}`);
        }
        const blob = await response.blob();
        if (!cancelled) setPdfFile(new File([blob], d.name, { type: d.mimeType }));
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load the review.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reviewId]);

  function getAnnotationColor(a: Annotation): string {
    const colors: Record<string, string> = {
      rectangle: "#e0be58",
      circle: "#5b8def",
      ellipse: "#9b6def",
      highlight: "#4caf50",
    };
    return colors[a.type] ?? "#888";
  }

  function getAnnotationIcon(a: Annotation): string {
    const icons: Record<string, string> = {
      rectangle: "▭",
      circle: "○",
      ellipse: "⬮",
      highlight: "▲",
    };
    return icons[a.type] ?? "?";
  }

  /** Deterministic chip color per author name (stable across renders). */
  function authorChipColor(authorName: string | null): string {
    const palette = ["#1555b6", "#087342", "#a56f00", "#6d3fc0", "#b42318", "#0e7490"];
    if (!authorName) return "#6b7280";
    let hash = 0;
    for (let i = 0; i < authorName.length; i += 1) {
      hash = (hash * 31 + authorName.charCodeAt(i)) % 997;
    }
    return palette[hash % palette.length];
  }

  function renderMiniPreview(a: Annotation) {
    if (a.type === "highlight") {
      return <span className="annotation-card__highlight" />;
    }
    if (a.type === "rectangle") {
      return (
        <svg viewBox="0 0 24 16" className="annotation-card__svg">
          <rect x="1" y="1" width="22" height="14" rx="2" stroke="currentColor" fill="none" strokeWidth="2" />
        </svg>
      );
    }
    if (a.type === "circle") {
      return (
        <svg viewBox="0 0 24 24" className="annotation-card__svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" fill="none" strokeWidth="2" />
        </svg>
      );
    }
    if (a.type === "ellipse") {
      return (
        <svg viewBox="0 0 24 16" className="annotation-card__svg">
          <ellipse cx="12" cy="8" rx="11" ry="7" stroke="currentColor" fill="none" strokeWidth="2" />
        </svg>
      );
    }
    return null;
  }

  const isCompleted = review?.status === "Completed";
  const isInProgress = review?.status === "InProgress";
  const nextAction = review ? reviewNextAction(review.status) : null;

  /**
   * Advance the review along its legal state-machine edge:
   * Pending -> InProgress ("Start review") or InProgress -> Completed
   * ("Complete review"). Completed is terminal — no transition exists.
   *
   * State is updated only from the server response (no optimistic update),
   * so the UI can never drift ahead of the backend. Errors are surfaced
   * inline with a retry; the review state is left untouched on failure.
   */
  async function handleAdvance() {
    if (!review || !nextAction || saving) return;
    const target = nextReviewStatus(review.status);
    if (!target) return;

    setSaving(true);
    setStatusError(null);
    try {
      const updated = await updateReview(review.id, {
        title: review.title,
        kind: review.kind ?? undefined,
        version: review.version ?? undefined,
        status: target,
        dueDate: review.dueDate ?? undefined,
        assigneeId: review.assigneeId ?? undefined,
      });
      setReview(updated);
    } catch (err) {
      setStatusError(
        err instanceof Error
          ? err.message
          : "Failed to update the review status. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDownload() {
    if (!doc || downloading) return;
    setDownloading(true);
    try {
      const url = getDocumentDownloadUrl(doc.id);
      const headers: Record<string, string> = {};
      const token = getAuthToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const response = await fetch(url, { headers });
      if (!response.ok) {
        throw new Error(`API ${response.status}: ${response.statusText}`);
      }
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const anchor = window.document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = doc.name;
      window.document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Failed to download document:", err);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <main className="workspace">
      <header className="workspace-header">
        <Link className="icon-button" href={doc ? `/groups/${doc.groupId}` : "/groups"} aria-label="Back to group">
          <ArrowLeft size={22} />
        </Link>
        <span className="workspace-header__divider" />
        <Brand compact />
        <div className="workspace-header__title">
          <span>{review?.kind ?? "Review"}</span>
          <strong>{review?.title ?? "Loading..."}</strong>
        </div>
        <div className="workspace-header__right">
          <span
            className={`workspace-status${isCompleted ? " workspace-status--complete" : ""}`}
            aria-live="polite"
          >
            <i />
            {isCompleted
              ? "Your review · Completed"
              : `Review · ${review ? reviewStatusLabel(review.status) : "Loading"}`}
          </span>
          {nextAction ? (
            <button
              className="button button--primary"
              type="button"
              onClick={handleAdvance}
              disabled={saving || !review}
              title={nextAction.hint}
            >
              {nextAction.verb === "start" ? (
                <Play size={17} />
              ) : (
                <CheckCircle2 size={17} />
              )}
              {saving ? "Saving..." : nextAction.label}
            </button>
          ) : (
            isCompleted && (
              <span className="workspace-status workspace-status--complete">
                <CheckCircle2 size={16} />
                Review round closed
              </span>
            )
          )}
          {isCompleted && doc && (
            <Link
              className="button button--primary"
              href={`/groups/${doc.groupId}/documents/new?parentId=${doc.id}`}
            >
              <FileText size={16} />
              New version
            </Link>
          )}
          <button
            className="icon-button"
            type="button"
            aria-label="Download document"
            title="Download document"
            onClick={handleDownload}
            disabled={!doc || downloading}
          >
            <Download size={19} />
          </button>
          <button
            className="icon-button workspace-panel-toggle"
            type="button"
            aria-label="Open review panel"
            onClick={() => setRightPanelOpen(true)}
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {error && (
        <div className="workspace-error" role="alert">
          <p>{error}</p>
          <Link className="button button--secondary" href={doc ? `/groups/${doc.groupId}` : "/groups"}>
            Back to group
          </Link>
        </div>
      )}

      {statusError && (
        <div className="workspace-error" role="alert">
          <p>{statusError}</p>
          <div className="workspace-error__actions">
            <button
              className="button button--secondary button--sm"
              type="button"
              onClick={handleAdvance}
              disabled={saving}
            >
              Try again
            </button>
            <button
              className="text-button"
              type="button"
              onClick={() => setStatusError(null)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="workspace-body">
        <section className="document-stage">
          {loading && !error && (
            <div className="annotator-status">Loading document...</div>
          )}
          {!loading && !error && pdfFile && (
            <PdfAnnotator
              documentId={review?.documentId}
              file={pdfFile}
              onAnnotationsChange={setAnnotations}
              readOnly={!isInProgress}
            />
          )}
          {!isInProgress && !loading && !error && (
            <div className="annotator-lock" role="status">
              <Lock size={15} aria-hidden="true" />
              {isCompleted
                ? "Review round closed — annotations are read-only. Start a new version to continue."
                : "Start the review to annotate this document."}
            </div>
          )}
        </section>

        {rightPanelOpen && (
          <button
            className="review-panel-backdrop"
            type="button"
            aria-label="Close review panel"
            onClick={() => setRightPanelOpen(false)}
          />
        )}
        <aside className={`review-panel${rightPanelOpen ? " review-panel--open" : ""}`}>
          <div className="review-panel__header">
            <h2>Annotations ({annotations.length})</h2>
          </div>

          <div className="comments-list">
            {annotations.length === 0 ? (
              <div className="annotation-empty">
                <MessageSquarePlus size={24} />
                <p>No annotations yet</p>
                <small>Use the toolbar to draw shapes or highlight text.</small>
              </div>
            ) : (
              [...annotations]
                .sort((a, b) => a.page - b.page)
                .map((a) => (
                  <article
                    key={a.id}
                    className="annotation-card"
                    style={{ "--annotation-color": getAnnotationColor(a) } as React.CSSProperties}
                  >
                    <div className="annotation-card__header">
                      <span className="annotation-card__type">{getAnnotationIcon(a)}</span>
                      <span className="annotation-card__page">Page {a.page}</span>
                    </div>
                    <div className="annotation-card__author">
                      <span
                        className="annotation-card__avatar"
                        style={{ background: `${authorChipColor(a.authorName)}1a`, borderColor: `${authorChipColor(a.authorName)}55`, color: authorChipColor(a.authorName) }}
                      >
                        {initialsFromName(a.authorName ?? "?")}
                      </span>
                      <span className="annotation-card__author-name">{a.authorName ?? "Unknown author"}</span>
                    </div>
                    {a.geometry && (
                      <div className="annotation-card__preview">
                        {renderMiniPreview(a)}
                      </div>
                    )}
                    {a.content ? (
                      <p className="annotation-card__comment">{a.content}</p>
                    ) : null}
                  </article>
                ))
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
