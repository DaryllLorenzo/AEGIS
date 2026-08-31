import { AtSign, Building2, UserRound } from "lucide-react";

import AppShell from "@/components/aegis/AppShell";

export default function ProfilePage() {
  return (
    <AppShell searchPlaceholder="Search profile...">
      <div className="page-container">
        <div className="page-heading"><p className="eyebrow">Account</p><h1>Profile</h1><p>Your identity across AEGIS research groups and reviews.</p></div>
        <section className="content-panel" style={{ marginTop: 26, maxWidth: 720 }}>
          <div className="panel-heading"><span className="navigation-card__icon"><UserRound size={22} /></span><div><h2>María González</h2><p>Reviewer and research collaborator</p></div></div>
          <div className="setting-row"><span><strong><AtSign size={15} /> Institutional email</strong><small>maria.gonzalez@university.edu</small></span></div>
          <div className="setting-row"><span><strong><Building2 size={15} /> Institution</strong><small>Faculty of Education Research Center</small></span></div>
          <div className="setting-row"><span><strong>Active groups</strong><small>AI in Education, Computer Vision</small></span></div>
        </section>
      </div>
    </AppShell>
  );
}
