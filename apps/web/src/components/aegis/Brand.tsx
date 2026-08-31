import Image from "next/image";
import Link from "next/link";

type BrandProps = {
  compact?: boolean;
};

export default function Brand({ compact = false }: BrandProps) {
  return (
    <Link className={`brand${compact ? " brand--compact" : ""}`} href="/" aria-label="AEGIS home">
      <Image
        className="brand__logo"
        src="/aegis-logo.png"
        alt=""
        width={1232}
        height={1744}
        priority
      />
      {!compact && (
        <span className="brand__copy">
          <strong>AEGIS</strong>
          <small>Academic Research Group</small>
        </span>
      )}
    </Link>
  );
}
