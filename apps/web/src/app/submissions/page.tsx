import { FilePenLine, Files } from "lucide-react";

import NavigationPage from "@/components/aegis/NavigationPage";

export default function SubmissionsPage() {
  return (
    <NavigationPage
      eyebrow="Research objects"
      title="My submissions"
      description="Track the documents and versions you have submitted to your research groups."
      searchPlaceholder="Search submissions..."
      items={[
        { href: "/groups/ai-in-education/documents", title: "Adaptive Learning Thesis", description: "The latest version is currently under review by three collaborators.", meta: "Version 1.4 - under review", icon: Files },
        { href: "/groups/ai-in-education/documents/research-paper", title: "Research Paper", description: "A scientific article in drafting with two previous review rounds.", meta: "Version 2.1 - draft", icon: FilePenLine },
      ]}
    />
  );
}
