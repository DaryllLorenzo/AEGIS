"use client";

import { Users } from "lucide-react";

import NavigationPage from "@/components/aegis/NavigationPage";
import { useGroups } from "@/hooks/useGroups";

const groupIcons = [Users];

export default function GroupsPage() {
  const { data } = useGroups(1, 50);
  const groups = data?.items ?? [];

  const items = groups.map((group, i) => ({
    href: `/groups/${group.id}`,
    title: group.name,
    description: group.description ?? "Research group",
    meta: `Created ${new Date(group.createdAt).toLocaleDateString()}`,
    icon: groupIcons[i % groupIcons.length],
  }));

  return (
    <NavigationPage
      eyebrow="Research collectives"
      title="My groups"
      description="Move between your active research groups and their documents, reviews, and discussions."
      items={items}
    />
  );
}
