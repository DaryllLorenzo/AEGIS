import type { Tool } from "./types";

type Props = {
  tool: Tool;
  onToolChange: (tool: Tool) => void;
  selectedId: string | null;
  onDeleteSelected: () => void;
  pageNumber: number;
  numPages: number;
  onPageChange: (page: number) => void;
};

const TOOLS: { id: Tool; label: string }[] = [
  { id: "select", label: "Select" },
  { id: "rectangle", label: "Rectangle" },
  { id: "circle", label: "Circle" },
  { id: "ellipse", label: "Oval" },
  { id: "highlight", label: "Highlight" },
];

export default function Toolbar({
  tool,
  onToolChange,
  selectedId,
  onDeleteSelected,
  pageNumber,
  numPages,
  onPageChange,
}: Props) {
  return (
    <div className="annotator-toolbar">
      {TOOLS.map((t) => (
        <button
          key={t.id}
          className={`btn btn-tool${tool === t.id ? " btn-tool--active" : ""}`}
          onClick={() => onToolChange(t.id)}
        >
          {t.label}
        </button>
      ))}

      {selectedId && (
        <button className="btn btn-danger" onClick={onDeleteSelected}>
          Delete selected
        </button>
      )}

      <div className="annotator-toolbar-spacer" />

      <button
        className="btn btn-sm"
        disabled={pageNumber <= 1}
        onClick={() => onPageChange(pageNumber - 1)}
      >
        &larr;
      </button>
      <span className="annotator-page-info">
        Page {pageNumber} / {numPages}
      </span>
      <button
        className="btn btn-sm"
        disabled={pageNumber >= numPages}
        onClick={() => onPageChange(pageNumber + 1)}
      >
        &rarr;
      </button>
    </div>
  );
}
