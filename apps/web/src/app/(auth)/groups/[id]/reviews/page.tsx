"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, CheckCircle2, Clock3 } from "lucide-react";

import GroupTabs from "@/components/aegis/GroupTabs";
import { useReviews } from "@/hooks/useReviews";
import { useDocuments } from "@/hooks/useDocuments";
import { reviewStatusLabel } from "@/lib/utils";

export default function GroupReviewsPage() {
  const params = useParams();
  const groupId = params?.id as string;

  const { data: reviewData } = useReviews(1, 100);
  const { data: docData } = useDocuments(1, 100, groupId);

  const documents = docData?.items ?? [];
  const docIds = new Set(documents.map((d) => d.id));
  const reviews = (reviewData?.items ?? []).filter((r) => docIds.has(r.documentId));
  const docMap = new Map(documents.map((d) => [d.id, d]));

  return (
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
  );
}
