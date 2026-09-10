"use client";

import { useParams } from "next/navigation";

import ReviewWorkspace from "@/components/aegis/ReviewWorkspace";

export default function WorkspacePage() {
  const params = useParams();
  const reviewId = params?.id as string;

  if (!reviewId) return <div className="annotator-status">Loading...</div>;

  return <ReviewWorkspace reviewId={reviewId} />;
}
