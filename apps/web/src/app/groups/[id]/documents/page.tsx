"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, ArrowUpDown, Filter, History, MessageSquareText, Plus } from "lucide-react";
import { useEffect, useState } from "react";

import AppShell from "@/components/aegis/AppShell";
import AuthGuard from "@/components/aegis/AuthGuard";
import GroupTabs from "@/components/aegis/GroupTabs";
import StatusPill from "@/components/aegis/StatusPill";
import { getDocuments, type DocumentDto } from "@/lib/api";

export default function DocumentsPage() {
  const params = useParams();
  const groupId = params?.id as string;

  const [documents, setDocuments] = useState<DocumentDto[]>([]);
  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    if (!groupId) return;
    getDocuments(1, 50, groupId)
      .then((r) => setDocuments(r.items))
      .catch(() => setDocuments([]));
  }, [groupId]);

  return (
    <AuthGuard>
      <AppShell searchPlaceholder="Search documents...">
        <div className="page-container documents-page">
          <div className="breadcrumb"><Link href="/groups">Groups</Link><span>/</span><Link href={`/groups/${groupId}`}>{groupName || "Group"}</Link><span>/</span><span>Documents</span></div>
          <div className="page-heading page-heading--split">
            <div><p className="eyebrow">Documents</p><h1>Research objects</h1><p>Active documents for this group.</p></div>
            <div className="heading-actions">
              <button className="button button--secondary" type="button"><Filter size={16} />Filter</button>
              <button className="button button--secondary" type="button"><ArrowUpDown size={16} />Sort</button>
              <Link className="button button--primary" href="/reviews/new"><Plus size={16} />New document</Link>
            </div>
          </div>
          <GroupTabs groupId={groupId} active="documents" />

          <div className="documents-grid">
            {documents.map((doc) => (
              <article className="document-card" key={doc.id}>
                <div className="document-card__header">
                  <div><p className="eyebrow">{doc.mimeType}</p><h2>{doc.name}</h2></div>
                  <StatusPill status={doc.parentId ? "Versioned" : "Draft"} />
                </div>
                <div className="document-meta">
                  <code>{doc.parentId ? "v+" : "v1"}</code>
                  <span>Updated {new Date(doc.updatedAt ?? doc.createdAt).toLocaleDateString()}</span>
                  <span>{(doc.fileSize / 1024).toFixed(0)} KB</span>
                </div>
                <div className="document-card__footer">
                  <Link className="button button--secondary" href={`/groups/${groupId}/reviews`}>
                    View reviews <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}

            {documents.length === 0 && (
              <p className="muted">No documents yet. Upload one to get started.</p>
            )}
          </div>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
