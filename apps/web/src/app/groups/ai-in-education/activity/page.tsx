import { FileCheck2, FileUp, UserRoundPlus } from "lucide-react";
import Link from "next/link";

import AppShell from "@/components/aegis/AppShell";

const activity = [
  { title: "Review #3 completed", detail: "Maria submitted feedback on Algorithmic Fairness v2.1.", time: "10:45 AM", icon: FileCheck2 },
  { title: "New version uploaded", detail: "Ana uploaded version 2.1 of the primary manuscript.", time: "Yesterday", icon: FileUp },
  { title: "New member", detail: "Dr. Smith joined the group as an observer.", time: "Oct 12", icon: UserRoundPlus },
];

export default function GroupActivityPage() {
  return (
    <AppShell searchPlaceholder="Search activity...">
      <div className="page-container">
        <div className="breadcrumb"><Link href="/groups">Groups</Link><span>/</span><Link href="/groups/ai-in-education">AI in Education</Link><span>/</span><span>Activity</span></div>
        <div className="page-heading"><p className="eyebrow">AI in Education</p><h1>Activity</h1><p>A chronological record of group changes and review milestones.</p></div>
        <section className="content-panel activity-panel" style={{ marginTop: 26 }}>{activity.map(({ title, detail, time, icon: Icon }) => <article className="activity-row" key={title}><span className="navigation-card__icon"><Icon size={18} /></span><div><strong>{title}</strong><p>{detail}</p></div><time>{time}</time></article>)}</section>
      </div>
    </AppShell>
  );
}
