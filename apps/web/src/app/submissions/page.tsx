"use client";

import { FilePenLine, Files, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import AppShell from "@/components/aegis/AppShell";
import AuthGuard from "@/components/aegis/AuthGuard";
import NavigationPage from "@/components/aegis/NavigationPage";
import { getReviews, reviewStatusLabel, type Review } from "@/lib/api";

export default function SubmissionsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    getReviews(1, 50)
      .then((r) => setReviews(r.items))
      .catch(() => setReviews([]));
  }, []);

  const items = reviews.map((review) => ({
    href: `/reviews/${review.id}`,
    title: review.title,
    description: review.kind ?? "Document review",
    meta: `${reviewStatusLabel(review.status)}${review.version ? ` · Version ${review.version}` : ""}`,
    icon: review.status === "Completed" ? FilePenLine : Files,
  }));

  return (
    <AuthGuard>
      <NavigationPage
        eyebrow="Research objects"
        title="My submissions"
        description="Track the documents and versions you have submitted to your research groups."
        searchPlaceholder="Search submissions..."
        items={items}
        action={
          <Link className="button button--primary" href="/reviews/new">
            <Plus size={16} /> New submission
          </Link>
        }
      />
    </AuthGuard>
  );
}
