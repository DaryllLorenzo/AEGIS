import { FilePenLine, Files, Plus } from "lucide-react";
import Link from "next/link";

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

export default async function SubmissionsPage() {
  const reviews = await fetchReviews();

  const items = reviews.map((review) => ({
    href: `/reviews/${review.id}`,
    title: review.title,
    description: review.kind ?? "Document review",
    meta: `${review.status}${review.version ? ` · Version ${review.version}` : ""}`,
    icon: review.status === "Completed" ? FilePenLine : Files,
  }));

  return (
    <NavigationPage
      eyebrow="Research objects"
      title="My submissions"
      description="Track the documents and versions you have submitted to your research groups."
      searchPlaceholder="Search submissions..."
      items={items}
      action={
        <Link className="button button--primary" href="/submissions/new">
          <Plus size={16} /> New submission
        </Link>
      }
    />
  );
}
