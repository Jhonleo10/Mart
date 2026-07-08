"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function CompanyAccessGuard({ status }: { status?: string }) {
    const router = useRouter();

    useEffect(() => {
        if (status === "REJECTED" || status === "SUSPENDED") {
            router.push("/login?error=access-denied");
        }
    }, [status, router]);

    return null;
}
