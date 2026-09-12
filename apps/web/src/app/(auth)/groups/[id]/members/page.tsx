"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import GroupTabs from "@/components/aegis/GroupTabs";

export default function MembersPage() {
  const params = useParams();
  const groupId = params?.id as string;

  return (
    <div className="page-container">
      <div className="breadcrumb"><Link href="/groups">Groups</Link><span>/</span><Link href={`/groups/${groupId}`}>Group</Link><span>/</span><span>Members</span></div>
      <div className="page-heading"><p className="eyebrow">Members</p><h1>Group members</h1><p>Manage who has access to this group.</p></div>
      <GroupTabs groupId={groupId} active="members" />
      <p className="muted" style={{ marginTop: 24 }}>Member management coming soon.</p>
    </div>
  );
}
