"use client";

import { Users } from "lucide-react";
import { useEffect, useState } from "react";

import AppShell from "@/components/aegis/AppShell";
import AuthGuard from "@/components/aegis/AuthGuard";
import NavigationPage from "@/components/aegis/NavigationPage";
import { getGroups, type GroupDto } from "@/lib/api";

const groupIcons = [Users];

export default function GroupsPage() {
  const [groups, setGroups] = useState<GroupDto[]>([]);

  useEffect(() => {
    getGroups(1, 50)
      .then((r) => setGroups(r.items))
      .catch(() => setGroups([]));
  }, []);

  const items = groups.map((group, i) => ({
    href: `/groups/${group.id}`,
    title: group.name,
    description: group.description ?? "Research group",
    meta: `Created ${new Date(group.createdAt).toLocaleDateString()}`,
    icon: groupIcons[i % groupIcons.length],
  }));

  return (
    <AuthGuard>
      <NavigationPage
        eyebrow="Research collectives"
        title="My groups"
        description="Move between your active research groups and their documents, reviews, and discussions."
        searchPlaceholder="Search groups..."
        items={items}
      />
    </AuthGuard>
  );
}
