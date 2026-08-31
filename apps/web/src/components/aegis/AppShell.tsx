"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  FileText,
  Home,
  Menu,
  MessageSquareText,
  Plus,
  Search,
  Settings,
  SlidersHorizontal,
  Users,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";

import Brand from "./Brand";

type AppShellProps = {
  children: React.ReactNode;
  searchPlaceholder?: string;
};

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/reviews", label: "My Reviews", icon: MessageSquareText },
  { href: "/submissions", label: "My Submissions", icon: FileText },
  { href: "/groups", label: "Groups", icon: Users },
];

export default function AppShell({ children, searchPlaceholder = "Search..." }: AppShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    if (href === "/reviews") return pathname.startsWith("/reviews");
    if (href === "/submissions") return pathname.startsWith("/submissions");
    if (href === "/groups") return pathname.startsWith("/groups");
    return pathname.startsWith(href);
  }

  return (
    <div className="app-shell">
      <button
        className="mobile-menu-button icon-button"
        type="button"
        aria-label="Open navigation"
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={21} />
      </button>

      {mobileOpen && <button className="nav-backdrop" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}

      <aside className={`sidebar${mobileOpen ? " sidebar--open" : ""}`}>
        <div className="sidebar__header">
          <Brand />
          <button className="sidebar__close icon-button" type="button" aria-label="Close navigation" onClick={() => setMobileOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <Link className="button button--primary sidebar__create" href="/submissions/new" onClick={() => setMobileOpen(false)}>
          <Plus size={18} />
          New submission
        </Link>

        <nav className="sidebar__nav" aria-label="Main navigation">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`nav-item${isActive(href) ? " nav-item--active" : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={19} strokeWidth={1.8} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar__groups">
          <span>My groups</span>
          <Link href="/groups/ai-in-education" onClick={() => setMobileOpen(false)}>
            <i className="group-dot group-dot--green" /> AI in Education
          </Link>
          <Link href="/groups/computer-vision" onClick={() => setMobileOpen(false)}><i className="group-dot group-dot--blue" /> Computer Vision</Link>
        </div>

        <div className="sidebar__footer">
          <Link href="/notifications" className={`nav-item${pathname === "/notifications" ? " nav-item--active" : ""}`} onClick={() => setMobileOpen(false)}><Bell size={19} /><span>Notifications</span><b>3</b></Link>
          <Link href="/settings" className={`nav-item${pathname === "/settings" ? " nav-item--active" : ""}`} onClick={() => setMobileOpen(false)}><Settings size={19} /><span>Settings</span></Link>
        </div>
      </aside>

      <div className="app-frame">
        <header className="topbar">
          <label className="search-field">
            <Search size={18} aria-hidden="true" />
            <input aria-label={searchPlaceholder} placeholder={searchPlaceholder} />
          </label>
          <div className="topbar__actions">
            <Link className="icon-button notification-button" href="/notifications" aria-label="Notifications">
              <Bell size={20} />
              <span />
            </Link>
            <Link className="profile-button" href="/profile" aria-label="Open profile">
              <span>MG</span>
            </Link>
            <div className="shell-options-wrap">
              <button className={`icon-button shell-options-button${optionsOpen ? " is-active" : ""}`} type="button" aria-label="Open options" aria-expanded={optionsOpen} onClick={() => setOptionsOpen((value) => !value)}>
                <SlidersHorizontal size={19} />
              </button>
              {optionsOpen && (
                <nav className="shell-options" aria-label="Account and workspace options">
                  <div className="shell-options__title"><span>Options</span><small>María González</small></div>
                  <Link href="/profile" onClick={() => setOptionsOpen(false)}><UserRound size={17} /><span><strong>Profile</strong><small>Account and identity</small></span></Link>
                  <Link href="/notifications" onClick={() => setOptionsOpen(false)}><Bell size={17} /><span><strong>Notifications</strong><small>3 unread updates</small></span></Link>
                  <Link href="/settings" onClick={() => setOptionsOpen(false)}><Settings size={17} /><span><strong>Settings</strong><small>Workspace preferences</small></span></Link>
                  <div className="shell-options__divider" />
                  <Link href="/login" onClick={() => setOptionsOpen(false)}>Sign out</Link>
                </nav>
              )}
            </div>
          </div>
        </header>
        <main className="app-main">{children}</main>
      </div>
    </div>
  );
}
