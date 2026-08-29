"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Stage, Layer, Rect, Circle } from "react-konva";

import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Tool = "select" | "rectangle" | "circle" | "highlight";

type RectangleGeometry = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type CircleGeometry = {
  cx: number;
  cy: number;
  radius: number;
};

type Annotation = {
  id: string;
  page: number;
  type: Tool;
  geometry: RectangleGeometry | CircleGeometry;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PdfAnnotator() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [tool, setTool] = useState<Tool>("rectangle");
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const startPoint = useRef<{ x: number; y: number } | null>(null);
  const [pageSize, setPageSize] = useState({ width: 800, height: 1100 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // -- File handling --------------------------------------------------------

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selected = event.target.files?.[0];
      if (!selected) return;
      if (selected.type !== "application/pdf") {
        alert("Please select a PDF file.");
        return;
      }
      setFile(selected);
      setPageNumber(1);
      setAnnotations([]);
    },
    [],
  );

  // -- PDF callbacks --------------------------------------------------------

  const handleDocumentLoadSuccess = useCallback(
    ({ numPages: count }: { numPages: number }) => {
      setNumPages(count);
    },
    [],
  );

  const handlePageLoadSuccess = useCallback((page: any) => {
    const viewport = page.getViewport({ scale: 1 });
    setPageSize({ width: viewport.width, height: viewport.height });
  }, []);

  // -- Coordinate helpers ---------------------------------------------------

  const normalizeX = useCallback(
    (x: number) => x / pageSize.width,
    [pageSize.width],
  );

  const normalizeY = useCallback(
    (y: number) => y / pageSize.height,
    [pageSize.height],
  );

  // -- Drawing handlers -----------------------------------------------------

  const handleMouseDown = useCallback(
    (event: any) => {
      if (tool === "select") return;
      const stage = event.target.getStage();
      const pointer = stage.getPointerPosition();
      if (!pointer) return;
      startPoint.current = { x: pointer.x, y: pointer.y };
      setIsDrawing(true);
    },
    [tool],
  );

  const handleMouseUp = useCallback(
    (event: any) => {
      if (!isDrawing || !startPoint.current) return;

      const stage = event.target.getStage();
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const start = startPoint.current;
      const end = { x: pointer.x, y: pointer.y };

      const minX = Math.min(start.x, end.x);
      const minY = Math.min(start.y, end.y);
      const width = Math.abs(end.x - start.x);
      const height = Math.abs(end.y - start.y);

      if (width < 5 && height < 5) {
        setIsDrawing(false);
        startPoint.current = null;
        return;
      }

      let geometry: RectangleGeometry | CircleGeometry;

      if (tool === "rectangle" || tool === "highlight") {
        geometry = {
          x: normalizeX(minX),
          y: normalizeY(minY),
          width: normalizeX(width),
          height: normalizeY(height),
        };
      } else {
        const centerX = minX + width / 2;
        const centerY = minY + height / 2;
        const radius = Math.max(width, height) / 2;
        geometry = {
          cx: normalizeX(centerX),
          cy: normalizeY(centerY),
          radius: normalizeX(radius),
        };
      }

      const annotation: Annotation = {
        id: crypto.randomUUID(),
        page: pageNumber,
        type: tool,
        geometry,
      };

      setAnnotations((prev) => {
        const next = [...prev, annotation];
        console.log("New annotation:", annotation);
        console.log("All annotations:", next);
        return next;
      });

      setIsDrawing(false);
      startPoint.current = null;
    },
    [isDrawing, tool, pageNumber, normalizeX, normalizeY],
  );

  // -- Delete ----------------------------------------------------------------

  const deleteAnnotation = useCallback((id: string) => {
    setAnnotations((prev) => {
      const next = prev.filter((a) => a.id !== id);
      console.log("Annotations after delete:", next);
      return next;
    });
  }, []);

  // -- Log on every change ---------------------------------------------------

  useEffect(() => {
    console.log("=== GEOMETRIES ===");
    console.log(JSON.stringify(annotations, null, 2));
  }, [annotations]);

  // -- Render ----------------------------------------------------------------

  const scaledHeight =
    pageSize.height * (800 / pageSize.width);

  return (
    <main className="annotator">
      {/* Header */}
      <div className="annotator-header">
        <h1>PDF Annotation POC</h1>
        <button
          className="btn"
          onClick={() => fileInputRef.current?.click()}
        >
          Load PDF
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          hidden
        />
      </div>

      {/* Toolbar */}
      {file && (
        <div className="annotator-toolbar">
          <ToolButton
            active={tool === "select"}
            onClick={() => setTool("select")}
          >
            Select
          </ToolButton>
          <ToolButton
            active={tool === "rectangle"}
            onClick={() => setTool("rectangle")}
          >
            Rectangle
          </ToolButton>
          <ToolButton
            active={tool === "circle"}
            onClick={() => setTool("circle")}
          >
            Circle
          </ToolButton>
          <ToolButton
            active={tool === "highlight"}
            onClick={() => setTool("highlight")}
          >
            Highlight
          </ToolButton>

          <div className="annotator-toolbar-spacer" />

          <button
            className="btn btn-sm"
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber((p) => p - 1)}
          >
            &larr;
          </button>
          <span className="annotator-page-info">
            Page {pageNumber} / {numPages}
          </span>
          <button
            className="btn btn-sm"
            disabled={pageNumber >= numPages}
            onClick={() => setPageNumber((p) => p + 1)}
          >
            &rarr;
          </button>
        </div>
      )}

      {/* Empty state */}
      {!file && (
        <div className="annotator-empty">
          <h2>Load a PDF</h2>
          <p>Then draw annotations on top of it.</p>
        </div>
      )}

      {/* PDF + annotations */}
      {file && (
        <div className="annotator-body">
          <div className="annotator-canvas-wrapper">
            <Document
              file={file}
              onLoadSuccess={handleDocumentLoadSuccess}
              loading={<div className="annotator-status">Loading PDF...</div>}
              error={
                <div className="annotator-status annotator-status--error">
                  Could not load the PDF.
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                width={800}
                onLoadSuccess={handlePageLoadSuccess}
                renderTextLayer
                renderAnnotationLayer
              />
            </Document>

            {/* Konva annotation layer */}
            <div
              className="annotator-overlay"
              style={{ pointerEvents: tool === "select" ? "none" : "auto" }}
            >
              <Stage
                width={800}
                height={scaledHeight}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
              >
                <Layer>
                  {annotations
                    .filter((a) => a.page === pageNumber)
                    .map((annotation) => {
                      if (
                        annotation.type === "rectangle" ||
                        annotation.type === "highlight"
                      ) {
                        const g = annotation.geometry as RectangleGeometry;
                        return (
                          <Rect
                            key={annotation.id}
                            x={g.x * pageSize.width}
                            y={g.y * pageSize.height}
                            width={g.width * pageSize.width}
                            height={g.height * pageSize.height}
                            stroke="red"
                            strokeWidth={2}
                            fill={
                              annotation.type === "highlight"
                                ? "yellow"
                                : undefined
                            }
                            opacity={
                              annotation.type === "highlight" ? 0.35 : 1
                            }
                          />
                        );
                      }

                      if (annotation.type === "circle") {
                        const g = annotation.geometry as CircleGeometry;
                        return (
                          <Circle
                            key={annotation.id}
                            x={g.cx * pageSize.width}
                            y={g.cy * pageSize.height}
                            radius={g.radius * pageSize.width}
                            stroke="red"
                            strokeWidth={2}
                          />
                        );
                      }

                      return null;
                    })}
                </Layer>
              </Stage>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="annotator-sidebar">
            <h2>Annotations</h2>
            <p className="muted">
              Structures you could send to the .NET API.
            </p>

            {annotations.length === 0 && <p className="muted">No annotations yet.</p>}

            {annotations.map((annotation) => (
              <div key={annotation.id} className="annotator-card">
                <div className="annotator-card-header">
                  <strong>{annotation.type}</strong>
                  <button
                    className="btn btn-icon"
                    onClick={() => deleteAnnotation(annotation.id)}
                  >
                    &times;
                  </button>
                </div>
                <pre className="annotator-card-pre">
                  {JSON.stringify(annotation.geometry, null, 2)}
                </pre>
              </div>
            ))}

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
        </div>
      )}
    </main>
  );
}

// ---------------------------------------------------------------------------
// ToolButton
// ---------------------------------------------------------------------------

function ToolButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      className={`btn btn-tool${active ? " btn-tool--active" : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
