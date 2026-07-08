"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const UNPAID_ALLOWED_PREFIXES = [
  "/company/dashboard",
  "/company/settings",
  "/company/status",
];

export function CompanyOnboardingGuard({ paymentVerified }: { paymentVerified: boolean }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (paymentVerified) return;

    const allowed = UNPAID_ALLOWED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
    if (!allowed) {
      router.replace("/company/settings?tab=plan");
    }
  }, [paymentVerified, pathname, router]);

  return null;
}
