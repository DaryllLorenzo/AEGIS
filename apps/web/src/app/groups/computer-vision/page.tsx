import { FileSearch, MessageSquareText } from "lucide-react";

import NavigationPage from "@/components/aegis/NavigationPage";

export default function ComputerVisionPage() {
  return (
    <NavigationPage
      eyebrow="Research group"
      title="Computer Vision"
      description="Research workspace for image segmentation, visual learning, and model interpretability."
      searchPlaceholder="Search this group..."
      items={[
        { href: "/reviews/image-segmentation", title: "Image Segmentation Review", description: "Continue the active review round for the group research paper.", meta: "Review #1 - in progress", icon: FileSearch },
        { href: "/groups", title: "All research groups", description: "Return to the complete directory of your active collaborations.", meta: "2 active groups", icon: MessageSquareText },
      ]}
    />
  );
}
