import Link from "next/link";
import { auth } from "@/lib/auth";
import { companyRepository } from "@/repositories/company.repository";
import { Button } from "@/components/ui/button";
import { DashboardPageHeader } from "@/components/dashboard/dashboard-stat-card";

export default async function CompanyRejectedPage() {
  const session = await auth();
  const company = session?.user
    ? await companyRepository.findByUserId(session.user.id)
    : null;

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <DashboardPageHeader
        title="Company Registration Rejected"
        description="Your vendor application was not approved"
        className="mb-4"
      />
      {company?.rejectionNote && (
        <p className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
          {company.rejectionNote}
        </p>
      )}
      <p className="text-sm text-slate-500">
        Contact support if you believe this was a mistake.
      </p>
      <Link href="/contact" className="mt-6">
        <Button>Contact Support</Button>
      </Link>
    </div>
  );
}
