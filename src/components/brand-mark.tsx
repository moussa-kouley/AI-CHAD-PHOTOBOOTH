import Link from "next/link";
import { BRAND } from "@/lib/brand";

type BrandMarkProps = {
  href?: string;
  compact?: boolean;
  className?: string;
};

export function BrandMark({ href, compact = false, className = "" }: BrandMarkProps) {
  const label = compact ? BRAND.short : BRAND.fr;
  const inner = (
    <>
      <img src={BRAND.crest} alt="" className="brand-crest" width={compact ? 36 : 48} height={compact ? 36 : 48} />
      <span className="brand-copy">
        <span>{label}</span>
        {compact ? null : <small className="brand-en">{BRAND.name}</small>}
      </span>
    </>
  );
  const layout = compact ? "brand-mark brand-mark-row" : "brand-mark brand-mark-stack";
  const classes = `${layout}${className ? ` ${className}` : ""}`;
  if (href) {
    return (
      <Link href={href} className={classes} aria-label={BRAND.fr}>
        {inner}
      </Link>
    );
  }
  return (
    <p className={classes} aria-label={BRAND.fr}>
      {inner}
    </p>
  );
}
