"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, CheckCircle2, Clock3 } from "lucide-react";
import { useEffect, useState } from "react";

import AppShell from "@/components/aegis/AppShell";
import AuthGuard from "@/components/aegis/AuthGuard";
import GroupTabs from "@/components/aegis/GroupTabs";
import { getReviews, getDocuments, reviewStatusLabel, type Review, type DocumentDto } from "@/lib/api";

export default function GroupReviewsPage() {
  const params = useParams();
  const groupId = params?.id as string;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [documents, setDocuments] = useState<DocumentDto[]>([]);

  useEffect(() => {
    if (!groupId) return;
    Promise.all([
      getReviews(1, 100),
      getDocuments(1, 100, groupId),
    ]).then(([reviewRes, docRes]) => {
      const docIds = new Set(docRes.items.map((d) => d.id));
      const filtered = reviewRes.items.filter((r) => docIds.has(r.documentId));
      setReviews(filtered);
      setDocuments(docRes.items);
    }).catch(() => {});
  }, [groupId]);

  const docMap = new Map(documents.map((d) => [d.id, d]));

  return (
    <AuthGuard>
      <AppShell searchPlaceholder="Search group reviews...">
        <div className="page-container">
          <div className="breadcrumb"><Link href="/groups">Groups</Link><span>/</span><Link href={`/groups/${groupId}`}>Group</Link><span>/</span><span>Reviews</span></div>
          <div className="page-heading"><p className="eyebrow">Reviews</p><h1>Review rounds</h1><p>Current and completed reviews for documents in this research group.</p></div>
          <GroupTabs groupId={groupId} active="reviews" />

          <div className="navigation-grid">
            {reviews.map((review) => {
              const doc = docMap.get(review.documentId);
              return (
                <Link className="navigation-card" href={`/reviews/${review.id}`} key={review.id}>
                  <span className="navigation-card__icon">
                    {review.status === "Completed" ? <CheckCircle2 size={21} /> : <Clock3 size={21} />}
                  </span>
                  <span className="navigation-card__copy">
                    <h2>{review.title}</h2>
                    <p>{doc?.name ?? "Document"} {review.version ? `— ${review.version}` : ""}</p>
                    <small>{reviewStatusLabel(review.status)}</small>
                  </span>
                  <ArrowRight size={18} />
                </Link>
              );
            })}

            {reviews.length === 0 && (
              <p className="muted">No reviews found for this group.</p>
            )}
          </div>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
