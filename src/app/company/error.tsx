"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CompanyError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[company-error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-red-600">Something went wrong</p>
      <h1 className="font-heading mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Unexpected error</h1>
      <p className="mt-3 max-w-md text-slate-600">
        An unexpected error occurred in your vendor dashboard. Please try again or return to the dashboard.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button type="button" onClick={reset}>
          Try again
        </Button>
        <Button variant="outline" asChild>
          <Link href="/company/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
