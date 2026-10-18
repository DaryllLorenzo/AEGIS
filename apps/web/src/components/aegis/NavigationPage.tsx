import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import PageContainer from "./PageContainer";

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
  items: NavigationItem[];
  action?: React.ReactNode;
  toolbar?: React.ReactNode;
};

export default function NavigationPage({
  eyebrow,
  title,
  description,
  items,
  action,
  toolbar,
}: NavigationPageProps) {
  return (
    <PageContainer>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-1">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
        </div>
        {action && <div className="flex flex-wrap gap-2.5">{action}</div>}
      </div>

      {toolbar && <div className="mt-6">{toolbar}</div>}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {items.map(({ href, title: itemTitle, description: itemDescription, meta, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group grid grid-cols-[auto_1fr_auto] items-start gap-3.5 rounded-xl border bg-card p-5 shadow-sm transition duration-150 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
          >
            <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-5" />
            </span>
            <span className="min-w-0">
              <h2 className="text-lg font-semibold">{itemTitle}</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {itemDescription}
              </p>
              <small className="mt-3 block text-xs font-bold tracking-wide text-primary uppercase">
                {meta}
              </small>
            </span>
            <ArrowRight className="mt-2.5 size-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}
