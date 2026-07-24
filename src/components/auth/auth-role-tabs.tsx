"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, UserPlus, Store } from "lucide-react";
import { cn } from "@/lib/utils";
import { AUTH_PATHS } from "@/lib/auth-paths";

export type AuthTab = "login" | "buyer" | "seller" | "verify";

const TABS: {
  id: AuthTab;
  href: string;
  label: string;
  shortLabel: string;
  icon: typeof LogIn;
  tone: "blue" | "green";
}[] = [
  {
    id: "login",
    href: AUTH_PATHS.login,
    label: "Sign In",
    shortLabel: "Login",
    icon: LogIn,
    tone: "blue",
  },
  {
    id: "buyer",
    href: AUTH_PATHS.userRegister,
    label: "Buyer Register",
    shortLabel: "Buyer",
    icon: UserPlus,
    tone: "blue",
  },
  {
    id: "seller",
    href: AUTH_PATHS.companyRegister,
    label: "Become a Vendor",
    shortLabel: "Vendor",
    icon: Store,
    tone: "green",
  },
];

export function AuthRoleTabs({ active }: { active: AuthTab }) {
  const pathname = usePathname();

  return (
    <nav className="auth-role-tabs" aria-label="Account type">
      {TABS.map((tab) => {
        const isActive = active === tab.id || pathname === tab.href;
        const Icon = tab.icon;

        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={cn(
              "auth-role-tab",
              isActive && "auth-role-tab-active",
              tab.tone === "green" && !isActive && "auth-role-tab-seller",
              isActive && tab.tone === "green" && "auth-role-tab-active-green",
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.shortLabel}</span>
          </Link>
        );
      })}
    </nav>
  );
}
