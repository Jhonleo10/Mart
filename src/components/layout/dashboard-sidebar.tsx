"use client";



import Link from "next/link";

import { usePathname } from "next/navigation";

import { ChevronLeft, ChevronRight, LogOut, User, X } from "lucide-react";

import Image from "next/image";

import { cn } from "@/lib/utils";

import type { NavItem } from "@/lib/dashboard-nav";

import { IconRenderer } from "@/components/icons/icon-mapper";

import { useSidebar } from "@/components/layout/sidebar-context";

import type { DashboardVariant } from "@/lib/dashboard-themes";

import { DASHBOARD_THEMES } from "@/lib/dashboard-themes";

import { BRAND } from "@/lib/brand";
import { SiteBrandName } from "@/components/brand/site-brand-name";



interface DashboardSidebarProps {

  items: NavItem[];

  roleLabel: string;

  profileHref: string;

  signOutAction?: () => Promise<void>;

  variant?: DashboardVariant;

  siteName?: string;

}



export function DashboardSidebar({

  items,

  roleLabel,

  profileHref,

  signOutAction,

  variant = "admin",

  siteName = BRAND.name,

}: DashboardSidebarProps) {

  const pathname = usePathname();

  const { collapsed, toggle, mobileOpen, setMobileOpen } = useSidebar();

  const theme = DASHBOARD_THEMES[variant];



  return (

    <>

      {mobileOpen ? (

        <button

          type="button"

          aria-label="Close menu"

          className="dash-sidebar-overlay lg:hidden"

          onClick={() => setMobileOpen(false)}

        />

      ) : null}



      <aside

        className={cn(

          "dash-sidebar fixed left-0 top-0 z-50 flex h-[100dvh] flex-col border-r shadow-lg transition-transform duration-300 ease-in-out lg:shadow-sm",

          theme.sidebarBg,

          theme.sidebarBorder,

          collapsed ? "w-[var(--dash-sidebar-w-collapsed)]" : "w-[var(--dash-sidebar-w)]",

          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",

        )}

      >

        <div className={cn("border-b p-3.5", theme.sidebarBorder, collapsed && "px-2")}>

          <div className="flex items-center justify-between gap-2">

            <Link href="/" className="flex min-w-0 flex-1 items-center gap-2.5">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg ring-1 ring-slate-200/80">

                <Image

                  src={BRAND.logoSrc}

                  alt={BRAND.logoAlt}

                  width={36}

                  height={36}

                  className="h-full w-full object-contain"

                />

              </div>

              {!collapsed && (

                <div className="min-w-0">

                  <p className={cn("font-heading truncate text-sm font-bold leading-tight", theme.sidebarText)}>
                    <SiteBrandName name={siteName} />
                  </p>

                  <p className={cn("truncate text-[10px] font-semibold uppercase tracking-wider", theme.roleLabelColor)}>

                    {roleLabel}

                  </p>

                </div>

              )}

            </Link>

            <button

              type="button"

              onClick={() => setMobileOpen(false)}

              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 lg:hidden"

              aria-label="Close sidebar"

            >

              <X className="h-4 w-4" />

            </button>

          </div>



          <button

            type="button"

            onClick={toggle}

            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}

            className={cn(

              "mt-2.5 hidden items-center justify-center rounded-lg border border-slate-200/80 bg-slate-50 py-1.5 text-slate-400 transition-colors hover:border-brand-blue/20 hover:bg-brand-blue/5 hover:text-brand-blue lg:flex",

              collapsed ? "mx-auto w-9" : "w-full",

            )}

          >

            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}

          </button>

        </div>



        <nav className="flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden p-2.5 overscroll-contain">

          {items.map((item) => {

            const active = pathname === item.href || pathname.startsWith(item.href + "/");

            return (

              <Link

                key={item.href}

                href={item.href}

                title={collapsed ? item.label : undefined}

                onClick={() => setMobileOpen(false)}

                className={cn(

                  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-200",

                  active ? theme.activeNav : theme.inactiveNav,

                  collapsed && "justify-center px-2",

                )}

              >

                <IconRenderer

                  iconName={item.iconName}

                  className={cn("h-[17px] w-[17px] shrink-0", active && "text-white")}

                />

                {!collapsed && <span className="truncate">{item.label}</span>}

              </Link>

            );

          })}

        </nav>



        <div className={cn("border-t p-2.5", theme.sidebarBorder, collapsed && "px-2")}>

          <Link

            href={profileHref}

            title="Profile"

            onClick={() => setMobileOpen(false)}

            className={cn(

              "mb-0.5 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-brand-blue",

              collapsed && "justify-center px-2",

              pathname === profileHref && "bg-brand-blue/5 text-brand-blue",

            )}

          >

            <User className="h-[17px] w-[17px] shrink-0" />

            {!collapsed && <span>Profile</span>}

          </Link>

          {signOutAction && (

            <form action={signOutAction}>

              <button

                type="submit"

                title="Sign out"

                className={cn(

                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-500",

                  collapsed && "justify-center px-2",

                )}

              >

                <LogOut className="h-[17px] w-[17px] shrink-0" />

                {!collapsed && <span>Sign Out</span>}

              </button>

            </form>

          )}

        </div>

      </aside>

    </>

  );

}

