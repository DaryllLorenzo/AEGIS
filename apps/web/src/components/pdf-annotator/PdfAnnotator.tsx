"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Stage, Layer } from "react-konva";

import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

import "./annotator.css";
import "./toolbar.css";
import "./sidebar.css";

import type {
  Tool,
  Annotation,
  RectangleGeometry,
  CircleGeometry,
  EllipseGeometry,
  HighlightGeometry,
} from "./types";
import type { WordBox } from "./text-layer-helpers";
import {
  extractWordsFromTextLayer,
  computeHighlightLinesFromWords,
} from "./text-layer-helpers";
import Toolbar from "./Toolbar";
import Sidebar from "./Sidebar";
import {
  RectangleAnnotation,
  CircleAnnotation,
  EllipseAnnotation,
  HighlightAnnotation,
} from "./annotations";
import {
  RectanglePreview,
  CirclePreview,
  EllipsePreview,
  HighlightPreview,
} from "./previews";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

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
  const [liveHighlight, setLiveHighlight] = useState<HighlightGeometry | null>(null);

  const [pageSize, setPageSize] = useState({ width: 800, height: 1100 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const cachedWords = useRef<WordBox[]>([]);

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
    (x: number) => x / pageSize.height,
    [pageSize.height],
  );

  // -- Delete ----------------------------------------------------------------

  const deleteAnnotation = useCallback((id: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
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
      setLiveHighlight(null);

      if (tool === "highlight" && pageContainerRef.current) {
        cachedWords.current = extractWordsFromTextLayer(pageContainerRef.current);
      }
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

      if (tool === "highlight" && startPoint.current && cachedWords.current.length > 0) {
        const result = computeHighlightLinesFromWords(
          cachedWords.current,
          startPoint.current.x,
          startPoint.current.y,
          pointer.x,
          pointer.y,
        );

        if (result && result.lines.length > 0) {
          setLiveHighlight({
            lines: result.lines.map((l) => ({
              x: normalizeX(l.x),
              y: normalizeY(l.y),
              width: normalizeX(l.width),
              height: normalizeY(l.height),
            })),
          });
        } else {
          setLiveHighlight(null);
        }
      }
    },
    [isDrawing, tool, normalizeX, normalizeY],
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
        setLiveHighlight(null);
        return;
      }

      // -- Highlight: DOM Range word-snapping -------------------------------

      if (tool === "highlight" && cachedWords.current.length > 0) {
        const result = computeHighlightLinesFromWords(
          cachedWords.current,
          start.x,
          start.y,
          end.x,
          end.y,
        );

        if (!result || result.lines.length === 0) {
          setIsDrawing(false);
          startPoint.current = null;
          setCurrentPointer(null);
          setLiveHighlight(null);
          cachedWords.current = [];
          return;
        }

        const geometry: HighlightGeometry = {
          lines: result.lines.map((l) => ({
            x: normalizeX(l.x),
            y: normalizeY(l.y),
            width: normalizeX(l.width),
            height: normalizeY(l.height),
          })),
        };

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
        setLiveHighlight(null);
        cachedWords.current = [];
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
        geometry = {
          cx: normalizeX(centerX),
          cy: normalizeY(centerY),
          radius: normalizeX(Math.max(width, height) / 2),
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

  // -- Derived preview coords ------------------------------------------------

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
        <Toolbar
          tool={tool}
          onToolChange={(t) => { setTool(t); setSelectedId(null); }}
          selectedId={selectedId}
          onDeleteSelected={deleteSelected}
          pageNumber={pageNumber}
          numPages={numPages}
          onPageChange={setPageNumber}
        />
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
                      const onSelect = () => setSelectedId(annotation.id);

                      if (annotation.type === "rectangle") {
                        return (
                          <RectangleAnnotation
                            key={annotation.id}
                            geometry={annotation.geometry as RectangleGeometry}
                            pageWidth={pageSize.width}
                            pageHeight={pageSize.height}
                            isSelected={isSelected}
                            isSelectTool={isSelect}
                            onSelect={onSelect}
                          />
                        );
                      }

                      if (annotation.type === "circle") {
                        return (
                          <CircleAnnotation
                            key={annotation.id}
                            geometry={annotation.geometry as CircleGeometry}
                            pageWidth={pageSize.width}
                            pageHeight={pageSize.height}
                            isSelected={isSelected}
                            isSelectTool={isSelect}
                            onSelect={onSelect}
                          />
                        );
                      }

                      if (annotation.type === "ellipse") {
                        return (
                          <EllipseAnnotation
                            key={annotation.id}
                            geometry={annotation.geometry as EllipseGeometry}
                            pageWidth={pageSize.width}
                            pageHeight={pageSize.height}
                            isSelected={isSelected}
                            isSelectTool={isSelect}
                            onSelect={onSelect}
                          />
                        );
                      }

                      if (annotation.type === "highlight") {
                        return (
                          <HighlightAnnotation
                            key={annotation.id}
                            geometry={annotation.geometry as HighlightGeometry}
                            pageWidth={pageSize.width}
                            pageHeight={pageSize.height}
                            isSelected={isSelected}
                            onSelect={onSelect}
                          />
                        );
                      }

                      return null;
                    })}

                  {/* Live previews */}
                  {isDrawing && tool === "highlight" && drawStart && drawEnd && (
                    <HighlightPreview
                      liveHighlight={liveHighlight}
                      drawStart={drawStart}
                      drawEnd={drawEnd}
                      pageWidth={pageSize.width}
                      pageHeight={pageSize.height}
                    />
                  )}

                  {isDrawing && previewRect && tool === "rectangle" && (
                    <RectanglePreview {...previewRect} />
                  )}

                  {isDrawing && previewCircle && tool === "circle" && (
                    <CirclePreview {...previewCircle} />
                  )}

                  {isDrawing && previewEllipse && tool === "ellipse" && (
                    <EllipsePreview {...previewEllipse} />
                  )}
                </Layer>
              </Stage>
            </div>
          </div>

          {/* Sidebar */}
          <Sidebar
            annotations={annotations}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onDelete={deleteAnnotation}
          />
        </div>
      )}
    </main>
  );
}
