import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { signOutAction } from "@/actions/auth.actions";
import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";
import { ADMIN_NAV } from "@/lib/dashboard-nav";
import { getSiteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") redirect("/login");
  const site = await getSiteConfig();

  return (
    <DashboardLayoutClient
      items={ADMIN_NAV}
      roleLabel="Admin Panel"
      profileHref="/admin/settings"
      signOutAction={signOutAction}
      variant="admin"
      siteName={site.name}
      topBar={{ userName: session?.user.name ?? "Administrator" }}
    >
      {children}
    </DashboardLayoutClient>
  );
}
