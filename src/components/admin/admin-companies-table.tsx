"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { ApproveCompanyButton } from "@/components/admin/approve-company-button";
import { CompanyActiveToggle } from "@/components/admin/company-active-toggle";
import { RequestChangesButton } from "@/components/admin/request-changes-button";
import { RejectCompanyButton } from "@/components/admin/reject-company-button";
import {
  CompanyAvatar,
  CompanyDetailModal,
  type AdminCompanyRow,
} from "@/components/admin/company-detail-modal";
import { AdminMetricCell } from "@/components/admin/admin-metric-cell";
import { VendorHealthMeter } from "@/components/admin/vendor-health-badge";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function AdminCompaniesTable({ companies }: { companies: AdminCompanyRow[] }) {
  const [selected, setSelected] = useState<AdminCompanyRow | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  function openDetails(company: AdminCompanyRow) {
    setSelected(company);
    setModalOpen(true);
  }

  return (
    <>
      <table className="admin-table admin-table-premium admin-table-companies admin-table-companies-v2">
        <thead>
          <tr>
            <th className="w-[2rem] text-center">Profile</th>
            <th>Company</th>
            <th className="hidden md:table-cell">Owner</th>
            <th className="text-center">Products</th>
            <th className="text-center hidden sm:table-cell">Leads</th>
            <th className="text-center hidden lg:table-cell">Health</th>
            <th className="text-center">Status</th>
            <th className="min-w-0 text-center lg:min-w-[12rem]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr key={company.id} className="admin-table-row admin-table-row-premium">
              <td className="text-center align-middle">
                <div className="admin-avatar-ring mx-auto inline-flex">
                  <CompanyAvatar name={company.name} logo={company.logo} size="lg" />
                </div>
              </td>
              <td className="align-middle">
                <p className="font-heading truncate text-sm font-bold text-slate-900">{company.name}</p>
                <p className="truncate text-xs text-slate-500 md:hidden">
                  {company.owner.name ?? company.ownerName ?? "—"}
                </p>
              </td>
              <td className="align-middle hidden md:table-cell">
                <p className="truncate text-sm font-medium text-slate-700">
                  {company.owner.name ?? company.ownerName ?? "—"}
                </p>
              </td>
              <td className="align-middle text-center">
                <AdminMetricCell value={company.productCount} tone="blue" />
              </td>
              <td className="align-middle text-center hidden sm:table-cell">
                <AdminMetricCell value={company.leadCount} tone="green" />
              </td>
              <td className="align-middle text-center hidden lg:table-cell">
                {company.healthScore != null && company.healthLabel ? (
                  <div className="flex justify-center">
                    <VendorHealthMeter score={company.healthScore} label={company.healthLabel} size="sm" />
                  </div>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </td>
              <td className="align-middle text-center">
                <div className="flex justify-center">
                  <StatusBadge status={company.status} />
                </div>
              </td>
              <td className="align-middle">
                <div className="admin-row-actions admin-row-actions-premium admin-row-actions-centered">
                  {(company.status === "APPROVED" || company.status === "SUSPENDED") && (
                    <CompanyActiveToggle companyId={company.id} active={company.status === "APPROVED"} />
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="admin-view-btn gap-2.5"
                    onClick={() => openDetails(company)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">View</span>
                  </Button>
                  {company.status === "PENDING" && (
                    <>
                      <ApproveCompanyButton companyId={company.id} />
                      <RejectCompanyButton companyId={company.id} />
                      <RequestChangesButton companyId={company.id} compact />
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <CompanyDetailModal company={selected} open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
