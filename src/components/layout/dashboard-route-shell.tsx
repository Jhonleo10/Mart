"use client";



import { SidebarProvider } from "@/components/layout/sidebar-context";

import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";

import { DashboardMain } from "@/components/layout/dashboard-main";

import { DashboardTopBar } from "@/components/dashboard/dashboard-top-bar";

import type { NavItem } from "@/lib/dashboard-nav";

import type { DashboardVariant } from "@/lib/dashboard-themes";

import type { DashboardTopBarConfig } from "@/components/layout/dashboard-layout-client";

import { useSidebar } from "@/components/layout/sidebar-context";



function DashboardRouteShellInner({

  items,

  roleLabel,

  profileHref,

  signOutAction,

  variant = "company",

  siteName,

  topBar,

  children,

}: {

  items: NavItem[];

  roleLabel: string;

  profileHref: string;

  signOutAction?: () => Promise<void>;

  variant?: DashboardVariant;

  siteName?: string;

  topBar?: DashboardTopBarConfig;

  children: React.ReactNode;

}) {

  const { collapsed } = useSidebar();



  return (

    <div

      className="dash-layout flex min-h-[100dvh] w-full"

      data-variant={variant}

      data-collapsed={collapsed ? "true" : "false"}

    >

      <div className="dash-shell flex min-h-[100dvh] w-full" data-variant={variant}>

        <DashboardSidebar

          items={items}

          roleLabel={roleLabel}

          profileHref={profileHref}

          signOutAction={signOutAction}

          variant={variant}

          siteName={siteName}

        />

        <DashboardMain>

          <DashboardTopBar variant={variant} {...topBar} />

          <div className="dash-content mx-auto w-full max-w-[1600px]">{children}</div>

        </DashboardMain>

      </div>

    </div>

  );

}



export function DashboardRouteShell({

  items,

  roleLabel,

  profileHref,

  signOutAction,

  variant = "company",

  siteName,

  topBar,

  children,

}: {

  items: NavItem[];

  roleLabel: string;

  profileHref: string;

  signOutAction?: () => Promise<void>;

  variant?: DashboardVariant;

  siteName?: string;

  topBar?: DashboardTopBarConfig;

  children: React.ReactNode;

}) {

  return (

    <SidebarProvider>

      <DashboardRouteShellInner

        items={items}

        roleLabel={roleLabel}

        profileHref={profileHref}

        signOutAction={signOutAction}

        variant={variant}

        siteName={siteName}

        topBar={topBar}

      >

        {children}

      </DashboardRouteShellInner>

    </SidebarProvider>

  );

}

