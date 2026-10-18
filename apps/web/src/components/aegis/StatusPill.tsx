import type { ReviewStatus } from "@aegis/domain";

import { Badge } from "@/components/ui/badge";
import { cn } from "cn";

type StatusPillProps = {
  status: ReviewStatus | "Under review" | "Draft" | string;
};

const TONES: Record<string, string> = {
  open: "border-info/30 bg-info/10 text-info",
  submitted: "border-info/30 bg-info/10 text-info",
  "under-review": "border-info/30 bg-info/10 text-info",
  "in-progress": "border-warning/40 bg-warning/15 text-warning",
  completed: "border-success/30 bg-success/10 text-success",
  approved: "border-success/30 bg-success/10 text-success",
  draft: "border-border bg-muted text-muted-foreground",
};

export default function StatusPill({ status }: StatusPillProps) {
  const tone = status.toLowerCase().replaceAll(" ", "-");
  return (
    <Badge
      variant="outline"
      className={cn("font-bold tracking-wide uppercase", TONES[tone] ?? TONES.draft)}
    >
      {status}
    </Badge>
  );
}
