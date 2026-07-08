import type { GeneralSettings, RazorpaySettings, SmtpSettings } from "@/lib/settings/defaults";

/** Client-safe SMTP settings — secrets never leave the server. */
export interface SmtpSettingsPublic {
  fromEmail: string;
  hasApiKey: boolean;
}

/** Client-safe Razorpay settings — secrets never leave the server. */
export interface RazorpaySettingsPublic {
  keyId: string;
  registrationFee: number;
  hasKeySecret: boolean;
  hasWebhookSecret: boolean;
}

export function toSmtpSettingsPublic(smtp: SmtpSettings): SmtpSettingsPublic {
  return {
    fromEmail: smtp.fromEmail,
    hasApiKey: Boolean(smtp.apiKey?.trim()),
  };
}

export function toRazorpaySettingsPublic(razorpay: RazorpaySettings): RazorpaySettingsPublic {
  return {
    keyId: razorpay.keyId,
    registrationFee: razorpay.registrationFee,
    hasKeySecret: Boolean(razorpay.keySecret?.trim()),
    hasWebhookSecret: Boolean(razorpay.webhookSecret?.trim()),
  };
}

export type GeneralSettingsPublic = GeneralSettings;
