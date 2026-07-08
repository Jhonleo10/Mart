import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { auth } from "@/lib/auth";

import { signOutAction } from "@/actions/auth.actions";

import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";

import { ComparisonProvider } from "@/components/compare/comparison-tray-context";

import { ComparisonTray } from "@/components/compare/comparison-tray";

import { WishlistProvider } from "@/components/products/wishlist-context";

import { USER_NAV } from "@/lib/dashboard-nav";

import {

  notificationRepository,

  wishlistRepository,

} from "@/repositories/notification.repository";



import { getSiteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "USER") {
    if (session.user.role === "COMPANY") redirect("/company/dashboard");
    if (session.user.role === "ADMIN") redirect("/admin/dashboard");
    redirect("/");
  }
  const site = await getSiteConfig();



  const [wishlistRows, notifications] = await Promise.all([

    wishlistRepository.listProductIds(session.user.id),

    notificationRepository.listByUser(session.user.id),

  ]);



  const wishlistIds = wishlistRows.map((row) => row.productId);

  const notificationItems = notifications.map((n) => ({

    id: n.id,

    title: n.title,

    message: n.message,

    link: n.link,

    read: n.read,

    createdAt: n.createdAt.toISOString(),

  }));



  return (

    <WishlistProvider initialIds={wishlistIds}>

      <ComparisonProvider>

        <DashboardLayoutClient

          items={USER_NAV}

          roleLabel="Discovery Lounge"

          profileHref="/user/profile"

          signOutAction={signOutAction}

          variant="user"
          siteName={site.name}
          topBar={{

            userName: session.user.name ?? "Explorer",

            notifications: notificationItems,

          }}

        >

          {children}

        </DashboardLayoutClient>

        <ComparisonTray />

      </ComparisonProvider>

    </WishlistProvider>

  );

}

