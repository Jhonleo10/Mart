import { settingsRepository } from "@/repositories/settings.repository";
import { AdminPageHeader } from "@/components/admin/kanban-card";
import { SettingsAdminForm } from "@/components/admin/settings-admin-form";
import {
  toRazorpaySettingsPublic,
  toSmtpSettingsPublic,
} from "@/lib/settings/mask-secrets";

export default async function AdminSettingsPage() {
  await settingsRepository.seedDefaults();
  const [smtp, razorpay, general] = await Promise.all([
    settingsRepository.getSmtp(),
    settingsRepository.getRazorpay(),
    settingsRepository.getGeneral(),
  ]);

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
