"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, ClipboardList } from "lucide-react";
import { useEffect, useState } from "react";

import AppShell from "@/components/aegis/AppShell";
import { getReviewById, type Review } from "@/lib/api";

export default function ReviewOverviewPage() {
  const params = useParams();
  const reviewId = params?.id as string;

  const [review, setReview] = useState<Review | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reviewId) return;
    let cancelled = false;

    (async () => {
      try {
        const r = await getReviewById(reviewId);
        if (!cancelled) setReview(r);
      } catch (err) {
        if (!cancelled) setError("Failed to load review.");
      }
    })();

    return () => { cancelled = true; };
  }, [reviewId]);

  if (error) {
    return (
      <AppShell>
        <div className="page-container">
          <p>{error}</p>
          <Link href="/reviews">Back to reviews</Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell searchPlaceholder="Search reviews...">
      <div className="page-container review-overview-page">
        <div className="breadcrumb">
          <Link href="/reviews">My Reviews</Link>
          <span>/</span>
          <span>{review?.title ?? "Loading..."}</span>
        </div>
        <div className="review-title-block">
          <div className="review-title-block__badges">
            <span className="review-round"><i />Review · {review?.status ?? "Loading"}</span>
            {review?.version && <code>{review.version}</code>}
          </div>
          <h1 className="serif-title">{review?.title ?? "Loading..."}</h1>
          {review?.assignee && <p>Assigned to <strong>{review.assignee}</strong></p>}
        </div>

        <div className="review-overview-grid">
          <section className="content-panel instruction-panel">
            <div className="panel-heading">
              <ClipboardList size={21} />
              <div>
                <p className="eyebrow">Reviewer brief</p>
                <h2>Review instructions</h2>
              </div>
            </div>
            <blockquote>&ldquo;Please focus on methodology, references, and statistical analysis. Flag claims that require stronger evidence.&rdquo;</blockquote>
            <div className="review-focus">
              <span>Methodology</span>
              <span>References</span>
              <span>Statistics</span>
            </div>
            <Link className="button button--primary" href={`/reviews/${reviewId}/workspace`}>
              Start review <ArrowRight size={17} />
            </Link>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
