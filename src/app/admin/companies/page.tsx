import { companyRepository } from "@/repositories/company.repository";
import { AdminCompaniesTable } from "@/components/admin/admin-companies-table";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminPageHeader } from "@/components/admin/kanban-card";
import { AdminPagination, ADMIN_PAGE_SIZE } from "@/components/admin/admin-pagination";
import { AdminTableShell } from "@/components/admin/admin-table-shell";
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";
import { getVendorHealthScores } from "@/lib/admin-vendor-health";
import { AdminTableExportButtons } from "@/components/admin/admin-table-export-buttons";
import { Building2 } from "lucide-react";
import type { CompanyStatus } from "@prisma/client";

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; industry?: string; page?: string }>;
}

export default async function AdminCompaniesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const status = params.status as CompanyStatus | undefined;
  const filterParams = { q: params.q, status: params.status, industry: params.industry };

  const [companies, total] = await companyRepository.list({
    page,
    limit: ADMIN_PAGE_SIZE,
    status: status || undefined,
    industry: params.industry,
    q: params.q,
  });

  const healthMap = await getVendorHealthScores(companies.map((c) => c.id));

  const rows = companies.map((c) => {
    const health = healthMap.get(c.id);
    return {
      id: c.id,
      slug: c.slug,
      name: c.name,
      ownerName: c.ownerName,
      logo: c.logo,
      contactEmail: c.contactEmail,
      contactPhone: c.contactPhone,
      status: c.status,
      productCount: c._count.products,
      leadCount: c._count.bookings,
      owner: { name: c.user.name, email: c.user.email },
      industry: c.industry,
      website: c.website,
      description: c.description,
      paymentVerified: c.paymentVerified,
      adminApproved: c.adminApproved,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      rejectionNote: c.rejectionNote,
      selectedPlan: c.selectedPlan,
      healthScore: health?.score ?? 0,
      healthLabel: health?.label ?? "Needs attention",
    };
  });

  return (
    <div className="admin-page dash-page-enter space-y-5">
      <AdminPageHeader
        title="Manage Companies"
        description="Review vendor registrations, approve companies, and manage marketplace access"
      />

      <AdminFilterBar
        compact
        basePath="/admin/companies"
        values={filterParams}
        resultCount={total}
        resultLabel="companies"
        fields={[
          {
            name: "q",
            type: "search",
            label: "Search",
            placeholder: "Search by name, email, or industry...",
          },
          {
            name: "status",
            type: "select",
            label: "Status",
            options: [
              { value: "PENDING", label: "Pending" },
              { value: "APPROVED", label: "Approved" },
              { value: "REJECTED", label: "Rejected" },
              { value: "SUSPENDED", label: "Suspended" },
            ],
          },
          {
            name: "industry",
            type: "search",
            label: "Industry",
            placeholder: "Filter by industry...",
          },
        ]}
      />

      <AdminTableShell
        title="Vendor directory"
        description="Profile, health scores, live toggles, and vendor insights at a glance"
        action={<AdminTableExportButtons entity="companies" searchParams={filterParams} />}
        isEmpty={companies.length === 0}
        empty={
          <DashboardEmptyState
            icon={Building2}
            title="No companies found"
            description="Try adjusting your search or status filters."
          />
        }
        footer={
          <AdminPagination
            total={total}
            page={page}
            basePath="/admin/companies"
            searchParams={filterParams}
          />
        }
      >
        <AdminCompaniesTable companies={rows} />
      </AdminTableShell>
    </div>
  );
}
