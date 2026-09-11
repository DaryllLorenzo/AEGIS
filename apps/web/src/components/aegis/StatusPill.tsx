import type { ReviewStatus } from "@/lib/api";

type StatusPillProps = {
  status: ReviewStatus | "Under review" | "Draft" | string;
};

export default function StatusPill({ status }: StatusPillProps) {
  const tone = status.toLowerCase().replaceAll(" ", "-");
  return <span className={`status-pill status-pill--${tone}`}>{status}</span>;
}
