import Link from "next/link";

import AppShell from "@/components/aegis/AppShell";
import Avatar from "@/components/aegis/Avatar";
import GroupTabs from "@/components/aegis/GroupTabs";
import { members } from "@/lib/mock-data";

export default function GroupMembersPage() {
  return (
    <AppShell searchPlaceholder="Search members...">
      <div className="page-container">
        <div className="breadcrumb"><Link href="/groups">Groups</Link><span>/</span><Link href="/groups/ai-in-education">AI in Education</Link><span>/</span><span>Members</span></div>
        <div className="page-heading"><p className="eyebrow">AI in Education</p><h1>Members</h1><p>Researchers, reviewers, and submitters collaborating in this group.</p></div>
        <GroupTabs active="members" />
        <section className="content-panel member-directory">
          {members.map((member) => <article className="member-row" key={member.name}><span className="avatar-status"><Avatar initials={member.initials} tone={member.tone} /><i /></span><div><strong>{member.name}</strong><span>{member.role}</span></div></article>)}
        </section>
      </div>
    </AppShell>
  );
}
