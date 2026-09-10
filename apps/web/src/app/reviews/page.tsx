import { CheckCircle2, Clock3 } from "lucide-react";

import NavigationPage from "@/components/aegis/NavigationPage";
import { getReviews, type Review } from "@/lib/api";

async function fetchReviews(): Promise<Review[]> {
  try {
    const result = await getReviews(1, 50);
    return result.items;
  } catch {
    return [];
  }
}

export default async function ReviewsPage() {
  const reviews = await fetchReviews();

  const items = reviews.map((review) => ({
    href: `/reviews/${review.id}`,
    title: `${review.kind ?? "Review"} — ${review.title}`,
    description: `Review for ${review.version ?? "latest version"}.`,
    meta: `${review.status}${review.dueDate ? ` — due ${new Date(review.dueDate).toLocaleDateString()}` : ""}`,
    icon: review.status === "Completed" ? CheckCircle2 : Clock3,
  }));

  return (
    <NavigationPage
      eyebrow="Review queue"
      title="My reviews"
      description="Open, continue, and revisit the review rounds assigned to you."
      searchPlaceholder="Search reviews..."
      items={items}
    />
  );
}
