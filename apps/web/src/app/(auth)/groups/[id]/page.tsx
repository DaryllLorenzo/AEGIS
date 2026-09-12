"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, FileCheck2, FileUp, MessageSquareText } from "lucide-react";
import GroupTabs from "@/components/aegis/GroupTabs";
import { useGroup } from "@/hooks/useGroup";

const activity = [
  { title: "Review completed", detail: "A review round was marked as completed.", time: "Today", icon: FileCheck2, tone: "green" },
  { title: "New version uploaded", detail: "A new document version was uploaded.", time: "Yesterday", icon: FileUp, tone: "gray" },
];

export default function GroupOverviewPage() {
  const params = useParams();
  const groupId = params?.id as string;

  const { data: group, error } = useGroup(groupId);

  if (error) {
    return (
      <div className="page-container">
        <p>{error}</p>
        <Link href="/groups">Back to groups</Link>
      </div>
    );
  }

  return (
    <div className="page-container group-page">
      <div className="breadcrumb"><Link href="/groups">Groups</Link><span>/</span><span>{group?.name ?? "Loading..."}</span></div>
      <div className="page-heading">
        <p className="eyebrow">Research group</p>
        <h1 className="serif-title">{group?.name ?? "Loading..."}</h1>
      </div>
      <GroupTabs groupId={groupId} active="overview" />

      <div className="group-layout">
        <div className="group-layout__main">
          <section className="content-panel research-topic">
            <div className="section-heading section-heading--compact">
              <div><p className="eyebrow">About</p><h2>Research topic</h2></div>
              <Link className="text-link" href={`/groups/${groupId}/documents`}>Documents <ArrowRight size={16} /></Link>
            </div>
            <p>{group?.description ?? "No description provided."}</p>
          </section>

          <section className="content-panel activity-panel">
            <div className="section-heading section-heading--compact">
              <div><p className="eyebrow">Latest updates</p><h2>Activity</h2></div>
              <Link className="text-link" href={`/groups/${groupId}/activity`}>View all <ArrowRight size={16} /></Link>
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
          <section className="content-panel stats-panel">
            <h2>Group stats</h2>
            <div><span><strong>-</strong>Active docs</span><span><strong>-</strong>Open reviews</span></div>
          </section>

          <Link className="content-panel discussion-preview" href={`/groups/${groupId}/discussion`}>
            <MessageSquareText size={20} />
            <div><strong>Group discussion</strong><p>View messages from your collaborators.</p></div>
          </Link>
        </aside>
      </div>
    </div>
  );
}
