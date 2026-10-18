import Image from "next/image";
import Link from "next/link";

import { cn } from "cn";

type BrandProps = {
  compact?: boolean;
  className?: string;
};

export default function Brand({ compact = false, className }: BrandProps) {
  return (
    <Link
      className={cn("inline-flex min-w-0 items-center gap-3", className)}
      href="/"
      aria-label="AEGIS home"
    >
      <Image
        className={cn("shrink-0 object-contain", compact ? "h-9 w-7" : "h-[62px] w-11")}
        src="/aegis-logo.png"
        alt=""
        width={1232}
        height={1744}
        priority
      />
      {!compact && (
        <span className="flex min-w-0 flex-col">
          <strong className="font-heading text-lg font-bold tracking-tight text-primary">
            AEGIS
          </strong>
          <small className="text-[0.68rem] font-semibold whitespace-nowrap text-muted-foreground">
            Academic Research Group
          </small>
        </span>
      )}
    </Link>
  );
}
