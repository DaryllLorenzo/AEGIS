import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import AppShell from "./AppShell";

type NavigationItem = {
  href: string;
  title: string;
  description: string;
  meta: string;
  icon: LucideIcon;
};

type NavigationPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  searchPlaceholder?: string;
  items: NavigationItem[];
};

export default function NavigationPage({ eyebrow, title, description, searchPlaceholder, items }: NavigationPageProps) {
  return (
    <AppShell searchPlaceholder={searchPlaceholder}>
      <div className="page-container route-page">
        <div className="page-heading">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <div className="navigation-grid">
          {items.map(({ href, title: itemTitle, description: itemDescription, meta, icon: Icon }) => (
            <Link className="navigation-card" href={href} key={href}>
              <span className="navigation-card__icon"><Icon size={21} /></span>
              <span className="navigation-card__copy">
                <h2>{itemTitle}</h2>
                <p>{itemDescription}</p>
                <small>{meta}</small>
              </span>
              <ArrowRight size={18} />
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
