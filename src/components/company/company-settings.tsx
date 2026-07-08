"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Building2,
  CreditCard,
  Globe,
  Mail,
  Phone,
  Save,
  Settings2,
  UserCircle,
  Calendar,
  type LucideIcon,
} from "lucide-react";
import { companyProfileSchema } from "@/lib/validations";
import { getValidatedForm, parseFormWithSchema } from "@/lib/validations/form-submit";
import { saveCompanyProfile } from "@/actions/company.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmailInput } from "@/components/ui/email-input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "@/components/forms/image-upload-field";
import { useFormPrefill } from "@/hooks/use-form-prefill";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { FORM_AUTOCOMPLETE } from "@/lib/form-prefill";
import { cn } from "@/lib/utils";

export function CompanyProfileSettingsForm({
  defaultValues,
}: {
  defaultValues: {
    name: string;
    website: string;
    description: string;
    industry: string;
    contactEmail: string;
    contactPhone: string;
    logo: string;
    ownerName?: string;
  };
}) {
  const router = useRouter();
  const { confirm, confirmDialog } = useConfirmDialog();
  const { ready, bind, clearDraft, setField } = useFormPrefill("company-settings-profile", defaultValues);
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState(defaultValues.logo ?? "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = getValidatedForm(e);
    if (!form) return;

    const ok = await confirm({
      title: "Save profile changes?",
      description: "Your company name, contact details, and branding will be updated on the marketplace.",
      confirmLabel: "Save profile",
      variant: "default",
    });
    if (!ok) return;

    setLoading(true);
    const formData = new FormData(form);
    if (logoUrl) formData.set("logo", logoUrl);

    const parsed = parseFormWithSchema(companyProfileSchema, formData);
    if (!parsed.success) {
      toast.error(parsed.error);
      setLoading(false);
      return;
    }

    const result = await saveCompanyProfile(formData);
    setLoading(false);

    if (result && "error" in result) {
      toast.error(result.error);
      return;
    }

    clearDraft();
    toast.success("Profile updated");
    router.refresh();
  }

  if (!ready) return null;

  return (
    <form onSubmit={handleSubmit} className="company-profile-form space-y-4">
      {confirmDialog}
      <div className="company-profile-brand relative overflow-hidden rounded-xl border border-brand-blue/15 bg-gradient-to-br from-brand-blue/5 to-transparent p-4 sm:flex sm:items-center sm:gap-4">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-md ring-2 ring-white/60">
          {logoUrl ? (
            <Image src={logoUrl} alt="Company logo" width={64} height={64} className="h-full w-full object-cover" />
          ) : (
            <Building2 className="h-8 w-8 text-brand-blue/50" />
          )}
        </div>
        <div className="relative mt-3 min-w-0 flex-1 text-center sm:mt-0 sm:text-left">
          <p className="text-[10px] font-bold uppercase tracking-widest text-brand-blue/70">Brand identity</p>
          <h3 className="font-heading text-lg font-bold text-slate-900">{defaultValues.name}</h3>
          {defaultValues.ownerName ? (
            <p className="mt-2 flex items-center justify-center gap-1.5 text-sm font-medium text-slate-500 sm:justify-start">
              <UserCircle className="h-4 w-4 text-slate-400" />
              {defaultValues.ownerName}
            </p>
          ) : null}
        </div>
      </div>

      <ImageUploadField
        label="Company logo"
        uploadFolder="companies"
        value={logoUrl}
        onChange={(url) => {
          setLogoUrl(url);
          setField("logo", url);
        }}
        inputName="logo"
        hint="Square logo works best — JPG, PNG, or WebP up to 4 MB"
      />

      <div className="grid gap-3 sm:grid-cols-2 rounded-xl border border-slate-100 bg-slate-50/80 p-4">
        <div className="sm:col-span-2">
          <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 inline-block">Company Name</Label>
          <Input {...bind("name")} required autoComplete={FORM_AUTOCOMPLETE.organization} className="h-11 rounded-xl bg-slate-50" />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="website" className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Globe className="h-3.5 w-3.5" />
            Website URL
          </Label>
          <Input {...bind("website")} type="url" autoComplete={FORM_AUTOCOMPLETE.url} className="h-11 rounded-xl bg-slate-50" />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 inline-block">Company Description</Label>
          <Textarea {...bind("description")} required rows={4} className="rounded-xl bg-slate-50 resize-none" />
        </div>
        <div>
          <Label htmlFor="industry" className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 inline-block">Industry / Niche</Label>
          <Input {...bind("industry")} required className="h-11 rounded-xl bg-slate-50" />
        </div>
        <div>
          <Label htmlFor="contactEmail" className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Mail className="h-3.5 w-3.5" />
            Support Email
          </Label>
          <EmailInput
            {...bind("contactEmail")}
            id="contactEmail"
            required
            autoComplete={FORM_AUTOCOMPLETE.email}
            className="h-11 rounded-xl bg-slate-50"
          />
          <p className="mt-1 text-[11px] text-slate-400">Must start with a lowercase letter.</p>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="contactPhone" className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Phone className="h-3.5 w-3.5" />
            Support Phone
          </Label>
          <PhoneInput
            {...bind("contactPhone")}
            id="contactPhone"
            required
            placeholder="9876543210"
            autoComplete={FORM_AUTOCOMPLETE.tel}
            className="h-11 rounded-xl bg-slate-50"
          />
          <p className="mt-1 text-[11px] text-slate-400">Enter a 10-digit mobile number.</p>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="gap-2">
        <Save className="h-4 w-4" />
        {loading ? "Saving..." : "Save profile changes"}
      </Button>
    </form >
  );
}

type SettingsIconName = "settings" | "credit-card" | "calendar";

const SECTION_ICONS: Record<SettingsIconName, LucideIcon> = {
  settings: Settings2,
  "credit-card": CreditCard,
  calendar: Calendar,
};

export function SettingsSection({
  title,
  description,
  iconName,
  children,
  className,
}: {
  title: string;
  description?: string;
  iconName: SettingsIconName;
  children: React.ReactNode;
  className?: string;
}) {
  const Icon = SECTION_ICONS[iconName];
  return (
    <section
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white/70 p-6 shadow-sm backdrop-blur-sm transition-all hover:border-brand-blue/30 hover:shadow-md hover:bg-white",
        className,
      )}
    >
      <div className="absolute -left-6 -top-6 h-24 w-24 rounded-full bg-brand-blue/5 blur-2xl group-hover:bg-brand-blue/10 transition-all z-0"></div>
      <div className="relative z-10 mb-6 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-blue/10 to-brand-blue/5 text-brand-blue shadow-inner group-hover:scale-110 transition-transform duration-300">
          <Icon className="h-6 w-6" />
        </div>
        <div className="pt-1">
          <h2 className="font-heading text-lg font-bold text-slate-800 tracking-tight">{title}</h2>
          {description ? <p className="mt-1 text-sm font-medium text-slate-500 leading-relaxed max-w-xl">{description}</p> : null}
        </div>
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </section>
  );
}
