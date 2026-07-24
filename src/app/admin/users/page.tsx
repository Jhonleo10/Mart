import { userRepository } from "@/repositories/user.repository";
import { AdminFilterBar } from "@/components/admin/admin-filter-bar";
import { AdminPageHeader } from "@/components/admin/kanban-card";
import { AdminPagination, ADMIN_PAGE_SIZE } from "@/components/admin/admin-pagination";
import { AdminTableShell } from "@/components/admin/admin-table-shell";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";
import { formatDate } from "@/lib/utils";
import { AdminTableExportButtons } from "@/components/admin/admin-table-export-buttons";
import { Users } from "lucide-react";
import type { Role, UserStatus } from "@prisma/client";

interface PageProps {
  searchParams: Promise<{ q?: string; role?: string; status?: string; page?: string }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page ?? 1);
  const role = params.role as Role | undefined;
  const status = params.status as UserStatus | undefined;
  const filterParams = { q: params.q, role: params.role, status: params.status };

  const [users, total] = await userRepository.list({
    page,
    limit: ADMIN_PAGE_SIZE,
    role: role || undefined,
    status: status || undefined,
    q: params.q,
  });

  return (
    <div className="admin-page dash-page-enter space-y-5">
      <AdminPageHeader title="Manage Users" description="View and filter all platform users and roles" />

      <AdminFilterBar
        compact
        basePath="/admin/users"
        values={filterParams}
        resultCount={total}
        resultLabel="users"
        fields={[
          {
            name: "q",
            type: "search",
            label: "Search",
            placeholder: "Search by name or email...",
          },
          {
            name: "role",
            type: "select",
            label: "Role",
            options: [
              { value: "USER", label: "User" },
              { value: "COMPANY", label: "Company" },
              { value: "ADMIN", label: "Admin" },
            ],
          },
          {
            name: "status",
            type: "select",
            label: "Status",
            options: [
              { value: "ACTIVE", label: "Active" },
              { value: "INACTIVE", label: "Inactive" },
              { value: "SUSPENDED", label: "Suspended" },
            ],
          },
        ]}
      />

      <AdminTableShell
        title="User directory"
        description="Buyers, vendors, and administrators on the platform"
        action={<AdminTableExportButtons entity="users" searchParams={filterParams} />}
        isEmpty={users.length === 0}
        empty={
          <DashboardEmptyState
            icon={Users}
            title="No users found"
            description="Try adjusting your search or filters."
          />
        }
        footer={
          <AdminPagination total={total} page={page} basePath="/admin/users" searchParams={filterParams} />
        }
      >
        <table className="admin-table admin-table-premium">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Role</th>
              <th scope="col">Status</th>
              <th scope="col">Company</th>
              <th scope="col">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="admin-table-row admin-table-row-premium">
                <td className="font-semibold text-slate-900">{user.name ?? "—"}</td>
                <td className="max-w-[220px] truncate text-slate-600">{user.email}</td>
                <td>
                  <Badge variant="secondary">{user.role}</Badge>
                </td>
                <td>
                  <StatusBadge status={user.status} />
                </td>
                <td className="max-w-[160px] truncate text-slate-600">
                  {user.company?.name ?? "—"}
                </td>
                <td className="whitespace-nowrap text-slate-600">{formatDate(user.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTableShell>
    </div>
  );
}
