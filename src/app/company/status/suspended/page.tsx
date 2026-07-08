import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-stat-card";

export default function CompanySuspendedPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <DashboardPageHeader
        title="Account Suspended"
        description="Your company account has been temporarily suspended"
        className="mb-4"
      />
      <p className="text-sm text-slate-500">
        Please contact platform support to restore access.
      </p>
      <Link href="/contact" className="mt-6">
        <Button>Contact Support</Button>
      </Link>
    </div>
  );
}
