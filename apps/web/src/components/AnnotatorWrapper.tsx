"use client";

import dynamic from "next/dynamic";

import type {
  RectangleGeometry,
  CircleGeometry,
  EllipseGeometry,
  HighlightGeometry,
} from "./pdf-annotator/types";

const PdfAnnotator = dynamic(() => import("./pdf-annotator/PdfAnnotator"), {
  ssr: false,
  loading: () => (
    <div className="annotator-status">Loading annotation tool...</div>
  ),
});

export type AnnotatorWrapperProps = {
  documentId?: string;
  file?: File | null;
  pdfUrl?: string;
};

export default function AnnotatorWrapper({
  documentId,
  file: initialFile,
  pdfUrl,
}: AnnotatorWrapperProps) {
  // If a pdfUrl is provided but no File, create a File from the URL.
  // In a real app you'd fetch the blob; here we create a minimal placeholder.
  const file = initialFile ?? null;

  return <PdfAnnotator documentId={documentId} file={file} />;
}

export type {
  RectangleGeometry,
  CircleGeometry,
  EllipseGeometry,
  HighlightGeometry,
};
