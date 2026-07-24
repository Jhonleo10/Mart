"use client";

import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";
import type { NavItem } from "@/lib/dashboard-nav";
import type { DashboardVariant } from "@/lib/dashboard-themes";
import type { DashboardTopBarConfig } from "@/components/layout/dashboard-layout-client";

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
    <DashboardLayoutClient
      items={items}
      roleLabel={roleLabel}
      profileHref={profileHref}
      signOutAction={signOutAction}
      variant={variant}
      siteName={siteName}
      topBar={topBar}
    >
      {children}
    </DashboardLayoutClient>
  );
}
