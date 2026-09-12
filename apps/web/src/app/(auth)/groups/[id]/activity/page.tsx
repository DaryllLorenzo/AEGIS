"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import GroupTabs from "@/components/aegis/GroupTabs";

export default function ActivityPage() {
  const params = useParams();
  const groupId = params?.id as string;

  return (
    <div className="page-container">
      <div className="breadcrumb"><Link href="/groups">Groups</Link><span>/</span><Link href={`/groups/${groupId}`}>Group</Link><span>/</span><span>Activity</span></div>
      <div className="page-heading"><p className="eyebrow">Activity</p><h1>Group activity</h1><p>Full history of changes in this group.</p></div>
      <GroupTabs groupId={groupId} active="overview" />
      <p className="muted" style={{ marginTop: 24 }}>Activity feed coming soon.</p>
    </div>
  );
}
