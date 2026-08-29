"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Stage, Layer, Group, Rect, Circle, Ellipse } from "react-konva";

import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Tool = "select" | "rectangle" | "circle" | "ellipse" | "highlight";

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

type EllipseGeometry = {
  cx: number;
  cy: number;
  radiusX: number;
  radiusY: number;
};

type HighlightGeometry = {
  lines: RectangleGeometry[];
};

type Annotation = {
  id: string;
  page: number;
  type: Tool;
  geometry: RectangleGeometry | CircleGeometry | EllipseGeometry | HighlightGeometry;
};

// ---------------------------------------------------------------------------
// Text layer helpers — measure spans via getBoundingClientRect()
// ---------------------------------------------------------------------------

type HighlightLine = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function computeHighlightLines(
  pageContainer: HTMLElement,
  topY: number,
  bottomY: number,
  dragStartX: number,
  dragEndX: number,
): { lines: HighlightLine[]; text: string } | null {
  const textLayer = pageContainer.querySelector(
    ".react-pdf__Page__textContent, .textLayer",
  );
  if (!textLayer) return null;

  const spans = Array.from(textLayer.querySelectorAll("span"));
  if (spans.length === 0) return null;

  const containerRect = pageContainer.getBoundingClientRect();
  const matchedSpans: {
    left: number;
    top: number;
    right: number;
    bottom: number;
    text: string;
  }[] = [];

  for (const span of spans) {
    const spanRect = span.getBoundingClientRect();
    if (spanRect.width === 0 || spanRect.height === 0) continue;

    const spanTop = spanRect.top - containerRect.top;
    const spanBottom = spanRect.bottom - containerRect.top;
    const spanLeft = spanRect.left - containerRect.left;
    const spanRight = spanRect.right - containerRect.left;

    if (spanBottom >= topY && spanTop <= bottomY) {
      matchedSpans.push({
        left: spanLeft,
        top: spanTop,
        right: spanRight,
        bottom: spanBottom,
        text: span.textContent?.trim() || "",
      });
    }
  }

  if (matchedSpans.length === 0) return null;

  // Group spans into rows by vertical position (±4 px tolerance)
  matchedSpans.sort((a, b) => a.top - b.top);

  const rows: (typeof matchedSpans)[] = [];
  for (const span of matchedSpans) {
    const existing = rows.find((r) => Math.abs(r[0].top - span.top) < 4);
    if (existing) {
      existing.push(span);
    } else {
      rows.push([span]);
    }
  }

  const lines: HighlightLine[] = [];
  const texts: string[] = [];
  const minDragX = Math.min(dragStartX, dragEndX);
  const maxDragX = Math.max(dragStartX, dragEndX);

  rows.forEach((rowSpans, index) => {
    const isFirstRow = index === 0;
    const isLastRow = index === rows.length - 1;

    const rowMinX = Math.min(...rowSpans.map((s) => s.left));
    const rowMaxX = Math.max(...rowSpans.map((s) => s.right));
    const rowMinY = Math.min(...rowSpans.map((s) => s.top));
    const rowMaxY = Math.max(...rowSpans.map((s) => s.bottom));

    let lineLeft = rowMinX;
    let lineRight = rowMaxX;

    if (rows.length === 1) {
      // Single line — respect exact horizontal drag
      lineLeft = Math.max(rowMinX, minDragX);
      lineRight = Math.min(rowMaxX, maxDragX);
    } else if (isFirstRow) {
      // First row of multi-line — from drag start to end of line
      lineLeft = Math.max(rowMinX, minDragX);
    } else if (isLastRow) {
      // Last row of multi-line — from start of line to drag end
      lineRight = Math.min(rowMaxX, maxDragX);
    }
    // Intermediate rows: full line width (already set)

    lines.push({
      x: lineLeft,
      y: rowMinY,
      width: Math.max(lineRight - lineLeft, 4),
      height: rowMaxY - rowMinY,
    });

    texts.push(...rowSpans.map((s) => s.text));
  });

  return { lines, text: texts.join(" ") };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PdfAnnotator() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [tool, setTool] = useState<Tool>("rectangle");
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const startPoint = useRef<{ x: number; y: number } | null>(null);
  const [currentPointer, setCurrentPointer] = useState<{ x: number; y: number } | null>(null);

  const [pageSize, setPageSize] = useState({ width: 800, height: 1100 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pageContainerRef = useRef<HTMLDivElement>(null);

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
      setSelectedId(null);
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

  // -- Delete ----------------------------------------------------------------

  const deleteAnnotation = useCallback((id: string) => {
    setAnnotations((prev) => {
      const next = prev.filter((a) => a.id !== id);
      console.log("Annotations after delete:", next);
      return next;
    });
    setSelectedId(null);
  }, []);

  const deleteSelected = useCallback(() => {
    if (selectedId) deleteAnnotation(selectedId);
  }, [selectedId, deleteAnnotation]);

  // -- Keyboard shortcuts ---------------------------------------------------

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedId) {
          e.preventDefault();
          deleteSelected();
        }
      }
      if (e.key === "Escape") {
        setSelectedId(null);
        setTool("select");
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, deleteSelected]);

  // -- Stage handlers -------------------------------------------------------

  const handleMouseDown = useCallback(
    (event: any) => {
      const stage = event.target.getStage();
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      if (tool === "select") {
        const clickedOnEmpty = event.target === stage;
        if (clickedOnEmpty) setSelectedId(null);
        return;
      }

      startPoint.current = { x: pointer.x, y: pointer.y };
      setCurrentPointer(pointer);
      setIsDrawing(true);
    },
    [tool],
  );

  const handleMouseMove = useCallback(
    (event: any) => {
      if (!isDrawing) return;
      const stage = event.target.getStage();
      const pointer = stage.getPointerPosition();
      if (!pointer) return;
      setCurrentPointer(pointer);
    },
    [isDrawing],
  );

  const handleMouseUp = useCallback(
    (event: any) => {
      if (!isDrawing || !startPoint.current) return;

      const stage = event.target.getStage();
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const start = startPoint.current;
      const end = pointer;

      const minX = Math.min(start.x, end.x);
      const minY = Math.min(start.y, end.y);
      const width = Math.abs(end.x - start.x);
      const height = Math.abs(end.y - start.y);

      if (width < 5 && height < 5) {
        setIsDrawing(false);
        startPoint.current = null;
        setCurrentPointer(null);
        return;
      }

      // -- Highlight: multi-line text detection ------------------------------

      if (tool === "highlight" && pageContainerRef.current) {
        const result = computeHighlightLines(
          pageContainerRef.current,
          minY,
          minY + height,
          start.x,
          end.x,
        );

        let geometry: HighlightGeometry;

        if (result && result.lines.length > 0) {
          geometry = {
            lines: result.lines.map((l) => ({
              x: normalizeX(l.x),
              y: normalizeY(l.y),
              width: normalizeX(l.width),
              height: normalizeY(l.height),
            })),
          };
        } else {
          geometry = {
            lines: [
              {
                x: normalizeX(minX),
                y: normalizeY(minY),
                width: normalizeX(width),
                height: normalizeY(height),
              },
            ],
          };
        }

        const annotation: Annotation = {
          id: crypto.randomUUID(),
          page: pageNumber,
          type: "highlight",
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
        setCurrentPointer(null);
        return;
      }

      // -- Rectangle / Circle / Ellipse -------------------------------------

      let geometry: RectangleGeometry | CircleGeometry | EllipseGeometry;

      if (tool === "rectangle") {
        geometry = {
          x: normalizeX(minX),
          y: normalizeY(minY),
          width: normalizeX(width),
          height: normalizeY(height),
        };
      } else if (tool === "circle") {
        const centerX = minX + width / 2;
        const centerY = minY + height / 2;
        const radius = Math.max(width, height) / 2;
        geometry = {
          cx: normalizeX(centerX),
          cy: normalizeY(centerY),
          radius: normalizeX(radius),
        };
      } else {
        const centerX = minX + width / 2;
        const centerY = minY + height / 2;
        geometry = {
          cx: normalizeX(centerX),
          cy: normalizeY(centerY),
          radiusX: normalizeX(width / 2),
          radiusY: normalizeY(height / 2),
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
      setCurrentPointer(null);
    },
    [isDrawing, tool, pageNumber, normalizeX, normalizeY],
  );

  // -- Log on every change ---------------------------------------------------

  useEffect(() => {
    console.log("=== GEOMETRIES ===");
    console.log(JSON.stringify(annotations, null, 2));
  }, [annotations]);

  // -- Derived drawing preview coords ----------------------------------------

  const drawStart = startPoint.current;
  const drawEnd = currentPointer;

  const previewRect =
    isDrawing && drawStart && drawEnd
      ? {
          x: Math.min(drawStart.x, drawEnd.x),
          y: Math.min(drawStart.y, drawEnd.y),
          width: Math.abs(drawEnd.x - drawStart.x),
          height: Math.abs(drawEnd.y - drawStart.y),
        }
      : null;

  const previewCircle =
    isDrawing && drawStart && drawEnd
      ? {
          cx: Math.min(drawStart.x, drawEnd.x) + Math.abs(drawEnd.x - drawStart.x) / 2,
          cy: Math.min(drawStart.y, drawEnd.y) + Math.abs(drawEnd.y - drawStart.y) / 2,
          radius: Math.max(Math.abs(drawEnd.x - drawStart.x), Math.abs(drawEnd.y - drawStart.y)) / 2,
        }
      : null;

  const previewEllipse =
    isDrawing && drawStart && drawEnd
      ? {
          cx: Math.min(drawStart.x, drawEnd.x) + Math.abs(drawEnd.x - drawStart.x) / 2,
          cy: Math.min(drawStart.y, drawEnd.y) + Math.abs(drawEnd.y - drawStart.y) / 2,
          radiusX: Math.abs(drawEnd.x - drawStart.x) / 2,
          radiusY: Math.abs(drawEnd.y - drawStart.y) / 2,
        }
      : null;

  // -- Render ----------------------------------------------------------------

  const scaledHeight = pageSize.height * (800 / pageSize.width);
  const isSelect = tool === "select";

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
            active={isSelect}
            onClick={() => { setTool("select"); setSelectedId(null); }}
          >
            Select
          </ToolButton>
          <ToolButton
            active={tool === "rectangle"}
            onClick={() => { setTool("rectangle"); setSelectedId(null); }}
          >
            Rectangle
          </ToolButton>
          <ToolButton
            active={tool === "circle"}
            onClick={() => { setTool("circle"); setSelectedId(null); }}
          >
            Circle
          </ToolButton>
          <ToolButton
            active={tool === "ellipse"}
            onClick={() => { setTool("ellipse"); setSelectedId(null); }}
          >
            Oval
          </ToolButton>
          <ToolButton
            active={tool === "highlight"}
            onClick={() => { setTool("highlight"); setSelectedId(null); }}
          >
            Highlight
          </ToolButton>

          {selectedId && (
            <button className="btn btn-danger" onClick={deleteSelected}>
              Delete selected
            </button>
          )}

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
          <div
            className="annotator-canvas-wrapper"
            ref={pageContainerRef}
          >
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
              style={{ pointerEvents: "auto" }}
            >
              <Stage
                width={800}
                height={scaledHeight}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              >
                <Layer>
                  {annotations
                    .filter((a) => a.page === pageNumber)
                    .map((annotation) => {
                      const isSelected = annotation.id === selectedId;

                      // -- Highlight (multi-line) ----------------------------
                      if (annotation.type === "highlight") {
                        const g = annotation.geometry as HighlightGeometry;
                        return (
                          <Group
                            key={annotation.id}
                            onClick={() => {
                              if (isSelect) setSelectedId(annotation.id);
                            }}
                            onTap={() => {
                              if (isSelect) setSelectedId(annotation.id);
                            }}
                          >
                            {g.lines.map((line, i) => (
                              <Rect
                                key={i}
                                x={line.x * pageSize.width}
                                y={line.y * pageSize.height}
                                width={line.width * pageSize.width}
                                height={line.height * pageSize.height}
                                fill="rgba(255, 235, 59, 0.4)"
                                stroke={isSelected ? "#2563eb" : undefined}
                                strokeWidth={isSelected ? 1 : 0}
                                listening={false}
                              />
                            ))}
                          </Group>
                        );
                      }

                      // -- Rectangle ----------------------------------------
                      if (annotation.type === "rectangle") {
                        const g = annotation.geometry as RectangleGeometry;
                        return (
                          <Rect
                            key={annotation.id}
                            x={g.x * pageSize.width}
                            y={g.y * pageSize.height}
                            width={g.width * pageSize.width}
                            height={g.height * pageSize.height}
                            stroke={isSelected ? "#2563eb" : "red"}
                            strokeWidth={isSelected ? 3 : 2}
                            draggable={isSelect}
                            onClick={() => {
                              if (isSelect) setSelectedId(annotation.id);
                            }}
                            onTap={() => {
                              if (isSelect) setSelectedId(annotation.id);
                            }}
                          />
                        );
                      }

                      // -- Circle -------------------------------------------
                      if (annotation.type === "circle") {
                        const g = annotation.geometry as CircleGeometry;
                        return (
                          <Circle
                            key={annotation.id}
                            x={g.cx * pageSize.width}
                            y={g.cy * pageSize.height}
                            radius={g.radius * pageSize.width}
                            stroke={isSelected ? "#2563eb" : "red"}
                            strokeWidth={isSelected ? 3 : 2}
                            draggable={isSelect}
                            onClick={() => {
                              if (isSelect) setSelectedId(annotation.id);
                            }}
                            onTap={() => {
                              if (isSelect) setSelectedId(annotation.id);
                            }}
                          />
                        );
                      }

                      // -- Ellipse ------------------------------------------
                      if (annotation.type === "ellipse") {
                        const g = annotation.geometry as EllipseGeometry;
                        return (
                          <Ellipse
                            key={annotation.id}
                            x={g.cx * pageSize.width}
                            y={g.cy * pageSize.height}
                            radiusX={g.radiusX * pageSize.width}
                            radiusY={g.radiusY * pageSize.height}
                            stroke={isSelected ? "#2563eb" : "red"}
                            strokeWidth={isSelected ? 3 : 2}
                            draggable={isSelect}
                            onClick={() => {
                              if (isSelect) setSelectedId(annotation.id);
                            }}
                            onTap={() => {
                              if (isSelect) setSelectedId(annotation.id);
                            }}
                          />
                        );
                      }

                      return null;
                    })}

                  {/* Live preview — rectangle */}
                  {isDrawing && previewRect && tool === "rectangle" && (
                    <Rect
                      x={previewRect.x}
                      y={previewRect.y}
                      width={previewRect.width}
                      height={previewRect.height}
                      stroke="red"
                      strokeWidth={2}
                      dash={[6, 3]}
                      listening={false}
                    />
                  )}

                  {/* Live preview — highlight */}
                  {isDrawing && previewRect && tool === "highlight" && (
                    <Rect
                      x={previewRect.x}
                      y={previewRect.y}
                      width={previewRect.width}
                      height={previewRect.height}
                      fill="rgba(255, 235, 59, 0.4)"
                      stroke="#2563eb"
                      strokeWidth={1}
                      dash={[6, 3]}
                      listening={false}
                    />
                  )}

                  {/* Live preview — circle */}
                  {isDrawing && previewCircle && tool === "circle" && (
                    <Circle
                      x={previewCircle.cx}
                      y={previewCircle.cy}
                      radius={previewCircle.radius}
                      stroke="red"
                      strokeWidth={2}
                      dash={[6, 3]}
                      listening={false}
                    />
                  )}

                  {/* Live preview — ellipse */}
                  {isDrawing && previewEllipse && tool === "ellipse" && (
                    <Ellipse
                      x={previewEllipse.cx}
                      y={previewEllipse.cy}
                      radiusX={previewEllipse.radiusX}
                      radiusY={previewEllipse.radiusY}
                      stroke="red"
                      strokeWidth={2}
                      dash={[6, 3]}
                      listening={false}
                    />
                  )}
                </Layer>
              </Stage>
            </div>
          </div>

          {/* Sidebar */}
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
                  onClick={() => setSelectedId(annotation.id)}
                >
                  <div className="annotator-card-header">
                    <strong>{annotation.type}</strong>
                    <button
                      className="btn btn-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteAnnotation(annotation.id);
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
