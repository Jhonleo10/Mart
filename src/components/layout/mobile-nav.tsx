"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LandingNav } from "@/components/layout/landing-nav";
import { AUTH_PATHS } from "@/lib/auth-paths";
import { BecomeSellerLink } from "@/components/ui/become-seller-link";

interface MobileNavProps {
  dashboardHref?: string;
  isLoggedIn: boolean;
}

export function MobileNav({ dashboardHref, isLoggedIn }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="lg:hidden">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle menu"
        onClick={() => setOpen((v) => !v)}
        className="shrink-0"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {open && (
        <>
          <div
            className="fixed inset-x-0 bottom-0 z-[60] bg-black/20 backdrop-blur-sm"
            style={{ top: "var(--site-header-height)" }}
            onClick={close}
            aria-hidden
          />
          <nav
            className="fixed left-3 right-3 z-[70] max-h-[calc(100dvh-var(--site-header-height)-1rem)] overflow-y-auto rounded-2xl glass-strong p-4 shadow-xl"
            style={{ top: "calc(var(--site-header-height) + 0.25rem)" }}
          >
            <LandingNav vertical onNavigate={close} />
            <div className="mt-3 space-y-2 border-t border-slate-200/60 pt-3">
              {!isLoggedIn ? (
                <div className="grid grid-cols-1 gap-2">
                  <Link href={AUTH_PATHS.login} onClick={close} className="block">
                    <Button variant="outline" className="w-full">
                      Login
                    </Button>
                  </Link>
                  <BecomeSellerLink size="md" className="w-full justify-center" />
                </div>
              ) : (
                dashboardHref && (
                  <Link href={dashboardHref} onClick={close} className="block">
                    <Button className="w-full">Dashboard</Button>
                  </Link>
                )
              )}
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
