import { BRAND } from "@/lib/brand";

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

/** Static brand config for build-time metadata — never touches the database. */
export function getStaticSiteConfig(): SiteConfig {
  return brandSiteConfig();
}

export function splitSiteName(name: string): { lead: string; accent: string | null } {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { lead: name, accent: null };
  return { lead: parts[0]!, accent: parts.slice(1).join(" ") };
}

export { brandSiteConfig };
