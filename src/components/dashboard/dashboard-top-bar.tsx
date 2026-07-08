"use client";



import Link from "next/link";

import { usePathname } from "next/navigation";

import { Bell, ExternalLink, Menu, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

import type { DashboardVariant } from "@/lib/dashboard-themes";

import { DASHBOARD_THEMES } from "@/lib/dashboard-themes";

import { useSidebar } from "@/components/layout/sidebar-context";

import {

  DashboardNotifications,

  DashboardSearchInput,

  type DashboardNotification,

} from "@/components/dashboard/dashboard-user-chrome";



function titleFromPath(pathname: string): string {

  const segment = pathname.split("/").filter(Boolean).pop() ?? "dashboard";

  const labels: Record<string, string> = {

    dashboard: "Home",

    discover: "Smart Search",

    requirements: "Requirements",

    recommendations: "For You",

    meetings: "Meetings",

    bookings: "Bookings",

    wishlist: "Saved",

    profile: "Profile",

    companies: "Companies",

    products: "Products",

    users: "Users",

    payments: "Payments",

    analytics: "Analytics",

    activity: "Activity",

    pricing: "Pricing",

    settings: "Settings",

    landing: "Product SEO",

    availability: "Availability",

    leads: "Leads",

    ai: "AI Intelligence",

    new: "New",

    edit: "Edit",

  };

  return labels[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1);

}



export function DashboardTopBar({

  variant,

  userName,

  planLabel,

  previewHref,

  aiHref,

  notifications,

}: {

  variant: DashboardVariant;

  userName?: string;

  planLabel?: string;

  previewHref?: string;

  aiHref?: string;

  notifications?: DashboardNotification[];

}) {

  const pathname = usePathname();

  const { toggleMobile } = useSidebar();

  const theme = DASHBOARD_THEMES[variant];

  const pageTitle = titleFromPath(pathname);



  return (

    <header className={cn("dash-top-bar shrink-0 border-b backdrop-blur-xl", theme.topBarBg)}>

      <div className="flex min-h-[var(--dash-topbar-height)] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">

        <div className="flex min-w-0 flex-1 items-center gap-2.5">

          {/* Menu button for mobile */}

          <button

            type="button"

            onClick={toggleMobile}

            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 lg:hidden"

            aria-label="Open menu"

          >

            <Menu className="h-4 w-4" />

          </button>



          <div className="hidden sm:flex items-center gap-3">

            <span

              className={cn(

                "shrink-0 rounded-xl px-3 py-1 text-xs font-bold uppercase tracking-widest shadow-sm",

                variant === "company"

                  ? "bg-gradient-to-r from-brand-green/20 to-brand-green/10 text-brand-green-dark border border-brand-green/20"

                  : "bg-gradient-to-r from-brand-blue/20 to-brand-blue/10 text-brand-blue border border-brand-blue/20",

              )}

            >

              {theme.accentName}

            </span>



            <div className="flex h-5 w-[2px] rounded-full bg-slate-200/60" />



            <h1 className="font-heading flex min-w-0 items-center gap-2 truncate text-lg font-bold tracking-tight text-slate-800">

              {pageTitle}

            </h1>

          </div>



          <div className="min-w-0 sm:hidden">
            <h1 className="truncate font-heading text-base font-bold tracking-tight text-slate-800">
              {pageTitle}
            </h1>
          </div>



          {userName && (

            <span className="hidden truncate text-sm font-medium text-slate-400 xl:inline ml-2">Welcome back, <span className="text-slate-600">{userName}</span></span>

          )}



        </div>



        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">

          {variant === "user" ? <DashboardSearchInput /> : null}



          {planLabel && (

            <span

              className={cn(

                "hidden rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide sm:inline",

                variant === "company"

                  ? "bg-brand-green/10 text-brand-green-dark"

                  : "bg-brand-blue/10 text-brand-blue",

              )}

            >

              {planLabel}

            </span>

          )}



          {previewHref && (

            <Link

              href={previewHref}

              target="_blank"

              className="hidden items-center gap-1 rounded-lg border border-brand-green/25 px-2.5 py-1 text-xs font-semibold text-brand-green-dark transition-colors hover:bg-brand-green/5 sm:inline-flex"

            >

              <ExternalLink className="h-3 w-3" />

              Preview

            </Link>

          )}



          {aiHref && (

            <Link

              href={aiHref}

              className="hidden items-center gap-1 rounded-lg bg-gradient-brand px-2.5 py-1 text-xs font-semibold text-white shadow-sm hover:opacity-90 sm:inline-flex"

            >

              <Sparkles className="h-3 w-3" />

              AI

            </Link>

          )}



          {variant === "user" && notifications ? (

            <DashboardNotifications initialNotifications={notifications} />

          ) : (

            <button

              type="button"

              aria-label="Notifications"

              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/80 text-slate-500 transition-colors hover:bg-slate-50 hover:text-brand-blue"

            >

              <Bell className="h-3.5 w-3.5" />

            </button>

          )}

        </div>

      </div>

    </header>

  );

}

