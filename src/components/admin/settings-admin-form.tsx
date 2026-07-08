"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, CreditCard, Settings2 } from "lucide-react";
import {
  saveGeneralSettings,
  saveRazorpaySettings,
  saveSmtpSettings,
} from "@/actions/settings.actions";
import type { GeneralSettingsPublic, RazorpaySettingsPublic, SmtpSettingsPublic } from "@/lib/settings/mask-secrets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmailInput } from "@/components/ui/email-input";
import { Label } from "@/components/ui/label";
import { EMAIL_HINT } from "@/lib/validations/fields";
import { normalizeEmailInput } from "@/lib/validations/email-phone";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "general", label: "General", icon: Settings2 },
  { id: "email", label: "Email", icon: Mail },
  { id: "payments", label: "Payments", icon: CreditCard },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function SettingsAdminForm({
  smtp: initialSmtp,
  razorpay: initialRazorpay,
  general: initialGeneral,
}: {
  smtp: SmtpSettingsPublic;
  razorpay: RazorpaySettingsPublic;
  general: GeneralSettingsPublic;
}) {
  const router = useRouter();
  const { confirm, confirmDialog } = useConfirmDialog();
  const [tab, setTab] = useState<TabId>("general");
  const [smtp, setSmtp] = useState(initialSmtp);
  const [razorpay, setRazorpay] = useState(initialRazorpay);
  const [general, setGeneral] = useState(initialGeneral);
  const [smtpApiKey, setSmtpApiKey] = useState("");
  const [razorpayKeySecret, setRazorpayKeySecret] = useState("");
  const [razorpayWebhookSecret, setRazorpayWebhookSecret] = useState("");
  const [saving, setSaving] = useState<"smtp" | "razorpay" | "general" | null>(null);

  async function handleSaveSmtp() {
    const ok = await confirm({
      title: "Save email settings?",
      description: "SMTP and Resend credentials will be updated for all transactional emails.",
      confirmLabel: "Save email settings",
      variant: "warning",
    });
    if (!ok) return;

    setSaving("smtp");
    const result = await saveSmtpSettings({
      fromEmail: smtp.fromEmail,
      ...(smtpApiKey.trim() ? { apiKey: smtpApiKey.trim() } : {}),
    });
    setSaving(null);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("SMTP settings saved");
    setSmtpApiKey("");
    router.refresh();
  }

  async function handleSaveRazorpay() {
    const ok = await confirm({
      title: "Save payment settings?",
      description: "Razorpay API keys and registration fee will be updated for vendor payments.",
      confirmLabel: "Save payment settings",
      variant: "warning",
    });
    if (!ok) return;

    setSaving("razorpay");
    const result = await saveRazorpaySettings({
      keyId: razorpay.keyId,
      registrationFee: razorpay.registrationFee,
      ...(razorpayKeySecret.trim() ? { keySecret: razorpayKeySecret.trim() } : {}),
      ...(razorpayWebhookSecret.trim() ? { webhookSecret: razorpayWebhookSecret.trim() } : {}),
    });
    setSaving(null);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("Razorpay settings saved");
    setRazorpayKeySecret("");
    setRazorpayWebhookSecret("");
    router.refresh();
  }

  async function handleSaveGeneral() {
    const ok = await confirm({
      title: "Save general settings?",
      description: "Site name and support contact will be updated across the platform.",
      confirmLabel: "Save settings",
      variant: "default",
    });
    if (!ok) return;

    setSaving("general");
    const result = await saveGeneralSettings(general);
    setSaving(null);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    toast.success("General settings saved");
    router.refresh();
  }

  return (
    <div className="admin-settings-tabs">
      {confirmDialog}
      <div className="admin-tab-list" role="tablist" aria-label="Settings sections">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn("admin-tab-trigger", tab === id && "admin-tab-trigger-active")}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="admin-tab-panel dash-panel mt-4 p-4 sm:p-6">
        {tab === "general" && (
          <div className="space-y-4">
            <div>
              <h2 className="font-heading text-lg font-semibold text-slate-900">General</h2>
              <p className="mt-1 text-sm text-slate-500">
                Site name and support email update across headers, footers, emails, and page titles after save.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Site name</Label>
                <Input
                  value={general.siteName}
                  onChange={(e) => setGeneral({ ...general, siteName: e.target.value })}
                />
              </div>
              <div>
                <Label>Support email</Label>
                <EmailInput
                  value={general.supportEmail}
                  onChange={(e) => setGeneral({ ...general, supportEmail: e.target.value })}
                  onBlur={(e) =>
                    setGeneral({ ...general, supportEmail: normalizeEmailInput(e.target.value) })
                  }
                />
                <p className="mt-1 text-[11px] text-slate-400">{EMAIL_HINT}</p>
              </div>
            </div>
            <Button onClick={handleSaveGeneral} disabled={saving === "general"}>
              {saving === "general" ? "Saving..." : "Save general settings"}
            </Button>
          </div>
        )}

        {tab === "email" && (
          <div className="space-y-4">
            <div>
              <h2 className="font-heading text-lg font-semibold text-slate-900">Email (Resend / SMTP)</h2>
              <p className="mt-1 text-sm text-slate-500">Transactional email delivery</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>API key</Label>
                <Input
                  type="password"
                  value={smtpApiKey}
                  onChange={(e) => setSmtpApiKey(e.target.value)}
                  placeholder={smtp.hasApiKey ? "Leave blank to keep existing key" : "re_..."}
                  autoComplete="new-password"
                />
              </div>
              <div>
                <Label>From email</Label>
                <Input
                  value={smtp.fromEmail}
                  onChange={(e) => setSmtp({ ...smtp, fromEmail: e.target.value })}
                  placeholder="Genius Mart <noreply@...>"
                />
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Env vars <code className="rounded bg-slate-100 px-1">SMTP_*</code> override DB settings when set.
              API keys are stored server-side only.
            </p>
            <Button onClick={handleSaveSmtp} disabled={saving === "smtp"}>
              {saving === "smtp" ? "Saving..." : "Save email settings"}
            </Button>
          </div>
        )}

        {tab === "payments" && (
          <div className="space-y-4">
            <div>
              <h2 className="font-heading text-lg font-semibold text-slate-900">Razorpay</h2>
              <p className="mt-1 text-sm text-slate-500">Payment gateway for seller registration & upgrades</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Key ID</Label>
                <Input
                  value={razorpay.keyId}
                  onChange={(e) => setRazorpay({ ...razorpay, keyId: e.target.value })}
                  placeholder="rzp_test_..."
                />
              </div>
              <div>
                <Label>Key secret</Label>
                <Input
                  type="password"
                  value={razorpayKeySecret}
                  onChange={(e) => setRazorpayKeySecret(e.target.value)}
                  placeholder={razorpay.hasKeySecret ? "Leave blank to keep existing secret" : "Enter key secret"}
                  autoComplete="new-password"
                />
              </div>
              <div>
                <Label>Webhook secret</Label>
                <Input
                  type="password"
                  value={razorpayWebhookSecret}
                  onChange={(e) => setRazorpayWebhookSecret(e.target.value)}
                  placeholder={
                    razorpay.hasWebhookSecret ? "Leave blank to keep existing secret" : "Enter webhook secret"
                  }
                  autoComplete="new-password"
                />
              </div>
              <div>
                <Label>Registration fee (INR)</Label>
                <Input
                  type="number"
                  value={razorpay.registrationFee}
                  onChange={(e) =>
                    setRazorpay({ ...razorpay, registrationFee: Number(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Payment secrets are stored server-side only and never sent to the browser.
            </p>
            <Button onClick={handleSaveRazorpay} disabled={saving === "razorpay"}>
              {saving === "razorpay" ? "Saving..." : "Save Razorpay settings"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
