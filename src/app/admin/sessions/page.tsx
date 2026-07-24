import { AdminPageHeader } from "@/components/admin/kanban-card";
import { AdminTableShell } from "@/components/admin/admin-table-shell";
import { DashboardEmptyState } from "@/components/dashboard/dashboard-empty-state";
import { formatDate } from "@/lib/utils";
import { userSessionService } from "@/services/user-session.service";
import { AdminSessionLogoutButton } from "@/components/admin/admin-session-logout-button";
import { Shield } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSessionsPage() {
  const sessions = await userSessionService.listActiveSessions();

  return (
    <div className="admin-page dash-page-enter space-y-5">
      <AdminPageHeader
        title="Active Sessions"
        description="Logged-in users across browsers and devices. Force logout revokes server-side access immediately."
      />

      <AdminTableShell title="Live sessions" description={`${sessions.length} active session(s)`}>
        {sessions.length === 0 ? (
          <DashboardEmptyState
            icon={Shield}
            title="No active sessions"
            description="No users are currently logged in."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr>
                  <th scope="col">User</th>
                  <th scope="col">Role</th>
                  <th scope="col">Device</th>
                  <th scope="col">Browser</th>
                  <th scope="col">IP</th>
                  <th scope="col">Login</th>
                  <th scope="col">Last activity</th>
                  <th scope="col">Expires</th>
                  <th scope="col" />
                </tr>
              </thead>
              <tbody>
                {sessions.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div className="font-medium text-slate-900">{row.user.name ?? "—"}</div>
                      <div className="text-xs text-slate-500">{row.user.email}</div>
                    </td>
                    <td>{row.user.role}</td>
                    <td>
                      {[row.deviceName, row.operatingSystem].filter(Boolean).join(" · ") || "—"}
                    </td>
                    <td>{row.browser ?? "—"}</td>
                    <td className="font-mono text-xs">{row.ipAddress ?? "—"}</td>
                    <td>{formatDate(row.createdAt)}</td>
                    <td>{formatDate(row.lastActivity)}</td>
                    <td>{formatDate(row.expiresAt)}</td>
                    <td>
                      <AdminSessionLogoutButton sessionId={row.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminTableShell>
    </div>
  );
}
