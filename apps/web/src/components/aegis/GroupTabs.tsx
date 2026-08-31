import Link from "next/link";

type GroupTabsProps = {
  active: "overview" | "documents" | "reviews" | "discussion" | "members";
};

const tabs = [
  { id: "overview", label: "Overview", href: "/groups/ai-in-education" },
  { id: "documents", label: "Documents", href: "/groups/ai-in-education/documents" },
  { id: "reviews", label: "Reviews", href: "/groups/ai-in-education/reviews" },
  { id: "discussion", label: "Discussion", href: "/groups/ai-in-education/discussion" },
  { id: "members", label: "Members", href: "/groups/ai-in-education/members" },
] as const;

export default function GroupTabs({ active }: GroupTabsProps) {
  return (
    <nav className="group-tabs" aria-label="Group sections">
      {tabs.map((tab) => (
        <Link key={tab.id} href={tab.href} className={tab.id === active ? "is-active" : ""}>
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
