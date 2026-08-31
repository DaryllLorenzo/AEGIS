import { BrainCircuit, ScanSearch } from "lucide-react";

import NavigationPage from "@/components/aegis/NavigationPage";

export default function GroupsPage() {
  return (
    <NavigationPage
      eyebrow="Research collectives"
      title="My groups"
      description="Move between your active research groups and their documents, reviews, and discussions."
      searchPlaceholder="Search groups..."
      items={[
        { href: "/groups/ai-in-education", title: "AI in Education", description: "Adaptive learning, higher education, and algorithmic bias research.", meta: "12 members - 8 active documents", icon: BrainCircuit },
        { href: "/groups/computer-vision", title: "Computer Vision", description: "Applied image segmentation and interpretable visual learning systems.", meta: "8 members - 5 active documents", icon: ScanSearch },
      ]}
    />
  );
}
