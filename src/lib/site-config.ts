import { cache } from "react";
import { BRAND } from "@/lib/brand";
import { settingsRepository } from "@/repositories/settings.repository";

export type SiteConfig = {
  name: string;
  shortName: string;
  contactEmail: string;
  logoSrc: string;
  logoAlt: string;
  description: string;
  tagline: string;
  website: string;
  social: typeof BRAND.social;
};

/** DB-backed site identity merged with static brand defaults (cached per request). */
export const getSiteConfig = cache(async (): Promise<SiteConfig> => {
  const general = await settingsRepository.getGeneral();
  const name = general.siteName?.trim() || BRAND.name;

  return {
    name,
    shortName: name,
    contactEmail: general.supportEmail?.trim() || BRAND.contactEmail,
    logoSrc: BRAND.logoSrc,
    logoAlt: name,
    description: BRAND.description,
    tagline: BRAND.tagline,
    website: BRAND.website,
    social: BRAND.social,
  };
});

export function splitSiteName(name: string): { lead: string; accent: string | null } {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { lead: name, accent: null };
  return { lead: parts[0]!, accent: parts.slice(1).join(" ") };
}
