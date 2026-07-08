import { cache } from "react";
import { unstable_cache } from "next/cache";
import { settingsRepository } from "@/repositories/settings.repository";
import {
  ALL_DEFAULT_PRICING_PLANS,
  DEFAULT_GENERAL,
  DEFAULT_RAZORPAY,
  DEFAULT_SMTP,
  type PricingPlan,
  type GeneralSettings,
  type RazorpaySettings,
  type SmtpSettings,
} from "@/lib/settings/defaults";
import { mergePricingPlans } from "@/lib/settings/pricing";
import { safeDbQuery } from "@/lib/db/safe-query";

function normalizePricingPlans(stored: PricingPlan[] | null): PricingPlan[] {
  const merged = mergePricingPlans(stored ?? [], ALL_DEFAULT_PRICING_PLANS);
  return merged.map((plan) => ({ ...plan, active: plan.active ?? true }));
}

const getCachedPricingPlans = unstable_cache(
  async () => {
    const stored = await settingsRepository.getPricingPlansRaw();
    return normalizePricingPlans(stored);
  },
  ["site-settings-pricing-plans"],
  { revalidate: 300, tags: ["site-settings", "pricing-plans"] },
);

const getCachedGeneral = unstable_cache(
  async () => settingsRepository.getGeneral(),
  ["site-settings-general"],
  { revalidate: 300, tags: ["site-settings", "general"] },
);

/** Read-only pricing plans for public pages — never writes to the database. */
export const getPricingPlansForDisplay = cache(async (): Promise<PricingPlan[]> => {
  return safeDbQuery("pricingPlansForDisplay", () => getCachedPricingPlans(), normalizePricingPlans(null));
});

export const getGeneralSettings = cache(async (): Promise<GeneralSettings> => {
  return safeDbQuery("generalSettings", () => getCachedGeneral(), DEFAULT_GENERAL);
});

export const getSmtpSettings = cache(async (): Promise<SmtpSettings> => {
  return safeDbQuery("smtpSettings", () => settingsRepository.getSmtp(), DEFAULT_SMTP);
});

export const getRazorpaySettings = cache(async (): Promise<RazorpaySettings> => {
  return safeDbQuery("razorpaySettings", () => settingsRepository.getRazorpay(), DEFAULT_RAZORPAY);
});
