"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Grid2X2,
  MessageSquarePlus,
  MoreHorizontal,
  Menu,
  Settings2,
  Download,
  Eye,
  LayoutDashboard,
  PanelRight,
  Send,
  Settings,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { getReviewById, getDocumentById, getDocumentDownloadUrl, getAuthToken, updateReview, type Review, type DocumentDto } from "@/lib/api";
import { reviewStatusLabel } from "@/lib/utils";

import Avatar from "./Avatar";
import Brand from "./Brand";
import PdfAnnotator from "../pdf-annotator/PdfAnnotator";
import type { PdfAnnotatorHandle } from "../pdf-annotator/PdfAnnotator";
import type { Annotation } from "../pdf-annotator/types";

type Props = {
  reviewId: string;
};

const discussionMessages = [
  { initials: "CR", author: "Carlos R.", time: "10:42", body: "I finished the statistical review. The methodology is sound, but the sample-size limitation should be explicit." },
  { initials: "AM", author: "Ana M.", time: "11:08", body: "I'll add that limitation to the next version and link it to the discussion section." },
];

export default function ReviewWorkspace({ reviewId }: Props) {
  const [review, setReview] = useState<Review | null>(null);
  const [document, setDocument] = useState<DocumentDto | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<"annotations" | "discussion">("annotations");
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const annotatorRef = useRef<PdfAnnotatorHandle>(null);

  const openComments = annotations.length;

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

  useEffect(() => {
    if (!reviewId) return;
    let cancelled = false;

    (async () => {
      try {
        const r = await getReviewById(reviewId);
        if (cancelled) return;
        setReview(r);

        const doc = await getDocumentById(r.documentId);
        if (!cancelled) setDocument(doc);

        // Fetch the PDF blob and create a File object
        const downloadUrl = getDocumentDownloadUrl(r.documentId);
        const headers: Record<string, string> = {};
        const token = getAuthToken();
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const response = await fetch(downloadUrl, { headers });
        if (response.ok && !cancelled) {
          const blob = await response.blob();
          const file = new File([blob], doc.name, { type: doc.mimeType });
          setPdfFile(file);
        } else {
          console.error("Failed to fetch PDF:", response.status, response.statusText);
        }
      } catch (err) {
        console.error("Failed to load review:", err);
      }
    })();

    return () => { cancelled = true; };
  }, [reviewId]);

  function toggleResolved(id: string) {
    setResolvedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  const isCompleted = review?.status === "Completed";
  const isInProgress = review?.status === "InProgress";

  async function handleStatusToggle() {
    if (!review || saving) return;
    setSaving(true);
    try {
      const newStatus = isCompleted ? "InProgress" : isInProgress ? "Completed" : "InProgress";
      const updated = await updateReview(review.id, {
        title: review.title,
        kind: review.kind ?? undefined,
        version: review.version ?? undefined,
        status: newStatus,
        assignee: review.assignee ?? undefined,
      });
      setReview(updated);
    } catch (err) {
      console.error("Failed to update review status:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="workspace">
      <header className="workspace-header">
        <Link className="icon-button" href="/reviews" aria-label="Back to reviews">
          <ArrowLeft size={22} />
        </Link>
        <span className="workspace-header__divider" />
        <Brand compact />
        <div className="workspace-header__title">
          <span>{review?.kind ?? "Review"}</span>
          <strong>{review?.title ?? "Loading..."}</strong>
        </div>
        <div className="workspace-header__right">
          <span className={`workspace-status${isCompleted ? " workspace-status--complete" : ""}`}>
            <i />
            {isCompleted
              ? "Your review · Completed"
              : `Review · ${review ? reviewStatusLabel(review.status) : "Loading"}`}
          </span>
          <button
            className={`button ${isCompleted ? "button--secondary" : "button--primary"}`}
            type="button"
            onClick={handleStatusToggle}
            disabled={saving}
          >
            <CheckCircle2 size={17} />
            {saving ? "Saving..." : isCompleted ? "Reopen review" : "Complete review"}
          </button>
          {isCompleted && document && (
            <Link
              className="button button--primary"
              href={`/reviews/new?parentId=${document.id}&groupId=${document.groupId}`}
            >
              New version
            </Link>
          )}
          <button
            className="icon-button workspace-panel-toggle"
            type="button"
            aria-label="Open review panel"
            onClick={() => setRightPanelOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="workspace-options-wrap">
            <button
              className={`icon-button workspace-options-button${optionsOpen ? " is-active" : ""}`}
              type="button"
              aria-label="Open workspace options"
              onClick={() => setOptionsOpen((v) => !v)}
            >
              <Settings2 size={19} />
            </button>
            {optionsOpen && (
              <div className="workspace-options" role="menu">
                <div className="workspace-options__title">
                  <span>Workspace options</span>
                  <small>{review?.title}</small>
                </div>
                <button type="button" role="menuitem">
                  <Eye size={16} />
                  <span>
                    <strong>View mode</strong>
                    <small>Single page</small>
                  </span>
                  <b>⌄</b>
                </button>
                <button type="button" role="menuitem">
                  <PanelRight size={16} />
                  <span>
                    <strong>Review panel</strong>
                    <small>{activeTab === "annotations" ? "Annotations" : "Discussion"}</small>
                  </span>
                  <b>⌄</b>
                </button>
                {document && (
                  <button type="button" role="menuitem">
                    <Download size={16} />
                    <span>
                      <strong>Download version</strong>
                      <small>
                        {document.name} {review?.version ? `· ${review.version}` : ""}
                      </small>
                    </span>
                  </button>
                )}
                <div className="workspace-options__divider" />
                <label className="workspace-option-toggle">
                  <span>Show resolved annotations</span>
                  <input type="checkbox" defaultChecked />
                </label>
                <div className="workspace-options__divider" />
                <Link href="/" onClick={() => setOptionsOpen(false)}>
                  <LayoutDashboard size={16} />
                  <span>
                    <strong>Dashboard</strong>
                    <small>Return to your overview</small>
                  </span>
                </Link>
                <Link href="/settings" onClick={() => setOptionsOpen(false)}>
                  <Settings size={16} />
                  <span>
                    <strong>Settings</strong>
                    <small>Workspace preferences</small>
                  </span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="workspace-body">
        {/* Annotation canvas — delegates to PdfAnnotator */}
        <section className="document-stage">
          <PdfAnnotator
            ref={annotatorRef}
            documentId={review?.documentId}
            file={pdfFile}
            onAnnotationsChange={setAnnotations}
          />
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
          <div className="review-panel__tabs">
            <button
              className={activeTab === "annotations" ? "is-active" : ""}
              type="button"
              onClick={() => setActiveTab("annotations")}
            >
              Annotations ({openComments})
            </button>
            <button
              className={activeTab === "discussion" ? "is-active" : ""}
              type="button"
              onClick={() => setActiveTab("discussion")}
            >
              Discussion
            </button>
          </div>

          {activeTab === "annotations" ? (
            <div className="comments-list">
              {annotations.length === 0 ? (
                <div className="annotation-empty">
                  <MessageSquarePlus size={24} />
                  <p>Select text to add an annotation</p>
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
          ) : (
            <div className="discussion-panel">
              <div className="discussion-list">
                {discussionMessages.map((item) => (
                  <article key={item.author}>
                    <Avatar
                      initials={item.initials}
                      size="sm"
                      tone={item.initials === "AM" ? "sage" : "blue"}
                    />
                    <div>
                      <strong>{item.author}</strong>
                      <time>{item.time}</time>
                      <p>{item.body}</p>
                    </div>
                  </article>
                ))}
              </div>
              <form
                className="message-composer"
                onSubmit={(e) => {
                  e.preventDefault();
                  setMessage("");
                }}
              >
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write a message..."
                  aria-label="Discussion message"
                />
                <button
                  className="icon-button"
                  type="submit"
                  aria-label="Send message"
                  disabled={!message.trim()}
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
