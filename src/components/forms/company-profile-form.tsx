"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { saveCompanyProfile } from "@/actions/company.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmailInput } from "@/components/ui/email-input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploadField } from "@/components/forms/image-upload-field";
import { useFormPrefill } from "@/hooks/use-form-prefill";
import { FORM_AUTOCOMPLETE } from "@/lib/form-prefill";
import { FIELD_LIMITS, EMAIL_HINT, PHONE_HINT } from "@/lib/validations/fields";
import { companyProfileSchema } from "@/lib/validations";
import { getValidatedForm, parseFormWithSchema } from "@/lib/validations/form-submit";

export function CompanyProfileForm({
  defaultValues,
  redirectToPayment = false,
}: {
  redirectToPayment?: boolean;
  defaultValues?: {
    name?: string;
    website?: string;
    description?: string;
    industry?: string;
    contactEmail?: string;
    contactPhone?: string;
    logo?: string;
  };
}) {
  const router = useRouter();
  const { ready, bind, clearDraft, setField } = useFormPrefill("company-profile", defaultValues);
  const [loading, setLoading] = useState(false);
  const [logoUrl, setLogoUrl] = useState(defaultValues?.logo ?? "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = getValidatedForm(e);
    if (!form) return;

    const formData = new FormData(form);
    if (logoUrl) formData.set("logo", logoUrl);

    const parsed = parseFormWithSchema(companyProfileSchema, formData);
    if (!parsed.success) {
      toast.error(parsed.error);
      return;
    }

    setLoading(true);
    const result = await saveCompanyProfile(formData);
    setLoading(false);

    if (result && "error" in result) {
      toast.error(result.error);
      return;
    }

    clearDraft();
    toast.success("Profile saved!");
    router.push(redirectToPayment ? "/company/settings" : "/company/dashboard");
    router.refresh();
  }

  function handleLogoChange(url: string) {
    setLogoUrl(url);
    setField("logo", url);
  }

  if (!ready) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ImageUploadField
            label="Company Logo"
            uploadFolder="companies"
            value={logoUrl}
            onChange={handleLogoChange}
            inputName="logo"
            hint="JPG, PNG, or WebP up to 4 MB — saved to public/uploads/companies"
          />

          <div>
            <Label htmlFor="name">Company Name</Label>
            <Input {...bind("name")} required minLength={FIELD_LIMITS.companyName.min} maxLength={FIELD_LIMITS.companyName.max} autoComplete={FORM_AUTOCOMPLETE.organization} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input {...bind("website")} type="url" autoComplete={FORM_AUTOCOMPLETE.url} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea {...bind("description")} required minLength={FIELD_LIMITS.description.min} maxLength={FIELD_LIMITS.description.max} rows={4} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="industry">Industry</Label>
            <Input {...bind("industry")} required minLength={FIELD_LIMITS.industry.min} maxLength={FIELD_LIMITS.industry.max} className="mt-1" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <EmailInput
                {...bind("contactEmail")}
                id="contactEmail"
                required
                autoComplete={FORM_AUTOCOMPLETE.email}
                className="mt-1"
              />
              <p className="mt-1 text-[11px] text-slate-400">{EMAIL_HINT}</p>
            </div>
            <div>
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <PhoneInput
                {...bind("contactPhone")}
                id="contactPhone"
                required
                placeholder="9876543210"
                autoComplete={FORM_AUTOCOMPLETE.tel}
                className="mt-1"
              />
              <p className="mt-1 text-[11px] text-slate-400">{PHONE_HINT}</p>
            </div>
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : redirectToPayment ? "Save & Continue to Payment" : "Save Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
