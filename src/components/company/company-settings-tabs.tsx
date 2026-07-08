"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  ExternalLink,
  Plug,
  Settings2,
  UserCircle,
  Package,
  Sparkles,
  Star,
} from "lucide-react";
import {
  CompanyProfileSettingsForm,
} from "@/components/company/company-settings";
import { CompanyPlanUpgrade } from "@/components/company/company-plan-upgrade";
import { GoogleCalendarConnect } from "@/components/meeting/google-calendar-connect";
import { CompanyCreativeTabShell } from "@/components/company/company-creative-tab-rail";
import type { SubscriptionPlan } from "@prisma/client";
import {
  formatProductLimit,
  productLimitForPlan,
  spotlightLimitForPlan,
} from "@/lib/plans/company-plan";
import { PLAN_DISPLAY } from "@/lib/plans/plan-catalog";

const TABS = [
  {
    id: "profile",
    label: "Profile",
    icon: UserCircle,
    description: "Brand & contact",
    accent: "blue" as const,
  },
  {
    id: "plan",
    label: "Plan & limits",
    icon: CreditCard,
    description: "Billing & caps",
    accent: "green" as const,
  },
  {
    id: "integrations",
    label: "Integrations",
    icon: Plug,
    description: "Calendar sync",
    accent: "violet" as const,
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function CompanySettingsTabs({
  companyName,
  publicProfileHref,
  marketplacePreviewHref,
  profileDefaults,
  planProps,
  usage,
  googleProps,
}: {
  companyName: string;
  publicProfileHref: string;
  marketplacePreviewHref: string | null;
  profileDefaults: Parameters<typeof CompanyProfileSettingsForm>[0]["defaultValues"];
  planProps: Parameters<typeof CompanyPlanUpgrade>[0];
  usage: {
    plan: SubscriptionPlan | null;
    productCount: number;
    publishedCount: number;
    spotlightUsed: number;
  };
  googleProps: Parameters<typeof GoogleCalendarConnect>[0];
}) {
  const [tab, setTab] = useState<TabId>("profile");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("tab");
    if (t === "plan" || t === "integrations" || t === "profile") {
      setTab(t);
    }
  }, []);

  function selectTab(id: TabId) {
    setTab(id);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", id);
    window.history.replaceState({}, "", url.toString());
  }

  const productLimit = productLimitForPlan(usage.plan);
  const spotlightLimit = spotlightLimitForPlan(usage.plan);
  const planMeta = usage.plan ? PLAN_DISPLAY[usage.plan] : null;

  return (
    <div className="company-settings">
      <div className="company-settings-hero company-settings-hero-compact relative overflow-hidden rounded-2xl px-4 py-5 text-white sm:px-5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.14),transparent_42%)]" />
        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-white/80">
              <Settings2 className="h-4 w-4" />
              <span className="text-xs font-medium tracking-wide">Workspace settings</span>
            </div>
            <h1 className="font-heading mt-1 truncate text-xl font-bold sm:text-2xl">{companyName}</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={publicProfileHref} className="company-settings-hero-link text-xs">
              Public profile <ExternalLink className="h-3 w-3" />
            </Link>
            {marketplacePreviewHref ? (
              <Link
                href={marketplacePreviewHref}
                target="_blank"
                className="company-settings-hero-link text-xs"
              >
                Preview <ExternalLink className="h-3 w-3" />
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <CompanyCreativeTabShell
        tabs={[...TABS]}
        activeId={tab}
        onChange={(id) => selectTab(id as TabId)}
      >
        {tab === "profile" && (
          <div className="company-settings-panel">
            <CompanyProfileSettingsForm defaultValues={profileDefaults} />
            <p className="mt-3 text-xs text-slate-500">
              Demo slots and open dates:{" "}
              <Link href="/company/availability" className="font-medium text-brand-blue hover:underline">
                Availability
              </Link>
            </p>
          </div>
        )}

        {tab === "plan" && (
          <div className="company-settings-panel space-y-4">
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <div className="company-usage-card company-usage-card-blue">
                <Package className="h-4 w-4 text-brand-blue" />
                <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Plan</p>
                <p className="font-heading text-base font-bold text-slate-900">
                  {planMeta?.label ?? usage.plan ?? "None"}
                </p>
              </div>
              <div className="company-usage-card company-usage-card-green">
                <Sparkles className="h-4 w-4 text-brand-green" />
                <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Products</p>
                <p className="font-heading text-base font-bold text-slate-900">
                  {usage.productCount}
                  {productLimit !== null ? ` / ${productLimit}` : " - ∞"}
                </p>
                <p className="text-[11px] text-slate-500">{usage.publishedCount} published</p>
              </div>
              <div className="company-usage-card company-usage-card-amber">
                <Star className="h-4 w-4 text-amber-500" />
                <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Spotlight</p>
                <p className="font-heading text-base font-bold text-slate-900">
                  {spotlightLimit > 0
                    ? `${usage.spotlightUsed} / ${spotlightLimit}`
                    : "Upgrade"}
                </p>
                {spotlightLimit > 0 ? (
                  <p className="text-[11px] text-slate-500">
                    {Math.max(0, spotlightLimit - usage.spotlightUsed)} slot
                    {spotlightLimit - usage.spotlightUsed === 1 ? "" : "s"} available
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500">Pro plan exclusive</p>
                )}
              </div>
              <div className="company-usage-card border-brand-green/20 bg-brand-green/5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-green-dark">Listing cap</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {formatProductLimit(usage.plan)}
                </p>
                {planMeta ? (
                  <p className="mt-0.5 text-[11px] text-slate-500">{planMeta.tagline}</p>
                ) : null}
              </div>
            </div>

            <CompanyPlanUpgrade {...planProps} />
          </div>
        )}

        {tab === "integrations" && (
          <div className="company-settings-panel space-y-3">
            <div className="flex flex-wrap gap-2">
              <Link
                href="/company/availability"
                className="inline-flex items-center rounded-lg border border-brand-blue/20 bg-brand-blue/5 px-3 py-1.5 text-xs font-medium text-brand-blue hover:bg-brand-blue/10"
              >
                Demo availability
              </Link>
            </div>
            <div className="rounded-xl border border-violet-100 bg-gradient-to-br from-violet-50/80 to-white p-4">
              <GoogleCalendarConnect {...googleProps} />
            </div>
          </div>
        )}
      </CompanyCreativeTabShell>
    </div>
  );
}
