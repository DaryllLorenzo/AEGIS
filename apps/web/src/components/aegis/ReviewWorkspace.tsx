"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Grid2X2,
  Hand,
  Highlighter,
  Menu,
  MessageSquarePlus,
  MoreHorizontal,
  Settings2,
  Download,
  Eye,
  LayoutDashboard,
  PanelRight,
  PencilLine,
  Send,
  Settings,
  Underline,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useMemo, useState } from "react";

import { comments, discussionMessages } from "@/lib/mock-data";

import Avatar from "./Avatar";
import Brand from "./Brand";

const tools = [
  { id: "pan", label: "Pan", icon: Hand },
  { id: "highlight", label: "Highlight", icon: Highlighter },
  { id: "comment", label: "Comment", icon: MessageSquarePlus },
  { id: "draw", label: "Draw", icon: PencilLine },
  { id: "underline", label: "Underline", icon: Underline },
] as const;

export default function ReviewWorkspace() {
  const [activePage, setActivePage] = useState(2);
  const [activeTab, setActiveTab] = useState<"annotations" | "discussion">("annotations");
  const [activeTool, setActiveTool] = useState<(typeof tools)[number]["id"]>("highlight");
  const [resolvedIds, setResolvedIds] = useState<number[]>(comments.filter((comment) => comment.resolved).map((comment) => comment.id));
  const [complete, setComplete] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [optionsOpen, setOptionsOpen] = useState(false);

  const openComments = useMemo(() => comments.filter((comment) => !resolvedIds.includes(comment.id)).length, [resolvedIds]);

  function toggleResolved(id: number) {
    setResolvedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  return (
    <main className="workspace">
      <header className="workspace-header">
        <Link className="icon-button" href="/reviews/adaptive-learning" aria-label="Back to review overview"><ArrowLeft size={22} /></Link>
        <span className="workspace-header__divider" />
        <Brand compact />
        <div className="workspace-header__title"><span>Thesis review project</span><strong>AI in Education · Final Draft</strong></div>
        <div className="workspace-header__right">
          <span className={`workspace-status${complete ? " workspace-status--complete" : ""}`}><i />{complete ? "Your review · Completed" : "Review #4 · Open"}</span>
          <div className="avatar-stack workspace-reviewers"><Avatar initials="MC" size="sm" /><Avatar initials="CR" tone="blue" size="sm" /><span>+2</span></div>
          <button className={`button ${complete ? "button--secondary" : "button--primary"}`} type="button" onClick={() => setComplete((value) => !value)}>
            <CheckCircle2 size={17} />{complete ? "Reopen review" : "Complete review"}
          </button>
          <button className="icon-button workspace-panel-toggle" type="button" aria-label="Open review panel" onClick={() => setRightPanelOpen(true)}><Menu size={20} /></button>
          <div className="workspace-options-wrap">
            <button className={`icon-button workspace-options-button${optionsOpen ? " is-active" : ""}`} type="button" aria-label="Open workspace options" onClick={() => setOptionsOpen((value) => !value)}><Settings2 size={19} /></button>
            {optionsOpen && (
              <div className="workspace-options" role="menu">
                <div className="workspace-options__title"><span>Workspace options</span><small>Review #4</small></div>
                <button type="button" role="menuitem"><Eye size={16} /><span><strong>View mode</strong><small>Single page</small></span><b>⌄</b></button>
                <button type="button" role="menuitem"><PanelRight size={16} /><span><strong>Review panel</strong><small>{activeTab === "annotations" ? "Annotations" : "Discussion"}</small></span><b>⌄</b></button>
                <button type="button" role="menuitem"><Download size={16} /><span><strong>Download version</strong><small>Adaptive Learning Thesis · v1.4</small></span></button>
                <div className="workspace-options__divider" />
                <label className="workspace-option-toggle"><span>Show resolved annotations</span><input type="checkbox" defaultChecked /></label>
                <div className="workspace-options__divider" />
                <Link href="/" onClick={() => setOptionsOpen(false)}><LayoutDashboard size={16} /><span><strong>Dashboard</strong><small>Return to your overview</small></span></Link>
                <Link href="/settings" onClick={() => setOptionsOpen(false)}><Settings size={16} /><span><strong>Settings</strong><small>Workspace preferences</small></span></Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="workspace-body">
        <aside className="pages-panel">
          <div className="pages-panel__heading"><span>Pages</span><Grid2X2 size={18} /></div>
          <div className="page-thumbnails">
            {[1, 2, 3].map((page) => (
              <button className={`page-thumbnail${activePage === page ? " is-active" : ""}`} type="button" key={page} onClick={() => setActivePage(page)} aria-label={`Open page ${page}`}>
                <span className={`page-thumbnail__paper page-thumbnail__paper--${page}`}><i /><i /><i /><b /></span>
                <strong>{page}</strong>
              </button>
            ))}
          </div>
        </aside>

        <section className="document-stage">
          <div className="document-page" style={{ transform: `scale(${zoom / 100})` }}>
            <p className="document-page__kicker">Research article · Version 2.1</p>
            <h1>Methodology and AI Integration in Modern Pedagogy</h1>
            <div className="document-page__rule" />
            <p>The rapid acceleration of generative AI models poses significant questions regarding traditional assessment frameworks. Historically, evaluation has relied on isolated recall and synthesis performed under rigid constraints.</p>
            <p><mark>However, if cognitive offloading becomes seamlessly integrated into the student&apos;s natural workflow, defining the boundary between student capability and tool affordance becomes intrinsically problematic.</mark></p>
            <p>Furthermore, institutional policies have largely failed to pace with algorithmic developments. We propose a restructured taxonomy of learning objectives that explicitly incorporates human-AI collaborative outputs as a fundamental metric.</p>
            <figure className="document-figure">
              <figcaption><span>Fig 2. Collaboration matrix</span><code>v2.1</code></figcaption>
              <div><span><strong>Directive</strong>Student dictates entirely.</span><span><strong>Symbiotic</strong>Iterative co-creation.</span></div>
            </figure>
            <div className="annotation-pin annotation-pin--one">1</div>
          </div>

          <div className="workspace-toolbar" role="toolbar" aria-label="Annotation tools">
            {tools.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button" className={activeTool === id ? "is-active" : ""} onClick={() => setActiveTool(id)} title={label} aria-label={label}><Icon size={19} /></button>
            ))}
            <span />
            <button type="button" onClick={() => setZoom((value) => Math.max(80, value - 10))} title="Zoom out" aria-label="Zoom out"><ZoomOut size={18} /></button>
            <strong>{zoom}%</strong>
            <button type="button" onClick={() => setZoom((value) => Math.min(130, value + 10))} title="Zoom in" aria-label="Zoom in"><ZoomIn size={18} /></button>
          </div>
        </section>

        {rightPanelOpen && <button className="review-panel-backdrop" type="button" aria-label="Close review panel" onClick={() => setRightPanelOpen(false)} />}
        <aside className={`review-panel${rightPanelOpen ? " review-panel--open" : ""}`}>
          <div className="review-panel__tabs">
            <button className={activeTab === "annotations" ? "is-active" : ""} type="button" onClick={() => setActiveTab("annotations")}>Annotations ({openComments})</button>
            <button className={activeTab === "discussion" ? "is-active" : ""} type="button" onClick={() => setActiveTab("discussion")}>Discussion</button>
          </div>

          {activeTab === "annotations" ? (
            <div className="comments-list">
              {comments.map((comment) => {
                const resolved = resolvedIds.includes(comment.id);
                return (
                  <article className={`comment-card${resolved ? " is-resolved" : ""}`} key={comment.id}>
                    <div className="comment-card__author"><Avatar initials={comment.initials} size="sm" tone={comment.id === 1 ? "sage" : "blue"} /><strong>{comment.author}</strong><span>· p.{comment.page}</span><button type="button" aria-label="More options"><MoreHorizontal size={17} /></button></div>
                    <blockquote>{comment.quote}</blockquote>
                    <p>{comment.body}</p>
                    <div><button type="button">Reply</button><button type="button" onClick={() => toggleResolved(comment.id)}>{resolved ? "Reopen" : "Resolve"}</button></div>
                  </article>
                );
              })}
              <div className="annotation-empty"><MessageSquarePlus size={24} /><p>Select text to add an annotation</p></div>
            </div>
          ) : (
            <div className="discussion-panel">
              <div className="discussion-list">
                {discussionMessages.map((item) => (
                  <article key={item.author}><Avatar initials={item.initials} size="sm" tone={item.initials === "AM" ? "sage" : "blue"} /><div><strong>{item.author}</strong><time>{item.time}</time><p>{item.body}</p></div></article>
                ))}
              </div>
              <form className="message-composer" onSubmit={(event) => { event.preventDefault(); setMessage(""); }}>
                <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Write a message..." aria-label="Discussion message" />
                <button className="icon-button" type="submit" aria-label="Send message" disabled={!message.trim()}><Send size={18} /></button>
              </form>
            </div>
          )}
        </aside>
      </div>

      <div className="mobile-page-controls">
        <button type="button" disabled={activePage === 1} onClick={() => setActivePage((page) => page - 1)} aria-label="Previous page"><ChevronLeft size={18} /></button>
        <span>Page {activePage} of 3</span>
        <button type="button" disabled={activePage === 3} onClick={() => setActivePage((page) => page + 1)} aria-label="Next page"><ChevronRight size={18} /></button>
      </div>
    </main>
  );
}
