"use client";



import { SidebarProvider } from "@/components/layout/sidebar-context";

import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";

import { DashboardMain } from "@/components/layout/dashboard-main";

import { DashboardTopBar } from "@/components/dashboard/dashboard-top-bar";

import type { NavItem } from "@/lib/dashboard-nav";

import type { DashboardVariant } from "@/lib/dashboard-themes";

import type { DashboardNotification } from "@/components/dashboard/dashboard-user-chrome";

import { useSidebar } from "@/components/layout/sidebar-context";



export interface DashboardTopBarConfig {

  userName?: string;

  planLabel?: string;

  previewHref?: string;

  aiHref?: string;

  notifications?: DashboardNotification[];

}



interface DashboardLayoutClientProps {

  items: NavItem[];

  roleLabel: string;

  profileHref: string;

  signOutAction?: () => Promise<void>;

  variant?: DashboardVariant;

  siteName?: string;

  topBar?: DashboardTopBarConfig;

  children: React.ReactNode;

}



function DashboardLayoutInner({

  items,

  roleLabel,

  profileHref,

  signOutAction,

  variant = "admin",

  siteName,

  topBar,

  children,

}: DashboardLayoutClientProps) {

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

          <DashboardTopBar variant={variant} {...topBar} notifications={topBar?.notifications} />

          <div className="dash-content mx-auto w-full max-w-[1600px]">{children}</div>

        </DashboardMain>

      </div>

    </div>

  );

}



export function DashboardLayoutClient(props: DashboardLayoutClientProps) {

  return (

    <SidebarProvider>

      <DashboardLayoutInner {...props} />

    </SidebarProvider>

  );

}

