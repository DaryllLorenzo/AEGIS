import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

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
  action?: React.ReactNode;
};

export default function NavigationPage({ eyebrow, title, description, items, action }: NavigationPageProps) {
  return (
    <div className="page-container route-page">
      <div className="page-heading page-heading--split">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {action && <div className="heading-actions">{action}</div>}
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
  );
}
