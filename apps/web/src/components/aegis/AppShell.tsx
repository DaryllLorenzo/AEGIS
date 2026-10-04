"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  FileText,
  Home,
  LogOut,
  Menu,
  MessageSquareText,
  Plus,
  Search,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

import Brand from "./Brand";
import NewGroupDialog from "./NewGroupDialog";
import { useAuth } from "@/lib/auth-context";

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
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [newGroupOpen, setNewGroupOpen] = useState(false);

  function handleLogout() {
    setOptionsOpen(false);
    logout();
    router.push("/login");
  }

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
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

        <Link className="button button--primary sidebar__create" href="/reviews/new" onClick={() => setMobileOpen(false)}>
          <Plus size={18} />
          New review
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
          <button type="button" className="sidebar__group-action" onClick={() => setNewGroupOpen(true)}>
            <Plus size={15} />
            New group
          </button>
          <Link href="/groups" onClick={() => setMobileOpen(false)}>
            View all groups
          </Link>
        </div>
      </aside>

      <div className="app-frame">
        <header className="topbar">
          <label className="search-field">
            <Search size={18} aria-hidden="true" />
            <input aria-label={searchPlaceholder} placeholder={searchPlaceholder} />
          </label>
          <div className="topbar__actions">
            <div className="shell-options-wrap">
              <button
                className={`icon-button shell-options-button${optionsOpen ? " is-active" : ""}`}
                type="button"
                aria-label="Open account options"
                aria-expanded={optionsOpen}
                onClick={() => setOptionsOpen((value) => !value)}
              >
                <SlidersHorizontal size={19} />
              </button>
              {optionsOpen && (
                <nav className="shell-options" aria-label="Account options">
                  <div className="shell-options__title">
                    <span>Options</span>
                    <small>{user?.displayName ?? "Guest"}</small>
                  </div>
                  <button type="button" onClick={handleLogout} className="shell-options__logout">
                    <LogOut size={17} />
                    <span>Sign out</span>
                  </button>
                </nav>
              )}
            </div>
          </div>
        </header>
        <main className="app-main">{children}</main>
      </div>

      <NewGroupDialog
        open={newGroupOpen}
        onClose={() => setNewGroupOpen(false)}
      />
    </div>
  );
}
