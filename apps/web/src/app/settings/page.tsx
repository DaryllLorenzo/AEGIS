import AppShell from "@/components/aegis/AppShell";

export default function SettingsPage() {
  return (
    <AppShell searchPlaceholder="Search settings...">
      <div className="page-container">
        <div className="page-heading"><p className="eyebrow">Workspace options</p><h1>Settings</h1><p>Control review behavior, notifications, and accessibility preferences.</p></div>
        <div className="settings-layout">
          <section className="content-panel">
            <p className="eyebrow">Review workspace</p><h2>Document preferences</h2>
            <label className="setting-row"><span><strong>Show resolved annotations</strong><small>Keep completed threads visible.</small></span><input type="checkbox" defaultChecked /></label>
            <label className="setting-row"><span><strong>Open review panel</strong><small>Show annotations when a document opens.</small></span><input type="checkbox" defaultChecked /></label>
            <label className="setting-row"><span><strong>Compact page thumbnails</strong><small>Fit more pages in the left panel.</small></span><input type="checkbox" /></label>
          </section>
          <section className="content-panel">
            <p className="eyebrow">Communication</p><h2>Notification preferences</h2>
            <label className="setting-row"><span><strong>Review assignments</strong><small>Notify me when a review is assigned.</small></span><input type="checkbox" defaultChecked /></label>
            <label className="setting-row"><span><strong>Annotation replies</strong><small>Notify me about replies to my notes.</small></span><input type="checkbox" defaultChecked /></label>
            <label className="setting-row"><span><strong>Weekly digest</strong><small>Receive a weekly research summary.</small></span><input type="checkbox" /></label>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
