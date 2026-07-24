import { paymentRepository } from "@/repositories/payment.repository";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminPageHeader } from "@/components/admin/kanban-card";
import { AdminPagination, ADMIN_PAGE_SIZE } from "@/components/admin/admin-pagination";
import { AdminTableShell } from "@/components/admin/admin-table-shell";
import { DashboardStatCard } from "@/components/dashboard/dashboard-stat-card";
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";
import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AdminTableExportButtons } from "@/components/admin/admin-table-export-buttons";
import { CreditCard, Wallet } from "lucide-react";
import type { PaymentStatus } from "@prisma/client";

interface PageProps {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function AdminPaymentsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const status = params.status as PaymentStatus | undefined;
  const filterParams = { status: params.status };

  const [payments, total] = await paymentRepository.adminList({
    page,
    limit: ADMIN_PAGE_SIZE,
    status: status || undefined,
  });

  const revenue = await paymentRepository.totalRevenue();

  return (
    <div className="admin-page dash-page-enter space-y-5">
      <AdminPageHeader
        title="Payments"
        description="Vendor subscription payments and platform revenue"
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DashboardStatCard
          title="Total revenue"
          value={formatCurrency(revenue._sum.amount ?? 0)}
          status="All completed payments"
          statusVariant="green"
          icon={<Wallet className="h-5 w-5" />}
          accent="green"
        />
        <DashboardStatCard
          title="Transactions"
          value={total}
          status="Matching current filters"
          statusVariant="muted"
          icon={<CreditCard className="h-5 w-5" />}
        />
      </div>

      <AdminFilterBar
        compact
        basePath="/admin/payments"
        values={filterParams}
        resultCount={total}
        resultLabel="payments"
        fields={[
          {
            name: "status",
            type: "select",
            label: "Status",
            options: [
              { value: "PENDING", label: "Pending" },
              { value: "COMPLETED", label: "Completed" },
              { value: "FAILED", label: "Failed" },
              { value: "REFUNDED", label: "Refunded" },
            ],
          },
        ]}
      />

      <AdminTableShell
        title="Payment ledger"
        description="Razorpay orders from vendor plan subscriptions"
        action={<AdminTableExportButtons entity="payments" searchParams={filterParams} />}
        isEmpty={payments.length === 0}
        empty={
          <DashboardEmptyState
            icon={CreditCard}
            title="No payments found"
            description="Try changing the status filter."
          />
        }
        footer={
          <AdminPagination
            total={total}
            page={page}
            basePath="/admin/payments"
            searchParams={filterParams}
          />
        }
      >
        <table className="admin-table admin-table-premium">
          <thead>
            <tr>
              <th scope="col">Company</th>
              <th scope="col">Type</th>
              <th scope="col">Amount</th>
              <th scope="col">Status</th>
              <th scope="col">Order ID</th>
              <th scope="col">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="admin-table-row admin-table-row-premium">
                <td className="font-semibold text-slate-900">{payment.company.name}</td>
                <td>
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {payment.type}
                  </span>
                </td>
                <td className="font-semibold tabular-nums text-slate-900">
                  {formatCurrency(payment.amount)}
                </td>
                <td>
                  <StatusBadge status={payment.status} />
                </td>
                <td className="max-w-[140px] truncate font-mono text-xs text-slate-500">
                  {payment.razorpayOrderId}
                </td>
                <td className="whitespace-nowrap text-slate-600">{formatDate(payment.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTableShell>
    </div>
  );
}
