"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { FilePlus2, Search } from "lucide-react";

import GroupTabs from "@/components/aegis/GroupTabs";
import DocumentTree, {
  buildDocumentTree,
  buildReviewMap,
} from "@/components/aegis/DocumentTree";
import { useDocuments } from "@/hooks/useDocuments";
import { useReviews } from "@/hooks/useReviews";

type SortKey = "name" | "updated";

export default function DocumentsPage() {
  const params = useParams();
  const groupId = params?.id as string;

  const { data: docData } = useDocuments(1, 100, groupId);
  const { data: reviewData } = useReviews(1, 100);

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("updated");

  const documents = useMemo(() => {
    const items = docData?.items ?? [];
    const q = query.trim().toLowerCase();
    const filtered = q
      ? items.filter((d) => d.name.toLowerCase().includes(q))
      : items;
    return [...filtered].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      return (
        new Date(b.updatedAt ?? b.createdAt).getTime() -
        new Date(a.updatedAt ?? a.createdAt).getTime()
      );
    });
  }, [docData, query, sort]);

  const nodes = useMemo(() => buildDocumentTree(documents), [documents]);
  const reviewsByDocument = useMemo(
    () => buildReviewMap(reviewData?.items ?? []),
    [reviewData],
  );

  return (
    <div className="page-container documents-page">
      <div className="breadcrumb">
        <Link href="/groups">Groups</Link>
        <span>/</span>
        <Link href={`/groups/${groupId}`}>Group</Link>
        <span>/</span>
        <span>Documents</span>
      </div>

      <div className="page-heading page-heading--split">
        <div>
          <p className="eyebrow">Documents</p>
          <h1>Research objects</h1>
          <p>Every document with its versions nested underneath. Pick a version to review, or start a new one.</p>
        </div>
        <div className="heading-actions">
          <Link
            className="button button--primary"
            href={`/reviews/new?groupId=${groupId}`}
          >
            <FilePlus2 size={16} />
            New document
          </Link>
        </div>
      </div>

      <GroupTabs groupId={groupId} active="documents" />

      <div className="doc-toolbar">
        <label className="search-field">
          <Search size={17} aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter documents..."
            aria-label="Filter documents by name"
          />
        </label>
        <div className="sort-toggle" role="group" aria-label="Sort documents">
          <button
            type="button"
            className={sort === "updated" ? "is-active" : ""}
            onClick={() => setSort("updated")}
          >
            Recently updated
          </button>
          <button
            type="button"
            className={sort === "name" ? "is-active" : ""}
            onClick={() => setSort("name")}
          >
            Name
          </button>
        </div>
      </div>

      {nodes.length > 0 ? (
        <DocumentTree
          nodes={nodes}
          reviewsByDocument={reviewsByDocument}
        />
      ) : (
        <div className="empty-state">
          <FilePlus2 size={28} />
          {query ? (
            <p>No documents match &ldquo;{query}&rdquo;.</p>
          ) : (
            <>
              <strong>No documents yet</strong>
              <p>Upload a PDF to start the first review round in this group.</p>
              <Link
                className="button button--primary"
                href={`/reviews/new?groupId=${groupId}`}
              >
                <FilePlus2 size={16} />
                New document
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
