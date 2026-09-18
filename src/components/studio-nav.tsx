"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { LogoutButton } from "@/components/logout-button";
import { studio } from "@/lib/studio-copy";

const LINKS = [
  { href: "/app", label: studio.nav.floor, match: (path: string) => path === "/app" || path.startsWith("/app/booths") },
  { href: "/app/generations", label: studio.nav.archive, match: (path: string) => path.startsWith("/app/generations") },
  { href: "/app/credits", label: studio.nav.portraits, match: (path: string) => path.startsWith("/app/credits") },
];

export function StudioNav() {
  const path = usePathname();
  return (
    <>
      <header className="studio-nav no-print">
        <BrandMark href="/app" compact className="studio-mark" />
        <nav>
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              data-on={link.match(path)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <LogoutButton />
      </header>
      <div className="studio-rule no-print" />
    </>
  );
}
