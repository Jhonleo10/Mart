import { BRAND } from "@/lib/brand";

export type EmailBranding = {
  siteName: string;
  supportEmail: string;
  tagline: string;
  website: string;
  logoUrl: string;
};

const defaults: EmailBranding = {
  siteName: BRAND.name,
  supportEmail: BRAND.contactEmail,
  tagline: BRAND.tagline,
  website: BRAND.website,
  logoUrl: "",
};

let activeBranding: EmailBranding = { ...defaults };

export function setEmailBranding(branding: Partial<EmailBranding>) {
  activeBranding = { ...defaults, ...branding };
}

export function getEmailBranding(): EmailBranding {
  return activeBranding;
}

export function resetEmailBranding() {
  activeBranding = { ...defaults };
}
