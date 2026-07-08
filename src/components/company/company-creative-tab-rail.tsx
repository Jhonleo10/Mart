"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type CreativeTabItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  description?: string;
  accent?: "blue" | "green" | "violet" | "amber";
};

const ACCENT_ICON: Record<NonNullable<CreativeTabItem["accent"]>, string> = {
  blue: "company-creative-tab-icon-blue",
  green: "company-creative-tab-icon-green",
  violet: "company-creative-tab-icon-violet",
  amber: "company-creative-tab-icon-amber",
};

/** Vertical rail + animated panel for settings-style pages */
export function CompanyCreativeTabShell({
  tabs,
  activeId,
  onChange,
  children,
}: {
  tabs: CreativeTabItem[];
  activeId: string;
  onChange: (id: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="company-creative-shell">
      <nav className="company-creative-rail" role="tablist" aria-label="Section navigation">
        {tabs.map((item, index) => {
          const Icon = item.icon;
          const active = activeId === item.id;
          const accent = item.accent ?? "blue";

          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(item.id)}
              className={cn("company-creative-tab", active && "company-creative-tab-active")}
            >
              <span className="company-creative-tab-step">{String(index + 1).padStart(2, "0")}</span>
              <span className={cn("company-creative-tab-icon", ACCENT_ICON[accent])}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="company-creative-tab-label">{item.label}</span>
                {item.description && (
                  <span className="company-creative-tab-desc">{item.description}</span>
                )}
              </span>
              {active && <span className="company-creative-tab-glow" aria-hidden />}
            </button>
          );
        })}
      </nav>

      <div className="company-creative-panel-wrap">
        <div className="company-creative-panel-accent" aria-hidden />
        <div
          key={activeId}
          className="company-creative-panel company-creative-panel-enter"
          role="tabpanel"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
