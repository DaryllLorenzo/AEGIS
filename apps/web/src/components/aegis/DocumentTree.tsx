"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  ChevronRight,
  FileText,
  GitBranchPlus,
} from "lucide-react";

import type { DocumentDto, Review, ReviewStatus } from "@/lib/api";
import StatusPill from "./StatusPill";
import { reviewStatusLabel } from "@/lib/utils";

export type DocNode = {
  doc: DocumentDto;
  version: number;
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

  const build = (doc: DocumentDto, depth: number): DocNode => ({
    doc,
    version: depth + 1,
    children: (childrenOf.get(doc.id) ?? []).map((child) => build(child, depth + 1)),
  });

  return roots.map((doc) => build(doc, 0));
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

function TreeNode({
  node,
  reviewsByDocument,
  openLabel,
  newVersionLabel,
  statusLabel,
}: TreeNodeProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { doc, version, children } = node;
  const hasChildren = children.length > 0;
  const review = reviewsByDocument.get(doc.id);

  return (
    <div className="doc-tree-node">
      <div className="doc-tree-row">
        <button
          className="doc-tree-toggle icon-button"
          type="button"
          aria-label={collapsed ? "Expand versions" : "Collapse versions"}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((value) => !value)}
          tabIndex={hasChildren ? 0 : -1}
          disabled={!hasChildren}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
        </button>
        <span className="doc-tree-icon" aria-hidden="true">
          <FileText size={17} />
        </span>
        <div className="doc-tree-copy">
          <div className="doc-tree-title">
            <strong>{doc.name}</strong>
            <code className="doc-tree-version">v{version}</code>
            {review ? (
              <StatusPill status={reviewStatusLabel(review.status)} />
            ) : (
              <span className="doc-tree-noreview">No review yet</span>
            )}
          </div>
          <div className="doc-tree-meta">
            <span>{doc.totalPages} pages</span>
            <span>{formatSize(doc.fileSize)}</span>
            <span>Updated {formatDate(doc.updatedAt ?? doc.createdAt)}</span>
          </div>
        </div>
        <div className="doc-tree-actions">
          {review && (
            <Link
              className="button button--secondary button--sm"
              href={`/reviews/${review.id}`}
            >
              {openLabel} <ArrowRight size={14} />
            </Link>
          )}
          <Link
            className="icon-button icon-button--outlined"
            href={`/reviews/new?parentId=${doc.id}&groupId=${doc.groupId}`}
            aria-label={newVersionLabel.replace("{name}", doc.name)}
            title={newVersionLabel.replace("{name}", doc.name)}
          >
            <GitBranchPlus size={16} />
          </Link>
        </div>
      </div>

      {hasChildren && !collapsed && (
        <div className="doc-tree-children">
          {children.map((child) => (
            <TreeNode
              key={child.doc.id}
              node={child}
              reviewsByDocument={reviewsByDocument}
              openLabel={openLabel}
              newVersionLabel={newVersionLabel}
              statusLabel={statusLabel}
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
    <div className="doc-tree" role="tree" aria-label="Document hierarchy">
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
