import { settingsRepository } from "@/repositories/settings.repository";
import { AdminPageHeader } from "@/components/admin/kanban-card";
import { SettingsAdminForm } from "@/components/admin/settings-admin-form";
import {
  toRazorpaySettingsPublic,
  toSmtpSettingsPublic,
} from "@/lib/settings/mask-secrets";
import { requireDbQuery } from "@/lib/db/safe-query";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [smtp, razorpay, general] = await requireDbQuery("adminSettings", () =>
    Promise.all([
      settingsRepository.getSmtp(),
      settingsRepository.getRazorpay(),
      settingsRepository.getGeneral(),
    ]),
  );

  return (
    <div className="admin-page dash-page-enter space-y-5">
      <AdminPageHeader
        title="Settings"
        description="Configure email, payments, and general platform settings"
      />
      <SettingsAdminForm
        smtp={toSmtpSettingsPublic(smtp)}
        razorpay={toRazorpaySettingsPublic(razorpay)}
        general={general}
      />
    </div>
  );
}
