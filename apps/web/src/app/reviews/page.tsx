"use client";

import { CheckCircle2, Clock3 } from "lucide-react";
import { useEffect, useState } from "react";

import AppShell from "@/components/aegis/AppShell";
import AuthGuard from "@/components/aegis/AuthGuard";
import NavigationPage from "@/components/aegis/NavigationPage";
import { getReviews, reviewStatusLabel, type Review } from "@/lib/api";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    getReviews(1, 50)
      .then((r) => setReviews(r.items))
      .catch(() => setReviews([]));
  }, []);

  const items = reviews.map((review) => ({
    href: `/reviews/${review.id}`,
    title: `${review.kind ?? "Review"} — ${review.title}`,
    description: `Review for ${review.version ?? "latest version"}.`,
    meta: `${reviewStatusLabel(review.status)}${review.dueDate ? ` — due ${new Date(review.dueDate).toLocaleDateString()}` : ""}`,
    icon: review.status === "Completed" ? CheckCircle2 : Clock3,
  }));

  return (
    <AuthGuard>
      <NavigationPage
        eyebrow="Review queue"
        title="My reviews"
        description="Open, continue, and revisit the review rounds assigned to you."
        searchPlaceholder="Search reviews..."
        items={items}
      />
    </AuthGuard>
  );
}
