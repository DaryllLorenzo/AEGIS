"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FolderPlus,
  ListChecks,
  PenLine,
  UserRoundPlus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import PageContainer from "@/components/aegis/PageContainer";
import StatusPill from "@/components/aegis/StatusPill";
import NewGroupDialog from "@/components/aegis/NewGroupDialog";
import { useDocuments } from "@/hooks/useDocuments";
import { useReviews } from "@/hooks/useReviews";
import { reviewStatusLabel, reviewStatusClass } from "@aegis/domain";
import { cn } from "cn";

const CARD_ACCENT: Record<string, string> = {
  open: "border-l-info",
  "in-progress": "border-l-warning",
  completed: "border-l-success",
};

const METRIC_TONE: Record<string, string> = {
  blue: "bg-info/10 text-info",
  amber: "bg-warning/15 text-warning",
  green: "bg-success/10 text-success",
};

export default function Home() {
  const { data } = useReviews(1, 20);
  const reviews = data?.items ?? [];
  const { data: docData } = useDocuments(1, 100);
  const docById = useMemo(() => new Map((docData?.items ?? []).map((d) => [d.id, d])), [docData]);
  const [newGroupOpen, setNewGroupOpen] = useState(false);
  // Snapshot of "now" for the metrics: calling Date.now() on every render is
  // impure (react-hooks/purity).
  const [now] = useState(() => Date.now());

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const metrics = [
    {
      label: "Pending reviews",
      value: reviews.filter((r) => r.status !== "Completed").length,
      note: "Requires action",
      icon: ClipboardCheck,
      tone: "blue",
    },
    {
      label: "Due soon",
      value: reviews.filter(
        (r) => r.dueDate && new Date(r.dueDate).getTime() - now < 48 * 60 * 60 * 1000,
      ).length,
      note: "Next 48 hours",
      icon: Clock3,
      tone: "amber",
    },
    {
      label: "Completed",
      value: reviews.filter((r) => r.status === "Completed").length,
      note: "All time",
      icon: CheckCircle2,
      tone: "green",
    },
  ];

  const steps = [
    {
      icon: FolderPlus,
      title: "Create a group",
      text: "Organize your research into groups — one per lab or project.",
      action: (
        <Button variant="outline" size="sm" type="button" onClick={() => setNewGroupOpen(true)}>
          <FolderPlus className="size-4" />
          New group
        </Button>
      ),
    },
    {
      icon: ListChecks,
      title: "Set up a review",
      text: "Upload a document or pick an existing one, then assign a reviewer.",
      action: (
        <Button variant="outline" size="sm" asChild>
          <Link href="/groups">
            <ListChecks className="size-4" />
            New review
          </Link>
        </Button>
      ),
    },
    {
      icon: PenLine,
      title: "Review the document",
      text: "Annotate the PDF, flag issues, then complete the review round.",
      action: (
        <Button variant="outline" size="sm" asChild>
          <Link href="/groups">
            <PenLine className="size-4" />
            Open reviews
          </Link>
        </Button>
      ),
    },
  ];

  return (
    <PageContainer>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1 className="mt-1">{greeting}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Here is the status of your research reviews.
          </p>
        </div>
        <div
          className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground"
          aria-label="Review status legend"
        >
          <span className="flex items-center gap-2">
            <i className="size-2 rounded-full bg-success" /> Completed
          </span>
          <span className="flex items-center gap-2">
            <i className="size-2 rounded-full bg-warning" /> In progress
          </span>
          <span className="flex items-center gap-2">
            <i className="size-2 rounded-full bg-info" /> Open
          </span>
        </div>
      </div>

      <section
        className="mt-8 rounded-xl border bg-card p-5 shadow-sm"
        aria-label="How AEGIS works"
      >
        <p className="eyebrow">Workflow</p>
        <h2 className="mt-1 text-lg font-semibold">Start a review in three steps</h2>
        <ol className="mt-4 grid gap-3 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, text, action }, i) => (
            <li key={title} className="flex flex-col gap-3 rounded-lg border border-border/70 p-4">
              <div className="flex items-center gap-3">
                <span className="flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </span>
              </div>
              <div className="grid gap-1">
                <h3 className="text-base font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
              <div className="mt-auto">{action}</div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-7 grid gap-4 sm:grid-cols-3" aria-label="Review activity">
        {metrics.map(({ label, value, note, icon: Icon, tone }) => (
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

      <section className="mt-10 grid gap-4">
        <div className="flex items-end justify-between border-b pb-3">
          <div>
            <p className="eyebrow">Your queue</p>
            <h2 className="mt-1 text-lg font-semibold">Pending reviews</h2>
          </div>
          <Link
            className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            href="/groups"
          >
            View all <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {reviews.map((review) => {
            const statusClass = reviewStatusClass(review.status);
            return (
              <article
                key={review.id}
                className={cn(
                  "rounded-xl border border-l-4 bg-card p-5 shadow-sm transition hover:shadow-md",
                  CARD_ACCENT[statusClass] ?? CARD_ACCENT.open,
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                    <i
                      className={cn(
                        "size-2 rounded-full",
                        statusClass === "completed"
                          ? "bg-success"
                          : statusClass === "in-progress"
                            ? "bg-warning"
                            : "bg-info",
                      )}
                    />
                    {review.kind ?? "Review"}
                  </span>
                  <StatusPill status={reviewStatusLabel(review.status)} />
                </div>

                <h3 className="mt-3.5 text-base font-semibold break-words">{review.title}</h3>

                <div className="mt-2.5 flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <code className="rounded border bg-muted px-1.5 py-0.5 text-xs">
                    Review #{review.id.slice(0, 8)}
                  </code>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="size-4" />
                    Due {review.dueDate ? new Date(review.dueDate).toLocaleDateString() : "TBD"}
                  </span>
                </div>

                <div className="mt-5 flex flex-col gap-3 border-t pt-4 sm:grid sm:grid-cols-[1fr_auto] sm:items-center">
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <UserRoundPlus className="size-4" />
                    {review.assigneeName ? `Assigned to ${review.assigneeName}` : "Unassigned"}
                  </span>
                  <Button
                    variant={review.status === "Completed" ? "outline" : "default"}
                    size="sm"
                    asChild
                    className="sm:justify-self-end"
                  >
                    <Link
                      href={`/groups/${docById.get(review.documentId)?.groupId ?? ""}/reviews/${review.id}/workspace`}
                    >
                      {review.status === "Completed"
                        ? "View"
                        : review.status === "InProgress"
                          ? "Continue"
                          : "Start review"}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </article>
            );
          })}

          {reviews.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No reviews found. Create one to get started.
            </p>
          )}
        </div>
      </section>

      <NewGroupDialog open={newGroupOpen} onClose={() => setNewGroupOpen(false)} />
    </PageContainer>
  );
}
