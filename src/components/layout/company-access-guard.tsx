"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export function CompanyAccessGuard({ status }: { status?: string }) {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (
            (status === "REJECTED" || status === "SUSPENDED") &&
            !pathname.startsWith("/company/status")
        ) {
            router.push("/login?error=access-denied");
        }
    }, [status, router, pathname]);

    return null;
}
