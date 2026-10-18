"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { ArrowUpRight, FileUp } from "lucide-react";

import DocumentTree, { buildDocumentTree, buildReviewMap } from "@/components/aegis/DocumentTree";
import PageContainer from "@/components/aegis/PageContainer";
import StatusPill from "@/components/aegis/StatusPill";
import TypeBadge from "@/components/aegis/TypeBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGroup } from "@/hooks/useGroup";
import { useDocuments } from "@/hooks/useDocuments";
import { useReviews } from "@/hooks/useReviews";
import { useFetch } from "@/hooks/useFetch";
import { getGroupMembers } from "@aegis/api-client";
import { initialsFromName, reviewStatusLabel } from "@aegis/domain";
import type { GroupMember } from "@aegis/domain";
import { cn } from "cn";

const ROLE_TONES: Record<string, string> = {
  creator: "border-warning/40 bg-warning/15 text-warning",
  submitter: "border-info/30 bg-info/10 text-info",
  reviewer: "border-violet-300 bg-violet-500/10 text-violet-600",
};

const panel = "rounded-xl border bg-card p-6 shadow-sm";

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-4">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-1 text-base font-semibold">{title}</h2>
    </div>
  );
}

export default function GroupOverviewPage() {
  const params = useParams();
  const groupId = params?.id as string;

  const { data: group, error } = useGroup(groupId);
  const { data: docData } = useDocuments(1, 100, groupId);
  const { data: reviewData } = useReviews(1, 100);
  const { data: membersData } = useFetch(
    () => getGroupMembers(groupId),

    [groupId],
  );

  const members: GroupMember[] = membersData ?? [];
  const documents = useMemo(() => docData?.items ?? [], [docData]);
  const docIds = useMemo(() => new Set(documents.map((d) => d.id)), [documents]);
  const reviews = useMemo(
    () => (reviewData?.items ?? []).filter((r) => docIds.has(r.documentId)),
    [reviewData, docIds],
  );
  const docById = useMemo(() => new Map(documents.map((d) => [d.id, d])), [documents]);
  const nodes = useMemo(() => buildDocumentTree(documents), [documents]);
  const reviewsByDocument = useMemo(() => buildReviewMap(reviews), [reviews]);

  const openCount = reviews.filter((r) => r.status !== "Completed").length;
  const completedCount = reviews.filter((r) => r.status === "Completed").length;
  const latestReview = useMemo(
    () =>
      reviews.reduce<(typeof reviews)[number] | null>(
        (latest, r) => (!latest || new Date(r.createdAt) > new Date(latest.createdAt) ? r : latest),
        null,
      ),
    [reviews],
  );
  const primaryDoc = useMemo(() => {
    if (documents.length === 0) return null;
    return [...documents].sort((a, b) => a.version - b.version).at(-1) ?? null;
  }, [documents]);
  const versionsCount = documents.length;

  if (error) {
    return (
      <PageContainer>
        <p className="text-sm text-destructive">{error}</p>
        <Link href="/groups" className="text-sm font-semibold text-primary hover:underline">
          Back to groups
        </Link>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/groups" className="hover:text-primary">
          Groups
        </Link>
        <span>/</span>
        <span>{group?.name ?? "Loading..."}</span>
      </div>

      <div className="mb-7">
        <p className="eyebrow">Research group</p>
        <h1 className="font-heading mt-1">{group?.name ?? "Loading..."}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{group?.description ?? " "}</p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_310px]">
        <div className="grid gap-5">
          {documents.length === 0 ? (
            <section className={panel}>
              <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-11 text-center text-muted-foreground">
                <FileUp className="size-7" />
                <strong className="text-foreground">
                  No document in review yet in this group.
                </strong>
                <p className="text-sm">
                  Upload a PDF to start the first review round in this group.
                </p>
                <Button asChild className="mt-2">
                  <Link href={`/groups/${groupId}/documents/new`}>
                    <FileUp className="size-4" />
                    Upload document
                  </Link>
                </Button>
              </div>
            </section>
          ) : (
            <>
              <section className={panel}>
                <SectionHeading eyebrow="Document" title="Current version" />
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-sm font-semibold">{primaryDoc?.name}</strong>
                  {primaryDoc && (
                    <code className="rounded border bg-muted px-1.5 py-0.5 text-xs">
                      v{primaryDoc.version}
                    </code>
                  )}
                  {primaryDoc && <TypeBadge type={primaryDoc.type} />}
                  {latestReview && <StatusPill status={reviewStatusLabel(latestReview.status)} />}
                </div>
                <p className="mt-2.5 text-sm text-muted-foreground">
                  {openCount} open review(s); {completedCount} completed.
                </p>
              </section>

              <section className={panel}>
                <SectionHeading eyebrow="Versioning" title="Document versions" />
                <DocumentTree nodes={nodes} reviewsByDocument={reviewsByDocument} />
              </section>

              <section className={panel}>
                <SectionHeading eyebrow="Review rounds" title="Reviews for this document" />
                {reviews.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No review rounds yet. Each uploaded version can start one.
                  </p>
                ) : (
                  <ul className="grid gap-1">
                    {reviews
                      .slice()
                      .sort(
                        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
                      )
                      .map((review) => {
                        const rDoc = docById.get(review.documentId);
                        return (
                          <li
                            key={review.id}
                            className="flex flex-wrap items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-muted/60"
                          >
                            <Link
                              className="grid flex-1 gap-0.5"
                              href={`/groups/${groupId}/reviews/${review.id}/workspace`}
                            >
                              <strong className="text-sm font-semibold">{review.title}</strong>
                              <small className="text-xs text-muted-foreground">
                                {rDoc?.name ?? "Document"} · v{rDoc?.version ?? "?"} ·{" "}
                                {review.assigneeName ?? "Unassigned"}
                              </small>
                            </Link>
                            <StatusPill status={reviewStatusLabel(review.status)} />
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/groups/${groupId}/reviews/${review.id}/workspace`}>
                                Open review
                              </Link>
                            </Button>
                          </li>
                        );
                      })}
                  </ul>
                )}
              </section>
            </>
          )}
        </div>

        <aside className="grid content-start gap-5 max-lg:grid-cols-2 max-md:grid-cols-1">
          <section className={cn(panel, "max-lg:col-span-2 max-md:col-span-1")}>
            <h2 className="text-base font-semibold">Group stats</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { label: "Documents", value: documents.length },
                { label: "Versions", value: versionsCount },
                { label: "Participants", value: members.length },
                { label: "Open reviews", value: openCount },
              ].map((s) => (
                <span
                  key={s.label}
                  className="flex flex-col items-center gap-0.5 rounded-lg border bg-muted/40 px-2 py-3.5 text-center text-xs text-muted-foreground"
                >
                  <strong className="font-heading text-2xl font-bold text-primary">
                    {s.value}
                  </strong>
                  {s.label}
                </span>
              ))}
              <span className="col-span-2 flex flex-row items-baseline justify-center gap-2 rounded-lg border bg-muted/40 px-2 py-3.5 text-xs text-muted-foreground">
                <strong className="font-heading text-xl font-bold text-primary">
                  {completedCount}
                </strong>
                Completed
              </span>
            </div>
          </section>

          <section className={panel}>
            <SectionHeading eyebrow="Membership" title="Participants" />
            {members.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No participants linked to this group yet.
              </p>
            ) : (
              <ul className="grid gap-1">
                {members.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center gap-2.5 rounded-lg px-1 py-1.5 transition hover:bg-muted/60"
                  >
                    <span
                      className="flex size-7 items-center justify-center rounded-full border border-info/30 bg-info/10 text-[0.68rem] font-bold text-info"
                      aria-hidden="true"
                    >
                      {initialsFromName(m.displayName)}
                    </span>
                    <span className="text-sm">{m.displayName}</span>
                    <span className="ml-auto flex flex-wrap gap-1">
                      {m.roles.map((role) => (
                        <Badge
                          key={role}
                          variant="outline"
                          className={cn(
                            "font-bold uppercase",
                            ROLE_TONES[role.toLowerCase()] ??
                              "border-border bg-muted text-muted-foreground",
                          )}
                        >
                          {role}
                        </Badge>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {latestReview && (
            <Link
              className={cn(panel, "grid gap-2 transition hover:border-primary/40 hover:shadow-md")}
              href={`/groups/${groupId}/reviews/${latestReview.id}/workspace`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="eyebrow">Latest activity</p>
                  <h2 className="mt-1 text-base font-semibold">Most recent review</h2>
                </div>
                <ArrowUpRight className="size-4 text-muted-foreground" />
              </div>
              <strong className="text-sm font-semibold break-words">{latestReview.title}</strong>
              <p className="text-sm text-muted-foreground">
                {docById.get(latestReview.documentId)?.name ?? "Document"}
                {docById.get(latestReview.documentId)?.version
                  ? ` · v${docById.get(latestReview.documentId)!.version}`
                  : ""}
              </p>
              <StatusPill status={reviewStatusLabel(latestReview.status)} />
            </Link>
          )}
        </aside>
      </div>
    </PageContainer>
  );
}
