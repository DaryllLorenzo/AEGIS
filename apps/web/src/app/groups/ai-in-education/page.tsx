import Link from "next/link";
import { ArrowRight, FileCheck2, FileUp, MessageSquareText, Plus, UserRoundPlus } from "lucide-react";

import AppShell from "@/components/aegis/AppShell";
import Avatar from "@/components/aegis/Avatar";
import GroupTabs from "@/components/aegis/GroupTabs";
import { members } from "@/lib/mock-data";

const activity = [
  { title: "Review #3 completed", detail: "María submitted feedback on Algorithmic Fairness v2.1.", time: "10:45 AM", icon: FileCheck2, tone: "green" },
  { title: "New version uploaded", detail: "Ana uploaded v2.1 of the primary manuscript.", time: "Yesterday", icon: FileUp, tone: "gray" },
  { title: "New member", detail: "Dr. Smith joined the group as an observer.", time: "Oct 12", icon: UserRoundPlus, tone: "blue" },
];

export default function GroupOverviewPage() {
  return (
    <AppShell searchPlaceholder="Search this group...">
      <div className="page-container group-page">
        <div className="breadcrumb"><Link href="/groups">Groups</Link><span>/</span><span>AI in Education</span></div>
        <div className="page-heading">
          <p className="eyebrow">Research group</p>
          <h1 className="serif-title">AI in Education</h1>
        </div>
        <GroupTabs active="overview" />

        <div className="group-layout">
          <div className="group-layout__main">
            <section className="content-panel research-topic">
              <div className="section-heading section-heading--compact">
                <div><p className="eyebrow">Current focus</p><h2>Research topic</h2></div>
                <Link className="text-link" href="/groups/ai-in-education/documents">Documents <ArrowRight size={16} /></Link>
              </div>
              <p>Investigating the efficacy and ethical implications of adaptive learning systems within higher education environments. The group focuses on quantitative analysis of student outcomes and qualitative assessment of algorithmic bias.</p>
              <div className="tag-row"><span>Adaptive learning</span><span>Higher education</span><span>Algorithmic bias</span></div>
            </section>

            <section className="content-panel activity-panel">
              <div className="section-heading section-heading--compact">
                <div><p className="eyebrow">Latest updates</p><h2>Activity</h2></div>
                <Link className="text-link" href="/groups/ai-in-education/activity">View all <ArrowRight size={16} /></Link>
              </div>
              <div className="activity-list">
                {activity.map(({ title, detail, time, icon: Icon, tone }) => (
                  <article className="activity-row" key={title}>
                    <div className={`activity-row__icon activity-row__icon--${tone}`}><Icon size={17} /></div>
                    <div><strong>{title}</strong><p>{detail}</p></div>
                    <time>{time}</time>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="group-layout__aside" id="members">
            <section className="content-panel members-panel">
              <div className="panel-title"><h2>Members</h2><button className="icon-button outlined" type="button" aria-label="Add member"><Plus size={18} /></button></div>
              <div className="member-list">
                {members.map((member) => (
                  <div className="member-row" key={member.name}>
                    <span className="avatar-status"><Avatar initials={member.initials} tone={member.tone} /><i /></span>
                    <div><strong>{member.name}</strong><span>{member.role}</span></div>
                  </div>
                ))}
              </div>
              <Link href="/groups/ai-in-education/members" className="text-button">View all members (12)</Link>
            </section>

            <section className="content-panel stats-panel">
              <h2>Group stats</h2>
              <div><span><strong>8</strong>Active docs</span><span><strong>24</strong>Open reviews</span></div>
            </section>

            <Link className="content-panel discussion-preview" href="/groups/ai-in-education/discussion">
              <MessageSquareText size={20} />
              <div><strong>Group discussion</strong><p>8 unread messages from your collaborators.</p></div>
            </Link>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
