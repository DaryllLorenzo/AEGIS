"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import AppShell from "@/components/aegis/AppShell";
import AuthGuard from "@/components/aegis/AuthGuard";
import GroupTabs from "@/components/aegis/GroupTabs";

export default function DiscussionPage() {
  const params = useParams();
  const groupId = params?.id as string;

  return (
    <AuthGuard>
      <AppShell searchPlaceholder="Search discussion...">
        <div className="page-container">
          <div className="breadcrumb"><Link href="/groups">Groups</Link><span>/</span><Link href={`/groups/${groupId}`}>Group</Link><span>/</span><span>Discussion</span></div>
          <div className="page-heading"><p className="eyebrow">Discussion</p><h1>Group discussion</h1><p>Chat and collaborate with your group members.</p></div>
          <GroupTabs groupId={groupId} active="discussion" />
          <p className="muted" style={{ marginTop: 24 }}>Group discussion coming soon.</p>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
