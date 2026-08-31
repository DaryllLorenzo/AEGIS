import { Bell, CheckCircle2, FileUp, MessageSquareText } from "lucide-react";

import AppShell from "@/components/aegis/AppShell";

const notifications = [
  { title: "Carlos added four annotations", detail: "Adaptive Learning Thesis - Review #4", time: "12 minutes ago", icon: MessageSquareText },
  { title: "Ana uploaded version 1.4", detail: "The new version is ready for your review.", time: "Yesterday", icon: FileUp },
  { title: "Review #3 was completed", detail: "All three reviewers submitted their feedback.", time: "Aug 20", icon: CheckCircle2 },
];

export default function NotificationsPage() {
  return (
    <AppShell searchPlaceholder="Search notifications...">
      <div className="page-container">
        <div className="page-heading"><p className="eyebrow">Updates</p><h1>Notifications</h1><p>Recent activity across your reviews and research groups.</p></div>
        <div className="notification-list">
          {notifications.map(({ title, detail, time, icon: Icon }) => (
            <article className="content-panel panel-heading" key={title}>
              <span className="navigation-card__icon"><Icon size={20} /></span>
              <div><h2>{title}</h2><p>{detail}</p><small>{time}</small></div>
            </article>
          ))}
          <div className="content-panel annotation-empty"><Bell size={22} /><p>You are up to date.</p></div>
        </div>
      </div>
    </AppShell>
  );
}
