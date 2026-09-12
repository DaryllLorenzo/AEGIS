"use client";

import { FilePenLine, Files, Plus } from "lucide-react";
import Link from "next/link";

import NavigationPage from "@/components/aegis/NavigationPage";
import { useReviews } from "@/hooks/useReviews";
import { reviewStatusLabel } from "@/lib/utils";

export default function SubmissionsPage() {
  const { data } = useReviews(1, 50);
  const reviews = data?.items ?? [];

  const items = reviews.map((review) => ({
    href: `/reviews/${review.id}`,
    title: review.title,
    description: review.kind ?? "Document review",
    meta: `${reviewStatusLabel(review.status)}${review.version ? ` · Version ${review.version}` : ""}`,
    icon: review.status === "Completed" ? FilePenLine : Files,
  }));

  return (
    <NavigationPage
      eyebrow="Research objects"
      title="My submissions"
      description="Track the documents and versions you have submitted to your research groups."
      items={items}
      action={
        <Link className="button button--primary" href="/reviews/new">
          <Plus size={16} /> New submission
        </Link>
      }
    />
  );
}
