import type { ReactNode } from "react";

import { cn } from "cn";

/** Standard centered content column used by every routed page. */
export default function PageContainer({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1180px] px-4 py-7 md:px-8 md:py-9", className)}>
      {children}
    </div>
  );
}
