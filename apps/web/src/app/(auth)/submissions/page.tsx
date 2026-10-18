"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, FileUp, GitBranchPlus, Search, ShieldCheck } from "lucide-react";

import DocumentTree, { buildDocumentTree, buildReviewMap } from "@/components/aegis/DocumentTree";
import PageContainer from "@/components/aegis/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getReviews } from "@aegis/api-client";
import { isReviewOverdue, submissionStatusLabel } from "@aegis/domain";
import { useFetch } from "@/hooks/useFetch";
import { useDocuments } from "@/hooks/useDocuments";
import { useAuth } from "@/lib/auth-context";
import { cn } from "cn";

type SortKey = "updated" | "name";

const METRIC_TONE: Record<string, string> = {
  green: "bg-success/10 text-success",
  amber: "bg-warning/15 text-warning",
  blue: "bg-info/10 text-info",
};

export default function SubmissionsPage() {
  const { user } = useAuth();
  const [nonce, setNonce] = useState(0);
  const {
    data: reviewData,
    error,
    loading,
  } = useFetch(
    () => getReviews(1, 100),

    [nonce],
  );
  const { data: docData } = useDocuments(1, 100);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("updated");

  const reviews = useMemo(() => reviewData?.items ?? [], [reviewData]);
  const docs = useMemo(() => docData?.items ?? [], [docData]);
  const myUserId = user?.userId;

  // My submissions = reviews I created (the document I submitted for review).
  const myReviews = useMemo(
    () => (myUserId ? reviews.filter((r) => r.userId === myUserId) : []),
    [reviews, myUserId],
  );

  // Expand my documents to their full version chains so parent/child
  // context is visible, then render them with the tree visual.
  const treeDocs = useMemo(() => {
    const byId = new Map(docs.map((d) => [d.id, d]));
    const keep = new Set<string>();

    for (const review of myReviews) {
      let current = byId.get(review.documentId);
      let guard = 0;
      // Walk up to the root so the whole version chain is included.
      while (current && guard++ < 100) {
        keep.add(current.id);
        current = current.parentId ? byId.get(current.parentId) : undefined;
      }
    }

    // Also include children (later versions) of every kept document.
    let grew = true;
    while (grew) {
      grew = false;
      for (const doc of docs) {
        if (doc.parentId && keep.has(doc.parentId) && !keep.has(doc.id)) {
          keep.add(doc.id);
          grew = true;
        }
      }
    }

    return docs.filter((d) => keep.has(d.id));
  }, [docs, myReviews]);

  const q = query.trim().toLowerCase();
  const filteredDocs = useMemo(() => {
    if (!q) return treeDocs;
    return treeDocs.filter((d) => d.name.toLowerCase().includes(q));
  }, [treeDocs, q]);

  const sortedDocs = useMemo(
    () =>
      [...filteredDocs].sort((a, b) => {
        if (sort === "name") return a.name.localeCompare(b.name);
        return (
          new Date(b.updatedAt ?? b.createdAt).getTime() -
          new Date(a.updatedAt ?? a.createdAt).getTime()
        );
      }),
    [filteredDocs, sort],
  );

  const nodes = useMemo(() => buildDocumentTree(sortedDocs), [sortedDocs]);
  const reviewsByDocument = useMemo(() => buildReviewMap(reviews), [reviews]);

  const myDocIds = useMemo(() => new Set(myReviews.map((r) => r.documentId)), [myReviews]);

  const counts = useMemo(() => {
    const mine = myReviews;
    return {
      total: myDocIds.size,
      underReview: mine.filter((r) => r.status === "InProgress").length,
      approved: mine.filter((r) => r.status === "Completed").length,
      versions: treeDocs.filter((d) => d.parentId).length,
    };
  }, [myReviews, myDocIds, treeDocs]);

  const metrics = [
    { label: "Documents", note: "Submitted", value: counts.total, icon: FileUp, tone: "green" },
    {
      label: "Under review",
      note: "With reviewers",
      value: counts.underReview,
      icon: Search,
      tone: "amber",
    },
    {
      label: "Approved",
      note: "Review closed",
      value: counts.approved,
      icon: ShieldCheck,
      tone: "green",
    },
    {
      label: "New versions",
      note: "History",
      value: counts.versions,
      icon: GitBranchPlus,
      tone: "blue",
    },
  ];

  return (
    <PageContainer>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success">
            <FileUp className="size-5" />
          </span>
          <div>
            <p className="eyebrow">Research objects</p>
            <h1 className="mt-1">My submissions</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Documents you have submitted for review, with every version nested underneath. Track
              whether each version is submitted, under review, or approved.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button asChild>
            <Link href="/groups">
              <GitBranchPlus className="size-4" />
              Submit a document
            </Link>
          </Button>
        </div>
      </div>

      <section
        className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        aria-label="Submission summary"
      >
        {metrics.map(({ label, note, value, icon: Icon, tone }) => (
          <article key={label} className="relative rounded-xl border bg-card p-5 shadow-sm">
            <span className="absolute top-5 right-5 rounded bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
              {note}
            </span>
            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-lg",
                METRIC_TONE[tone],
              )}
            >
              <Icon className="size-5" />
            </div>
            <strong className="font-heading mt-5 block text-3xl leading-none font-bold">
              {value}
            </strong>
            <p className="mt-2 text-sm font-semibold text-muted-foreground">{label}</p>
          </article>
        ))}
      </section>

      <div className="mt-6 mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative flex w-full max-w-xs items-center">
          <Search className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter submissions..."
            aria-label="Filter submissions by name"
            className="pl-9"
          />
        </label>
        <div
          className="inline-flex gap-0.5 rounded-lg border bg-card p-0.5 sm:ml-auto"
          role="group"
          aria-label="Sort submissions"
        >
          {(
            [
              { key: "updated", label: "Recently updated" },
              { key: "name", label: "Name" },
            ] as const
          ).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setSort(key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-semibold transition-colors",
                sort === key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div
          className="mb-5 flex items-center justify-between gap-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          <p>{error}</p>
          <Button variant="outline" size="sm" type="button" onClick={() => setNonce((n) => n + 1)}>
            Retry
          </Button>
        </div>
      )}

      {loading ? (
        <div className="grid gap-3" aria-busy="true" aria-label="Loading submissions">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="grid gap-3 rounded-lg border bg-card p-5">
              <Skeleton className="h-2.5 w-2/5" />
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-3.5 w-full" />
            </div>
          ))}
        </div>
      ) : nodes.length > 0 ? (
        <DocumentTree
          nodes={nodes}
          reviewsByDocument={reviewsByDocument}
          openLabel="View review"
          newVersionLabel="Upload new version of {name}"
          statusLabel={submissionStatusLabel}
        />
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-11 text-center text-muted-foreground">
          <FileUp className="size-7" />
          {q ? (
            <p className="text-sm">No submissions match &ldquo;{q}&rdquo;.</p>
          ) : (
            <>
              <strong className="text-foreground">No submissions yet</strong>
              <p className="max-w-md text-sm">
                Upload a document to start your first review round. Each new version you upload is
                nested under the previous one.
              </p>
              <Button asChild className="mt-2">
                <Link href="/groups">
                  <FileUp className="size-4" />
                  Submit a document
                </Link>
              </Button>
            </>
          )}
        </div>
      )}

      {!loading && myReviews.some((r) => isReviewOverdue(r)) && (
        <p className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold text-warning">
          <CalendarDays className="size-4" />
          Some of your submissions are past their review due date.
        </p>
      )}
    </PageContainer>
  );
}
