import { cache } from "react";
import { BRAND } from "@/lib/brand";
import { getGeneralSettings } from "@/services/site-settings.service";
import { brandSiteConfig, type SiteConfig } from "@/lib/site-config.shared";

export type { SiteConfig } from "@/lib/site-config.shared";
export { getStaticSiteConfig, splitSiteName } from "@/lib/site-config.shared";

/** DB-backed site identity merged with static brand defaults (cached per request). */
export const getSiteConfig = cache(async (): Promise<SiteConfig> => {
  const general = await getGeneralSettings();
  const name = general.siteName?.trim() || BRAND.name;

  return brandSiteConfig({
    name,
    shortName: name,
    contactEmail: general.supportEmail?.trim() || BRAND.contactEmail,
    logoAlt: name,
  });
});
