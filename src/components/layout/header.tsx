import Link from "next/link";
import Image from "next/image";
import type { Session } from "next-auth";
import { auth } from "@/lib/auth";
import { signOutAction } from "@/actions/auth.actions";
import { ROLE_ROUTES } from "@/lib/rbac";
import { AUTH_PATHS } from "@/lib/auth-paths";
import { Button } from "@/components/ui/button";
import { getSiteConfig } from "@/lib/site-config";
import { SiteBrandName } from "@/components/brand/site-brand-name";
import { BecomeSellerLink } from "@/components/ui/become-seller-link";
import { MobileNav } from "@/components/layout/mobile-nav";
import { LandingNav } from "@/components/layout/landing-nav";

export async function Header() {
  let session: Session | null = null;
  try {
    session = await auth();
  } catch (error) {
    console.warn("[Header] Auth unavailable during render:", error);
  }
  const site = await getSiteConfig();
  const dashboardHref = session?.user ? ROLE_ROUTES[session.user.role] : undefined;

  return (
    <header className="site-header sticky top-0 z-50">
      <div className="safe-container flex h-16 items-center gap-2 sm:h-[4.5rem] sm:gap-3">
        <Link
          href="/"
          className="site-header-logo flex min-w-0 shrink-0 items-center gap-2 sm:gap-2.5"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl sm:h-10 sm:w-10">
            <Image
              src="/GMT 4.png"
              alt={site.logoAlt}
              width={40}
              height={40}
              className="h-full w-full"
            />
          </div>
          <span className="font-heading max-w-[9rem] truncate text-sm font-bold text-slate-900 sm:max-w-none sm:text-base lg:text-lg">
            <SiteBrandName name={site.name} />
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 justify-center px-2 lg:flex">
          <LandingNav />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          {session?.user ? (
            <>
              {dashboardHref && (
                <Link
                  href={dashboardHref}
                  className="nav-link-animated hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 sm:block"
                >
                  Dashboard
                </Link>
              )}
              <form action={signOutAction}>
                <Button type="submit" variant="outline" size="sm">
                  Sign Out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href={AUTH_PATHS.login} className="hidden sm:block">
                <Button variant="ghost" size="sm" className="nav-link-animated">
                  Login
                </Button>
              </Link>
              <BecomeSellerLink className="hidden sm:inline-flex" />
            </>
          )}
          <MobileNav isLoggedIn={!!session?.user} dashboardHref={dashboardHref} />
        </div>
      </div>
    </header>
  );
}
