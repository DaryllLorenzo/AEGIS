import type { ReviewStatus } from "./api/types";

/** Map backend ReviewStatus to display label */
export function reviewStatusLabel(status: ReviewStatus): string {
  switch (status) {
    case "Pending": return "Open";
    case "InProgress": return "In progress";
    case "Completed": return "Completed";
  }
}

/** Map backend ReviewStatus to CSS class suffix */
export function reviewStatusClass(status: ReviewStatus): string {
  switch (status) {
    case "Pending": return "open";
    case "InProgress": return "in-progress";
    case "Completed": return "completed";
  }
}

/** Generate initials from a display name */
export function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}
