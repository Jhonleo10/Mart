"use client";

import { useState } from "react";
import { toast } from "sonner";
import { contactVendor } from "@/actions/lead.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmailInput } from "@/components/ui/email-input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { FIELD_LIMITS, EMAIL_HINT, PHONE_HINT } from "@/lib/validations/fields";
import { contactVendorSchema } from "@/lib/validations";
import { getValidatedForm, parseFormWithSchema } from "@/lib/validations/form-submit";

export function ContactVendorForm({ companyId }: { companyId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = getValidatedForm(e);
    if (!form) return;

    const formData = new FormData(form);
    formData.set("companyId", companyId);
    const parsed = parseFormWithSchema(contactVendorSchema, formData);
    if (!parsed.success) {
      toast.error(parsed.error);
      return;
    }

    setLoading(true);
    const result = await contactVendor(formData);
    setLoading(false);
    if ("error" in result && result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Message sent! The vendor will contact you soon.");
    form.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <h2 className="font-heading text-lg font-semibold text-slate-900">Contact Vendor</h2>
      <input type="hidden" name="companyId" value={companyId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-name">Name</Label>
          <Input
            id="contact-name"
            name="name"
            required
            minLength={FIELD_LIMITS.name.min}
            maxLength={FIELD_LIMITS.name.max}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-email">Email</Label>
          <EmailInput id="contact-email" name="email" required placeholder="you@company.com" />
          <p className="text-[11px] text-slate-400">{EMAIL_HINT}</p>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-phone">Phone</Label>
        <PhoneInput
          id="contact-phone"
          name="phone"
          required
          placeholder="9876543210"
        />
        <p className="text-[11px] text-slate-400">{PHONE_HINT}</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea
          id="contact-message"
          name="message"
          rows={4}
          required
          minLength={FIELD_LIMITS.contactMessage.min}
          maxLength={FIELD_LIMITS.contactMessage.max}
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Message"}
      </Button>
    </form>
  );
}
