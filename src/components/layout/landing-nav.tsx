"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LANDING_SECTIONS, landingHref } from "@/lib/landing";

interface LandingNavProps {
  className?: string;
  onNavigate?: () => void;
  vertical?: boolean;
}

export function LandingNav({ className, onNavigate, vertical }: LandingNavProps) {
  const pathname = usePathname();
  const onHome = pathname === "/";

  return (
    <nav
      className={cn(
        vertical ? "flex flex-col gap-1" : "flex flex-wrap items-center justify-center gap-0.5",
        className,
      )}
    >
      {LANDING_SECTIONS.map((section) => {
        const href =
          section.id === "products"
            ? "/products"
            : onHome
              ? `#${section.id}`
              : landingHref(section.id);
        const active =
          section.id === "products"
            ? pathname === "/products" || pathname.startsWith("/book/")
            : onHome && false;

        return (
          <Link
            key={section.id}
            href={href}
            onClick={onNavigate}
            className={cn(
              "nav-link-animated rounded-lg px-2.5 py-2 text-[13px] font-medium xl:px-3 xl:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/50",
              vertical && "px-4 py-3 hover:bg-slate-50",
              active ? "text-brand-blue" : "text-slate-600",
            )}
          >
            {section.label}
          </Link>
        );
      })}
    </nav>
  );
}
