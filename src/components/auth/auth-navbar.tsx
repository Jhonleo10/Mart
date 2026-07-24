"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { AUTH_PATHS } from "@/lib/auth-paths";
import { SiteBrandName } from "@/components/brand/site-brand-name";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: AUTH_PATHS.login, label: "Login" },
  { href: AUTH_PATHS.userRegister, label: "Buyer Register" },
  { href: AUTH_PATHS.companyRegister, label: "Become a Vendor", seller: true },
] as const;

export function AuthNavbar({
  siteName = "Genius Mart",
  logoAlt = "Genius Mart",
}: {
  siteName?: string;
  logoAlt?: string;
}) {
  const pathname = usePathname();

  return (
    <header className="auth-navbar auth-navbar-v2">
      <div className="auth-navbar-inner">
        <Link href="/" className="auth-navbar-logo">
          <Image src="/GMT 4.png" alt={logoAlt} width={36} height={36} className="h-9 w-9 rounded-lg" />
          <span className="font-heading text-sm font-bold text-slate-900 sm:text-base">
            <SiteBrandName name={siteName} />
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Auth navigation">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "auth-nav-link",
                pathname === link.href && "auth-nav-link-active",
                "seller" in link && link.seller && "auth-nav-link-seller",
                pathname === link.href && "seller" in link && link.seller && "auth-nav-link-active-green",
              )}
            >
              {"icon" in link ? <link.icon className="h-3.5 w-3.5" /> : null}
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <Link href={AUTH_PATHS.login}>
            <Button variant="ghost" size="sm">
              Login
            </Button>
          </Link>
          <Link href={AUTH_PATHS.userRegister}>
            <Button size="sm" className="bg-brand-blue">
              Register
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
