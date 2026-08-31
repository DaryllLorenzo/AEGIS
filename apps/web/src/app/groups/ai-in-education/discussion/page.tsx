import Link from "next/link";

import AppShell from "@/components/aegis/AppShell";
import Avatar from "@/components/aegis/Avatar";
import GroupTabs from "@/components/aegis/GroupTabs";
import { discussionMessages } from "@/lib/mock-data";

export default function GroupDiscussionPage() {
  return (
    <AppShell searchPlaceholder="Search group discussion...">
      <div className="page-container">
        <div className="breadcrumb"><Link href="/groups">Groups</Link><span>/</span><Link href="/groups/ai-in-education">AI in Education</Link><span>/</span><span>Discussion</span></div>
        <div className="page-heading"><p className="eyebrow">AI in Education</p><h1>Discussion</h1><p>General project conversation, separate from document annotations.</p></div>
        <GroupTabs active="discussion" />
        <section className="content-panel discussion-thread">
          {discussionMessages.map((item) => <article className="activity-row" key={item.author}><Avatar initials={item.initials} tone={item.initials === "AM" ? "sage" : "blue"} /><div><strong>{item.author}</strong><p>{item.body}</p></div><time>{item.time}</time></article>)}
          <form className="message-composer"><textarea aria-label="Group discussion message" placeholder="Write a message..." /><button className="button button--primary" type="submit">Send</button></form>
        </section>
      </div>
    </AppShell>
  );
}
