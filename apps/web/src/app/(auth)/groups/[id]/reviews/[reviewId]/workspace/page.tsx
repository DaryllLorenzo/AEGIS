"use client";

import { useParams } from "next/navigation";

import ReviewWorkspace from "@/components/aegis/ReviewWorkspace";

export default function WorkspacePage() {
  const params = useParams();
  const reviewId = params?.reviewId as string;

  if (!reviewId)
    return <div className="p-10 text-center text-sm text-muted-foreground">Loading...</div>;

  return <ReviewWorkspace reviewId={reviewId} />;
}
