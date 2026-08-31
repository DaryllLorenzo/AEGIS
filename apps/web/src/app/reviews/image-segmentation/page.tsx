import { ArrowLeft, FileSearch } from "lucide-react";
import Link from "next/link";

import AppShell from "@/components/aegis/AppShell";

export default function ImageSegmentationReviewPage() {
  return (
    <AppShell searchPlaceholder="Search this review...">
      <div className="page-container review-overview-page">
        <div className="breadcrumb"><Link href="/reviews">My Reviews</Link><span>/</span><span>Review #1</span></div>
        <div className="review-title-block">
          <div className="review-title-block__badges"><span className="review-round"><i />Review #1 - In progress</span><code>v2.1</code></div>
          <h1>Image Segmentation Research Paper</h1>
          <p>Uploaded by <strong>Dr. Chen</strong> - due today</p>
        </div>
        <section className="content-panel instruction-panel">
          <div className="panel-heading"><FileSearch size={21} /><div><p className="eyebrow">Reviewer brief</p><h2>Evaluation focus</h2></div></div>
          <blockquote>Review the validation methodology, dataset balance, and reproducibility of the segmentation benchmarks.</blockquote>
          <div className="review-focus"><span>Validation</span><span>Datasets</span><span>Reproducibility</span></div>
          <Link className="button button--secondary" href="/reviews"><ArrowLeft size={17} />Back to reviews</Link>
        </section>
      </div>
    </AppShell>
  );
}
