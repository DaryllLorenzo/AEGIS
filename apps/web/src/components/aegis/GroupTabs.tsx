import Link from "next/link";

type GroupTabsProps = {
  groupId: string;
  active: "overview" | "documents" | "reviews";
};

const tabIds = ["overview", "documents", "reviews"] as const;

const tabLabels: Record<GroupTabsProps["active"], string> = {
  overview: "Overview",
  documents: "Documents",
  reviews: "Reviews",
};

export default function GroupTabs({ groupId, active }: GroupTabsProps) {
  return (
    <nav className="group-tabs" aria-label="Group sections">
      {tabIds.map((id) => {
        const href = id === "overview" ? `/groups/${groupId}` : `/groups/${groupId}/${id}`;
        return (
          <Link key={id} href={href} className={id === active ? "is-active" : ""}>
            {tabLabels[id]}
          </Link>
        );
      })}
    </nav>
  );
}
