"use client";

import { useParams } from "next/navigation";

import AuthGuard from "@/components/aegis/AuthGuard";
import ReviewWorkspace from "@/components/aegis/ReviewWorkspace";

export default function WorkspacePage() {
  const params = useParams();
  const reviewId = params?.id as string;

  if (!reviewId) return <div className="annotator-status">Loading...</div>;

  return (
    <AuthGuard>
      <ReviewWorkspace reviewId={reviewId} />
    </AuthGuard>
  );
}
