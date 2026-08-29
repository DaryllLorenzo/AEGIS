import type { Annotation } from "./types";

type Props = {
  annotations: Annotation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function Sidebar({
  annotations,
  selectedId,
  onSelect,
  onDelete,
}: Props) {
  return (
    <aside className="annotator-sidebar">
      <h2>Annotations</h2>
      <p className="muted">
        Click to select, press <kbd>Delete</kbd> to remove.
      </p>

      {annotations.length === 0 && <p className="muted">No annotations yet.</p>}

      {annotations.map((annotation) => {
        const isActive = annotation.id === selectedId;
        return (
          <div
            key={annotation.id}
            className={`annotator-card${isActive ? " annotator-card--selected" : ""}`}
            onClick={() => onSelect(annotation.id)}
          >
            <div className="annotator-card-header">
              <strong>{annotation.type}</strong>
              <button
                className="btn btn-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(annotation.id);
                }}
              >
                &times;
              </button>
            </div>
            <pre className="annotator-card-pre">
              {JSON.stringify(annotation.geometry, null, 2)}
            </pre>
          </div>
        );
      })}

      <button
        className="btn annotator-log-btn"
        onClick={() => {
          console.log("JSON FOR BACKEND:");
          console.log(JSON.stringify(annotations, null, 2));
        }}
      >
        Log JSON to console
      </button>
    </aside>
  );
}
