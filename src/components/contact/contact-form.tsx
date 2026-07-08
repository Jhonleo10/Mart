"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmailInput } from "@/components/ui/email-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FIELD_LIMITS, EMAIL_HINT } from "@/lib/validations/fields";
import { contactFormSchema } from "@/lib/validations";
import { getValidatedForm, parseFormWithSchema } from "@/lib/validations/form-submit";
import { Loader2, Mail, MessageSquare, User } from "lucide-react";

export function ContactForm() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const form = getValidatedForm(e);
    if (!form) return;

    const formData = new FormData(form);
    const parsed = parseFormWithSchema(contactFormSchema, formData);
    if (!parsed.success) {
      toast.error(parsed.error);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: formData,
      });
      const result = (await res.json()) as { success?: boolean; error?: string };

      if (!res.ok || result.error) {
        toast.error(result.error ?? "Failed to send message");
        return;
      }

      toast.success("Message sent! We'll get back to you soon.");
      form.reset();
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="contact-name">Full Name</Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="contact-name"
              name="name"
              required
              minLength={FIELD_LIMITS.name.min}
              maxLength={FIELD_LIMITS.name.max}
              placeholder="Your name"
              className="pl-10"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="contact-email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <EmailInput
              id="contact-email"
              name="email"
              required
              placeholder="you@company.com"
              className="pl-10"
            />
          </div>
          <p className="text-[11px] text-slate-400">{EMAIL_HINT}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact-subject">Subject</Label>
        <Input
          id="contact-subject"
          name="subject"
          required
          minLength={FIELD_LIMITS.subject.min}
          maxLength={FIELD_LIMITS.subject.max}
          placeholder="How can we help?"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="contact-message">Message</Label>
        <div className="relative">
          <MessageSquare className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Textarea
            id="contact-message"
            name="message"
            required
            minLength={FIELD_LIMITS.contactMessage.min}
            maxLength={FIELD_LIMITS.contactMessage.max}
            rows={5}
            placeholder="Tell us about your enquiry..."
            className="min-h-[120px] resize-y pl-10"
          />
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full sm:w-auto" size="lg">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          "Send Message"
        )}
      </Button>
    </form>
  );
}
