import type { ReviewStatus } from "@/lib/mock-data";

type StatusPillProps = {
  status: ReviewStatus | "Under review" | "Draft";
};

export default function StatusPill({ status }: StatusPillProps) {
  const tone = status.toLowerCase().replaceAll(" ", "-");
  return <span className={`status-pill status-pill--${tone}`}>{status}</span>;
}
