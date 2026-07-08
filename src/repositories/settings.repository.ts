import { prisma } from "@/lib/prisma";
import { mergePricingPlans } from "@/lib/settings/pricing";
import { ALL_DEFAULT_PRICING_PLANS, DEFAULT_PRICING_PLANS, DEFAULT_RAZORPAY, DEFAULT_SMTP, DEFAULT_GENERAL, type GeneralSettings, type PricingPlan, type RazorpaySettings, type SmtpSettings } from "@/lib/settings/defaults";

async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const row = await prisma.siteSetting.findUnique({ where: { key } });
  if (!row) return fallback;
  return row.value as T;
}

async function setSetting<T>(key: string, value: T) {
  return prisma.siteSetting.upsert({
    where: { key },
    create: { key, value: value as object },
    update: { value: value as object },
  });
}

export const settingsRepository = {
  async getPricingPlans(): Promise<PricingPlan[]> {
    const stored = await getSetting<PricingPlan[] | null>("pricing_plans", null);
    const merged = mergePricingPlans(stored ?? [], ALL_DEFAULT_PRICING_PLANS);
    const normalized = merged.map((plan) => ({ ...plan, active: plan.active ?? true }));

    const needsPersist =
      !stored ||
      stored.length !== normalized.length ||
      DEFAULT_PRICING_PLANS.some((def) => !stored.some((p) => p.id === def.id)) ||
      ALL_DEFAULT_PRICING_PLANS.some((def) => !stored.some((p) => p.id === def.id));

    if (needsPersist) {
      await setSetting("pricing_plans", normalized);
    }

    return normalized;
  },

  setPricingPlans(plans: PricingPlan[]) {
    return setSetting("pricing_plans", plans);
  },

  getSmtp(): Promise<SmtpSettings> {
    return getSetting("smtp", DEFAULT_SMTP);
  },

  setSmtp(smtp: SmtpSettings) {
    return setSetting("smtp", smtp);
  },

  getRazorpay(): Promise<RazorpaySettings> {
    return getSetting("razorpay", DEFAULT_RAZORPAY);
  },

  setRazorpay(razorpay: RazorpaySettings) {
    return setSetting("razorpay", razorpay);
  },

  async syncRazorpayFromEnv() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) return;

    const current = await getSetting("razorpay", DEFAULT_RAZORPAY);
    await setSetting("razorpay", {
      ...current,
      keyId,
      keySecret,
      webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || current.webhookSecret,
      registrationFee: Number(process.env.REGISTRATION_FEE ?? current.registrationFee ?? 4999),
    });
  },

  getGeneral(): Promise<GeneralSettings> {
    return getSetting("general", DEFAULT_GENERAL);
  },

  setGeneral(general: GeneralSettings) {
    return setSetting("general", general);
  },

  async seedDefaults() {
    const keys = ["pricing_plans", "smtp", "razorpay", "general"] as const;
    const existing = await prisma.siteSetting.count({
      where: { key: { in: [...keys] } },
    });
    if (existing > 0) return;

    await Promise.all([
      setSetting("pricing_plans", DEFAULT_PRICING_PLANS),
      setSetting("smtp", {
        ...DEFAULT_SMTP,
        apiKey: process.env.RESEND_API_KEY ?? "",
        fromEmail: process.env.RESEND_FROM_EMAIL ?? DEFAULT_SMTP.fromEmail,
      }),
      setSetting("razorpay", {
        ...DEFAULT_RAZORPAY,
        keyId: process.env.RAZORPAY_KEY_ID ?? "",
        keySecret: process.env.RAZORPAY_KEY_SECRET ?? "",
        webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET ?? "",
        registrationFee: Number(process.env.REGISTRATION_FEE ?? 4999),
      }),
      setSetting("general", DEFAULT_GENERAL),
    ]);
  },
};

export async function getRegistrationFee(): Promise<number> {
  const razorpay = await settingsRepository.getRazorpay();
  return razorpay.registrationFee || Number(process.env.REGISTRATION_FEE ?? 4999);
}

export async function getSupportEmail(): Promise<string> {
  const general = await settingsRepository.getGeneral();
  return general.supportEmail || DEFAULT_GENERAL.supportEmail;
}
