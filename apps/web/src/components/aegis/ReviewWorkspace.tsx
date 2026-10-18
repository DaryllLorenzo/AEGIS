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
  getGroupMembers,
  updateReview,
} from "@aegis/api-client";
import {
  reviewNextAction,
  nextReviewStatus,
  reviewStatusLabel,
  initialsFromName,
} from "@aegis/domain";
import type { Review, DocumentDto } from "@aegis/domain";
import { Button } from "@/components/ui/button";
import { useFetch } from "@/hooks/useFetch";
import { useAuth } from "@/lib/auth-context";
import { cn } from "cn";

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
  const { user } = useAuth();
  const [annotations, setAnnotations] = useState<Annotation[]>([]);

  // Permission context: this user's roles inside the review's group.
  const { data: membersData } = useFetch(
    () => (doc ? getGroupMembers(doc.groupId) : Promise.resolve([])),
    [doc?.groupId],
  );
  const myGroupRoles = (membersData ?? []).find((m) => m.id === user?.userId)?.roles ?? [];
  const groupHasReviewer = myGroupRoles.includes("Reviewer");
  const reviewIsInProgress = review?.status === "InProgress";
  const canStart = review?.status === "Pending" && groupHasReviewer;
  const canComplete = reviewIsInProgress && !!user && review?.assigneeId === user.userId;
  const canAnnotate = reviewIsInProgress && groupHasReviewer;

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
      return (
        <span
          className="h-2 w-10 rounded-sm opacity-50"
          style={{ background: getAnnotationColor(a) }}
        />
      );
    }
    if (a.type === "rectangle") {
      return (
        <svg viewBox="0 0 24 16" className="h-full w-auto" style={{ color: getAnnotationColor(a) }}>
          <rect
            x="1"
            y="1"
            width="22"
            height="14"
            rx="2"
            stroke="currentColor"
            fill="none"
            strokeWidth="2"
          />
        </svg>
      );
    }
    if (a.type === "circle") {
      return (
        <svg viewBox="0 0 24 24" className="h-full w-auto" style={{ color: getAnnotationColor(a) }}>
          <circle cx="12" cy="12" r="10" stroke="currentColor" fill="none" strokeWidth="2" />
        </svg>
      );
    }
    if (a.type === "ellipse") {
      return (
        <svg viewBox="0 0 24 16" className="h-full w-auto" style={{ color: getAnnotationColor(a) }}>
          <ellipse
            cx="12"
            cy="8"
            rx="11"
            ry="7"
            stroke="currentColor"
            fill="none"
            strokeWidth="2"
          />
        </svg>
      );
    }
    return null;
  }

  const isCompleted = review?.status === "Completed";
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

  const statusPill = (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold whitespace-nowrap",
        isCompleted ? "border-success/40 bg-success/10" : "border-warning/40 bg-warning/15",
      )}
      aria-live="polite"
    >
      <i className={cn("size-2 rounded-full", isCompleted ? "bg-success" : "bg-warning")} />
      {isCompleted
        ? "Your review · Completed"
        : `Review · ${review ? reviewStatusLabel(review.status) : "Loading"}`}
    </span>
  );

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-muted/60">
      <header className="relative z-50 flex h-[68px] shrink-0 items-center gap-3 border-b bg-card px-6">
        <Button asChild variant="ghost" size="icon" className="rounded-full">
          <Link href={doc ? `/groups/${doc.groupId}` : "/groups"} aria-label="Back to group">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <span className="h-7 w-px bg-border" />
        <Brand compact />
        <div className="flex min-w-0 flex-col">
          <span className="text-xs text-muted-foreground">{review?.kind ?? "Review"}</span>
          <strong className="max-w-[390px] truncate">{review?.title ?? "Loading..."}</strong>
        </div>
        <div className="ml-auto flex items-center gap-3">
          {statusPill}
          {nextAction ? (
            <Button
              type="button"
              onClick={handleAdvance}
              disabled={
                saving ||
                !review ||
                (nextAction.verb === "start" && !canStart) ||
                (nextAction.verb === "complete" && !canComplete)
              }
              title={
                nextAction.verb === "start" && !canStart
                  ? "Only Reviewers in this group can start a review."
                  : nextAction.verb === "complete" && !canComplete
                    ? "Only the assignee of this review can complete it."
                    : nextAction.hint
              }
            >
              {nextAction.verb === "start" ? (
                <Play className="size-4" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              {saving ? "Saving..." : nextAction.label}
            </Button>
          ) : (
            isCompleted && (
              <span className="inline-flex items-center gap-2 rounded-full border border-success/40 bg-success/10 px-3 py-1.5 text-xs font-semibold whitespace-nowrap">
                <CheckCircle2 className="size-4" />
                Review round closed
              </span>
            )
          )}
          {isCompleted && doc && (
            <Button asChild>
              <Link href={`/groups/${doc.groupId}/documents/new?parentId=${doc.id}`}>
                <FileText className="size-4" />
                New version
              </Link>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            type="button"
            aria-label="Download document"
            title="Download document"
            onClick={handleDownload}
            disabled={!doc || downloading}
          >
            <Download className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full max-[1180px]:inline-flex hidden"
            type="button"
            aria-label="Open review panel"
            onClick={() => setRightPanelOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
        </div>
      </header>

      {error && (
        <div
          className="flex items-center justify-center gap-3.5 border-b border-destructive/30 bg-destructive/10 px-5 py-3.5 text-sm text-destructive"
          role="alert"
        >
          <p>{error}</p>
          <Button asChild variant="secondary" size="sm">
            <Link href={doc ? `/groups/${doc.groupId}` : "/groups"}>Back to group</Link>
          </Button>
        </div>
      )}

      {statusError && (
        <div
          className="flex items-center justify-center gap-3.5 border-b border-destructive/30 bg-destructive/10 px-5 py-3.5 text-sm text-destructive"
          role="alert"
        >
          <p>{statusError}</p>
          <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick={handleAdvance}
            disabled={saving}
          >
            Try again
          </Button>
          <Button variant="link" size="sm" type="button" onClick={() => setStatusError(null)}>
            Dismiss
          </Button>
        </div>
      )}

      <div className="grid min-h-0 flex-1 grid-cols-1 min-[1180px]:grid-cols-[minmax(0,4fr)_1fr]">
        <section className="relative flex min-w-0 flex-1 overflow-hidden">
          <div className="flex w-full items-start justify-center overflow-auto p-8 pb-32 max-md:px-4">
            {loading && !error && (
              <div className="p-10 text-center text-muted-foreground">Loading document...</div>
            )}
            {!loading && !error && pdfFile && (
              <PdfAnnotator
                documentId={review?.documentId}
                file={pdfFile}
                onAnnotationsChange={setAnnotations}
                readOnly={!canAnnotate}
              />
            )}
          </div>
          {!canAnnotate && !loading && !error && (
            <div
              className="pointer-events-none absolute inset-x-0 bottom-5 z-20 flex justify-center px-4"
              role="status"
            >
              <span className="flex items-center gap-2 rounded-full border bg-card/95 px-3.5 py-2 text-xs font-semibold text-muted-foreground shadow-md backdrop-blur">
                <Lock className="size-4" aria-hidden="true" />
                {isCompleted
                  ? "Review round closed — annotations are read-only. Start a new version to continue."
                  : reviewIsInProgress && !groupHasReviewer
                    ? "Only Reviewers in this group can edit annotations."
                    : "Start the review to annotate this document."}
              </span>
            </div>
          )}
        </section>

        {rightPanelOpen && (
          <button
            className="fixed inset-x-0 top-[68px] bottom-0 z-40 bg-foreground/25 min-[1180px]:hidden"
            type="button"
            aria-label="Close review panel"
            onClick={() => setRightPanelOpen(false)}
          />
        )}
        <aside
          className={cn(
            "fixed top-[68px] right-0 bottom-0 z-40 flex w-[340px] flex-col overflow-hidden border-l bg-card shadow-2xl transition-transform duration-200",
            "min-[1180px]:static min-[1180px]:z-auto min-[1180px]:w-auto min-[1180px]:translate-x-0 min-[1180px]:shadow-none",
            rightPanelOpen ? "translate-x-0" : "translate-x-[105%]",
          )}
        >
          <div className="flex h-[58px] flex-none items-center justify-between border-b px-4">
            <h2 className="text-sm font-semibold">Annotations ({annotations.length})</h2>
          </div>

          <div className="grid min-h-0 flex-1 content-start gap-3.5 overflow-y-auto p-4">
            {annotations.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-5 text-center text-muted-foreground">
                <MessageSquarePlus className="size-6" />
                <p className="text-xs font-semibold">No annotations yet</p>
                <small className="text-[0.72rem]">
                  Use the toolbar to draw shapes or highlight text.
                </small>
              </div>
            ) : (
              [...annotations]
                .sort((a, b) => a.page - b.page)
                .map((a) => (
                  <article
                    key={a.id}
                    className="flex flex-col gap-2 rounded-lg border border-l-4 bg-card p-3"
                    style={{ borderLeftColor: getAnnotationColor(a) }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="flex size-5 items-center justify-center rounded text-sm font-bold"
                        style={{
                          background: `${getAnnotationColor(a)}26`,
                          color: getAnnotationColor(a),
                        }}
                      >
                        {getAnnotationIcon(a)}
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground">
                        Page {a.page}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="flex size-5 items-center justify-center rounded-full border text-[0.62rem] font-bold"
                        style={{
                          background: `${authorChipColor(a.authorName)}1a`,
                          borderColor: `${authorChipColor(a.authorName)}55`,
                          color: authorChipColor(a.authorName),
                        }}
                      >
                        {initialsFromName(a.authorName ?? "?")}
                      </span>
                      <span className="text-xs font-semibold">
                        {a.authorName ?? "Unknown author"}
                      </span>
                    </div>
                    {a.geometry && (
                      <div className="flex h-7 items-center justify-center opacity-60">
                        {renderMiniPreview(a)}
                      </div>
                    )}
                    {a.content ? (
                      <p className="rounded border bg-muted/50 px-2.5 py-2 text-[0.74rem] leading-relaxed whitespace-pre-wrap break-words">
                        {a.content}
                      </p>
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
