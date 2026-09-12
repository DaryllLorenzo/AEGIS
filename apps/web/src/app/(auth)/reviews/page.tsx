"use client";

import { CheckCircle2, Clock3 } from "lucide-react";

import NavigationPage from "@/components/aegis/NavigationPage";
import { useReviews } from "@/hooks/useReviews";
import { reviewStatusLabel } from "@/lib/utils";

export default function ReviewsPage() {
  const { data } = useReviews(1, 50);
  const reviews = data?.items ?? [];

  const items = reviews.map((review) => ({
    href: `/reviews/${review.id}`,
    title: `${review.kind ?? "Review"} — ${review.title}`,
    description: `Review for ${review.version ?? "latest version"}.`,
    meta: `${reviewStatusLabel(review.status)}${review.dueDate ? ` — due ${new Date(review.dueDate).toLocaleDateString()}` : ""}`,
    icon: review.status === "Completed" ? CheckCircle2 : Clock3,
  }));

  return (
    <NavigationPage
      eyebrow="Review queue"
      title="My reviews"
      description="Open, continue, and revisit the review rounds assigned to you."
      items={items}
    />
  );
}
