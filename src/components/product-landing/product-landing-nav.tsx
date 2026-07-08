"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { LandingSectionId } from "@/lib/product-landing/types";

const NAV_LABELS: Partial<Record<LandingSectionId, string>> = {
  hero: "Home",
  overview: "Overview",
  features: "Features",
  gallery: "Screenshots",
  pricing: "Pricing",
  testimonials: "Reviews",
  faqs: "FAQ",
  cta: "Demo",
};

const EXTRA_NAV = [{ id: "company", label: "Vendor" }];

export function ProductLandingNav({
  sections,
  productName,
  companyName,
}: {
  sections: LandingSectionId[];
  productName: string;
  companyName?: string;
}) {
  const [active, setActive] = useState<string>("hero");
  const [scrolled, setScrolled] = useState(false);

  const navItems = sections.filter((id) => NAV_LABELS[id]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      const offsets = [
        ...navItems.map((id) => {
          const el = document.getElementById(`landing-${id}`);
          return { id, top: el?.getBoundingClientRect().top ?? Infinity };
        }),
        { id: "company", top: document.getElementById("landing-company")?.getBoundingClientRect().top ?? Infinity },
      ];
      const current = offsets
        .filter((o) => o.top <= 120)
        .sort((a, b) => b.top - a.top)[0];
      if (current) setActive(current.id);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [navItems]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 px-4 pt-3 transition-all duration-300 sm:px-6",
        scrolled ? "pb-2" : "pb-3",
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between gap-3 transition-all duration-300",
          scrolled ? "pl-nav-float h-14 px-3 sm:h-15 sm:px-4" : "h-14 sm:h-16",
        )}
      >
        <div className="min-w-0 flex-1">
          <span className="block truncate font-heading text-sm font-bold text-slate-900 sm:text-base">
            {productName}
          </span>
          {companyName && !scrolled ? (
            <span className="hidden truncate text-[11px] text-slate-500 sm:block">by {companyName}</span>
          ) : null}
        </div>
        <nav className="hidden items-center gap-0.5 md:flex">
          {navItems.map((id) => (
            <a
              key={id}
              href={`#landing-${id}`}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-all",
                active === id
                  ? "bg-[var(--landing-primary)] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              {NAV_LABELS[id]}
            </a>
          ))}
          {EXTRA_NAV.map((item) => (
            <a
              key={item.id}
              href={`#landing-${item.id}`}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-all",
                active === item.id
                  ? "bg-[var(--landing-primary)] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <Link
          href="#landing-cta"
          className="shrink-0 rounded-full bg-[var(--landing-primary)] px-3 py-2 text-xs font-semibold text-white shadow-md shadow-[var(--landing-primary)]/25 transition-transform hover:scale-105 sm:px-4 sm:text-sm"
        >
          <span className="sm:hidden">Demo</span>
          <span className="hidden sm:inline">Book Demo</span>
        </Link>
      </div>
    </header>
  );
}
