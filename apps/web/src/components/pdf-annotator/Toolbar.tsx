import {
  ChevronLeft,
  ChevronRight,
  Circle,
  Highlighter,
  MousePointer2,
  Square,
  Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "cn";

import type { Tool } from "./types";

type Props = {
  tool: Tool;
  onToolChange: (tool: Tool) => void;
  selectedId: string | null;
  onDeleteSelected: () => void;
  pageNumber: number;
  numPages: number;
  onPageChange: (page: number) => void;
  /** When set, all annotation-editing controls are disabled. */
  disabled?: boolean;
};

const TOOLS: { id: Tool; label: string; icon: React.ReactNode }[] = [
  { id: "select", label: "Select", icon: <MousePointer2 className="size-4" /> },
  { id: "rectangle", label: "Rectangle", icon: <Square className="size-4" /> },
  { id: "circle", label: "Circle", icon: <Circle className="size-4" /> },
  { id: "ellipse", label: "Oval", icon: <Circle className="size-4 scale-x-[1.6]" /> },
  { id: "highlight", label: "Highlight", icon: <Highlighter className="size-4" /> },
];

export default function Toolbar({
  tool,
  onToolChange,
  selectedId,
  onDeleteSelected,
  pageNumber,
  numPages,
  onPageChange,
  disabled,
}: Props) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-1.5 rounded-xl border bg-card p-1.5 shadow-sm">
      {TOOLS.map((t) => (
        <button
          key={t.id}
          type="button"
          disabled={disabled}
          aria-pressed={tool === t.id}
          onClick={() => onToolChange(t.id)}
          className={cn(
            "inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            tool === t.id
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {t.icon}
          {t.label}
        </button>
      ))}

      {selectedId && (
        <Button variant="destructive" size="sm" disabled={disabled} onClick={onDeleteSelected}>
          <Trash2 className="size-4" />
          Delete selected
        </Button>
      )}

      <div className="flex-1" />

      <Button
        variant="outline"
        size="icon"
        className="size-8"
        disabled={pageNumber <= 1}
        onClick={() => onPageChange(pageNumber - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </Button>
      <span className="px-1 text-xs font-semibold text-muted-foreground">
        Page {pageNumber} / {numPages}
      </span>
      <Button
        variant="outline"
        size="icon"
        className="size-8"
        disabled={pageNumber >= numPages}
        onClick={() => onPageChange(pageNumber + 1)}
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
