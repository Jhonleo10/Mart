"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Archive,
  ArrowLeft,
  ArrowRight,
  Baby,
  BadgeIndianRupee,
  Ban,
  BookOpen,
  ChevronRight,
  Clock,
  Cookie,
  Database,
  FileText,
  Handshake,
  Lock,
  Mail,
  Scale,
  Share2,
  ShieldAlert,
  Sparkles,
  Store,
  UserCheck,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";

const LEGAL_ICONS = {
  archive: Archive,
  baby: Baby,
  badgeIndianRupee: BadgeIndianRupee,
  ban: Ban,
  cookie: Cookie,
  database: Database,
  handshake: Handshake,
  lock: Lock,
  mail: Mail,
  scale: Scale,
  share2: Share2,
  shieldAlert: ShieldAlert,
  sparkles: Sparkles,
  store: Store,
  userCheck: UserCheck,
  userCog: UserCog,
} as const;

export type LegalIconName = keyof typeof LEGAL_ICONS;

export interface LegalSection {
  id: string;
  title: string;
  body: string;
  icon: LegalIconName;
  tag?: string;
}

export interface LegalHighlight {
  label: string;
  value: string;
}

export interface LegalDocumentPageProps {
  variant: "terms" | "privacy";
  title: string;
  subtitle: string;
  lastUpdated: string;
  readMinutes: number;
  highlights: LegalHighlight[];
  sections: LegalSection[];
  relatedLink: { href: string; label: string };
  footerLinks?: { href: string; label: string; tone?: "blue" | "green" }[];
}

function slugifyId(id: string) {
  return id;
}

export function LegalDocumentPage({
  variant,
  title,
  subtitle,
  lastUpdated,
  readMinutes,
  highlights,
  sections,
  relatedLink,
  footerLinks = [],
}: LegalDocumentPageProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
  const [progress, setProgress] = useState(0);

  const sectionIds = useMemo(() => sections.map((s) => slugifyId(s.id)), [sections]);

  useEffect(() => {
    function onScroll() {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop;
      const scrollHeight = doc.scrollHeight - doc.clientHeight;
      setProgress(scrollHeight > 0 ? Math.min(100, (scrollTop / scrollHeight) * 100) : 0);

      const offset = 140;
      let current = sectionIds[0] ?? "";
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= offset) current = id;
      }
      setActiveId(current);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sectionIds]);

  return (
    <div className={cn("legal-page", `legal-page--${variant}`)}>
      <div className="legal-progress" aria-hidden>
        <span className="legal-progress-bar" style={{ width: `${progress}%` }} />
      </div>

      <header className="legal-hero">
        <div className="legal-hero-mesh" aria-hidden />
        <div className="legal-hero-grid" aria-hidden />
        <div className="legal-hero-orb legal-hero-orb--a" aria-hidden />
        <div className="legal-hero-orb legal-hero-orb--b" aria-hidden />

        <div className="safe-container relative z-10 py-10 sm:py-14">
          <Link href="/" className="legal-back-link">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="legal-hero-badge">
              <FileText className="h-3.5 w-3.5" />
              {variant === "terms" ? "Marketplace Agreement" : "Data Protection"}
            </span>
            <span className="legal-hero-meta">
              <Clock className="h-3.5 w-3.5" />
              {readMinutes} min read
            </span>
            <span className="legal-hero-meta">
              <BookOpen className="h-3.5 w-3.5" />
              {sections.length} sections
            </span>
          </div>

          <h1 className="legal-hero-title">{title}</h1>
          <p className="legal-hero-subtitle">{subtitle}</p>
          <p className="legal-hero-updated">Last updated · {lastUpdated}</p>
        </div>
      </header>

      <section className="safe-container legal-body">
        <div className="legal-glance">
          {highlights.map((item) => (
            <div key={item.label} className="legal-glance-card">
              <p className="legal-glance-label">{item.label}</p>
              <p className="legal-glance-value">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="legal-layout">
          <aside className="legal-toc">
            <p className="legal-toc-heading">On this page</p>
            <nav aria-label="Table of contents">
              <ul className="legal-toc-list">
                {sections.map((section, index) => {
                  const id = slugifyId(section.id);
                  const active = activeId === id;
                  return (
                    <li key={id}>
                      <a
                        href={`#${id}`}
                        className={cn("legal-toc-link", active && "legal-toc-link--active")}
                      >
                        <span className="legal-toc-num">{String(index + 1).padStart(2, "0")}</span>
                        <span className="line-clamp-2">{section.title.replace(/^\d+\.\s*/, "")}</span>
                        <ChevronRight className="legal-toc-chevron" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="legal-toc-related">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Related</p>
              <Link href={relatedLink.href} className="legal-related-link">
                {relatedLink.label}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </aside>

          <div className="legal-sections">
            {sections.map((section, index) => {
              const id = slugifyId(section.id);
              const Icon = LEGAL_ICONS[section.icon];
              return (
                <article key={id} id={id} className="legal-section-card">
                  <div className="legal-section-rail" aria-hidden>
                    <span className="legal-section-dot" />
                    {index < sections.length - 1 ? <span className="legal-section-line" /> : null}
                  </div>

                  <div className="legal-section-body">
                    <div className="legal-section-head">
                      <div className="legal-section-icon">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="legal-section-index">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          {section.tag ? (
                            <span className="legal-section-tag">{section.tag}</span>
                          ) : null}
                        </div>
                        <h2 className="legal-section-title">{section.title}</h2>
                      </div>
                    </div>
                    <p className="legal-section-text">{section.body}</p>
                  </div>
                </article>
              );
            })}

            <footer className="legal-footer-card">
              <p className="text-sm text-slate-600">
                Questions? We&apos;re happy to clarify anything in plain language.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/contact" className="legal-footer-btn legal-footer-btn--primary">
                  Contact support
                </Link>
                <Link href={relatedLink.href} className="legal-footer-btn">
                  {relatedLink.label}
                </Link>
                {footerLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "legal-footer-btn",
                      link.tone === "green" && "legal-footer-btn--green",
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </footer>
          </div>
        </div>
      </section>
    </div>
  );
}
