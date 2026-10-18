"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { FileText, GraduationCap, Home, LogOut, Menu, Search, UserCog, Users } from "lucide-react";
import { useState } from "react";

import { initialsFromName } from "@aegis/domain";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "cn";
import Brand from "./Brand";
import { useAuth } from "@/lib/auth-context";

type AppShellProps = {
  children: React.ReactNode;
  searchPlaceholder?: string;
};

const baseNavItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/submissions", label: "My Submissions", icon: FileText },
  { href: "/groups", label: "Groups", icon: Users },
];

const adminNavItems = [
  { href: "/admin/users", label: "User management", icon: UserCog },
  { href: "/admin/faculties", label: "Faculty management", icon: GraduationCap },
];

export default function AppShell({ children, searchPlaceholder = "Search..." }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const navItems = user?.isAdmin ? [...baseNavItems, ...adminNavItems] : baseNavItems;
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  const nav = (
    <nav className="grid gap-1">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-5" strokeWidth={1.8} />
            <span>{label}</span>
            {active && <span className="ml-auto h-5 w-1 rounded-full bg-sidebar-primary" />}
          </Link>
        );
      })}
    </nav>
  );

  const initials = initialsFromName(user?.displayName ?? "?");

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-card px-4 py-6 md:flex">
        <Brand />
        <div className="mt-8">{nav}</div>
      </aside>

      <div className="flex min-h-screen flex-col md:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur md:px-8">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open navigation"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 px-4 py-6">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <Brand />
              <div className="mt-8">{nav}</div>
            </SheetContent>
          </Sheet>

          <label className="flex h-10 w-full max-w-xs items-center gap-2 rounded-full border bg-card px-4 transition-colors focus-within:border-primary focus-within:ring-[3px] focus-within:ring-ring/20">
            <Search className="size-[18px] shrink-0 text-muted-foreground" aria-hidden="true" />
            <input
              aria-label={searchPlaceholder}
              placeholder={searchPlaceholder}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </label>

          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  aria-label="Account options"
                >
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold">{user?.displayName ?? "Guest"}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {user?.isAdmin ? "Administrator" : "Member"}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={handleLogout}>
                  <LogOut className="size-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
