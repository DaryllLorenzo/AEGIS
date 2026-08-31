import { CheckCircle2, Clock3 } from "lucide-react";

import NavigationPage from "@/components/aegis/NavigationPage";

export default function ReviewsPage() {
  return (
    <NavigationPage
      eyebrow="Review queue"
      title="My reviews"
      description="Open, continue, and revisit the review rounds assigned to you."
      searchPlaceholder="Search reviews..."
      items={[
        { href: "/reviews/adaptive-learning", title: "Adaptive Learning Thesis", description: "Review #4 for version 1.4, focused on methodology and statistical analysis.", meta: "Open - due Sep 3", icon: Clock3 },
        { href: "/reviews/image-segmentation", title: "Image Segmentation Research Paper", description: "Review #1 for the Computer Vision group with twelve active annotations.", meta: "In progress - due today", icon: CheckCircle2 },
      ]}
    />
  );
}
