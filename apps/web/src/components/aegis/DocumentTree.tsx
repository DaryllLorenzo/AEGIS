"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, ChevronRight, FileText, GitBranchPlus } from "lucide-react";

import { reviewStatusLabel } from "@aegis/domain";
import type { DocumentDto, Review, ReviewStatus } from "@aegis/domain";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import StatusPill from "./StatusPill";
import TypeBadge from "./TypeBadge";

export type DocNode = {
  doc: DocumentDto;
  children: DocNode[];
};

export function buildDocumentTree(docs: DocumentDto[]): DocNode[] {
  const byId = new Map(docs.map((d) => [d.id, d]));
  const childrenOf = new Map<string, DocumentDto[]>();
  const roots: DocumentDto[] = [];

  for (const doc of docs) {
    if (doc.parentId && byId.has(doc.parentId)) {
      const siblings = childrenOf.get(doc.parentId) ?? [];
      siblings.push(doc);
      childrenOf.set(doc.parentId, siblings);
    } else {
      roots.push(doc);
    }
  }

  const build = (doc: DocumentDto): DocNode => ({
    doc,
    children: (childrenOf.get(doc.id) ?? []).map((child) => build(child)),
  });

  return roots.map((doc) => build(doc));
}

export function buildReviewMap(reviews: Review[]): Map<string, Review> {
  const map = new Map<string, Review>();
  for (const review of reviews) {
    const existing = map.get(review.documentId);
    if (!existing || new Date(review.createdAt) > new Date(existing.createdAt)) {
      map.set(review.documentId, review);
    }
  }
  return map;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type TreeNodeProps = {
  node: DocNode;
  reviewsByDocument: Map<string, Review>;
  openLabel: string;
  newVersionLabel: string;
  statusLabel: (status: ReviewStatus) => string;
};

function TreeNode({ node, reviewsByDocument, openLabel, newVersionLabel }: TreeNodeProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { doc, children } = node;
  const hasChildren = children.length > 0;
  const review = reviewsByDocument.get(doc.id);
  const newVersionTitle = newVersionLabel.replace("{name}", doc.name);

  return (
    <div>
      <div className="grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border bg-card px-3 py-2.5 transition hover:border-primary/40 hover:shadow-sm max-md:grid-cols-[auto_auto_minmax(0,1fr)]">
        <button
          className="flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-0"
          type="button"
          aria-label={collapsed ? "Expand versions" : "Collapse versions"}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((value) => !value)}
          tabIndex={hasChildren ? 0 : -1}
          disabled={!hasChildren}
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}
        </button>

        <span
          className="flex size-9 items-center justify-center rounded-lg bg-info/10 text-info"
          aria-hidden="true"
        >
          <FileText className="size-4" />
        </span>

        <div className="grid min-w-0 gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <strong className="truncate text-sm font-semibold">{doc.name}</strong>
            <code className="rounded border bg-muted px-1.5 py-0.5 text-xs">v{doc.version}</code>
            <TypeBadge type={doc.type} />
            {review ? (
              <StatusPill status={reviewStatusLabel(review.status)} />
            ) : (
              <span className="text-xs text-muted-foreground italic">No review yet</span>
            )}
          </div>
          <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-xs text-muted-foreground">
            <span>{doc.totalPages} pages</span>
            <span>{formatSize(doc.fileSize)}</span>
            <span>Updated {formatDate(doc.updatedAt ?? doc.createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-1.5 max-md:col-span-full">
          {review && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/groups/${doc.groupId}/reviews/${review.id}/workspace`}>
                {openLabel} <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon-sm" asChild>
                <Link
                  href={`/groups/${doc.groupId}/documents/new?parentId=${doc.id}`}
                  aria-label={newVersionTitle}
                >
                  <GitBranchPlus className="size-4" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{newVersionTitle}</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {hasChildren && !collapsed && (
        <div className="mt-1 ml-6 grid gap-1 border-l pl-4">
          {children.map((child) => (
            <TreeNode
              key={child.doc.id}
              node={child}
              reviewsByDocument={reviewsByDocument}
              openLabel={openLabel}
              newVersionLabel={newVersionLabel}
              statusLabel={reviewStatusLabel}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type DocumentTreeProps = {
  nodes: DocNode[];
  reviewsByDocument: Map<string, Review>;
  /** Label for the primary action (default: "Open review"). */
  openLabel?: string;
  /** Tooltip/aria for the new-version action. "{name}" is replaced with the document name. */
  newVersionLabel?: string;
  /** Maps review status to the pill label (default: review status label). */
  statusLabel?: (status: ReviewStatus) => string;
};

export default function DocumentTree({
  nodes,
  reviewsByDocument,
  openLabel = "Open review",
  newVersionLabel = "Start a new version of {name}",
  statusLabel = reviewStatusLabel,
}: DocumentTreeProps) {
  if (nodes.length === 0) return null;

  return (
    <div className="grid gap-1" role="tree" aria-label="Document hierarchy">
      {nodes.map((node) => (
        <TreeNode
          key={node.doc.id}
          node={node}
          reviewsByDocument={reviewsByDocument}
          openLabel={openLabel}
          newVersionLabel={newVersionLabel}
          statusLabel={statusLabel}
        />
      ))}
    </div>
  );
}
