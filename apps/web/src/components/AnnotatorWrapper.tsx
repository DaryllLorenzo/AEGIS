"use client";

import dynamic from "next/dynamic";

const PdfAnnotator = dynamic(() => import("./PdfAnnotator"), {
  ssr: false,
  loading: () => (
    <div className="annotator-status">Loading annotation tool...</div>
  ),
});

export default function AnnotatorWrapper() {
  return <PdfAnnotator />;
}
