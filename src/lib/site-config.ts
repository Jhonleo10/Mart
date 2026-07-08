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

function brandSiteConfig(overrides?: Partial<SiteConfig>): SiteConfig {
  const name = overrides?.name?.trim() || BRAND.name;
  return {
    name,
    shortName: overrides?.shortName ?? name,
    contactEmail: overrides?.contactEmail ?? BRAND.contactEmail,
    logoSrc: overrides?.logoSrc ?? BRAND.logoSrc,
    logoAlt: overrides?.logoAlt ?? name,
    description: overrides?.description ?? BRAND.description,
    tagline: overrides?.tagline ?? BRAND.tagline,
    website: overrides?.website ?? BRAND.website,
    social: overrides?.social ?? BRAND.social,
  };
}

/** DB-backed site identity merged with static brand defaults (cached per request). */
export const getSiteConfig = cache(async (): Promise<SiteConfig> => {
  // Build/CI can run without a live DB — never fail page collection.
  if (!process.env.DATABASE_URL) {
    return brandSiteConfig();
  }

  try {
    const general = await settingsRepository.getGeneral();
    const name = general.siteName?.trim() || BRAND.name;

    return brandSiteConfig({
      name,
      shortName: name,
      contactEmail: general.supportEmail?.trim() || BRAND.contactEmail,
      logoAlt: name,
    });
  } catch (error) {
    console.warn("[getSiteConfig] Falling back to brand defaults:", error);
    return brandSiteConfig();
  }
});

export function splitSiteName(name: string): { lead: string; accent: string | null } {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { lead: name, accent: null };
  return { lead: parts[0]!, accent: parts.slice(1).join(" ") };
}
