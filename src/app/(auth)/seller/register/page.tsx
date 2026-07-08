import type { Metadata } from "next";
import { settingsRepository } from "@/repositories/settings.repository";
import { getVendorDisplayPlans } from "@/lib/settings/pricing";
import { getRazorpayCredentials } from "@/lib/razorpay";
import SellerRegisterForm from "./seller-register-form";

export const metadata: Metadata = {
  title: "Register as a Seller | Genius Mart",
  description: "Create your seller account and publish your software.",
};

export default async function SellerRegisterPage() {
  await settingsRepository.seedDefaults();
  await settingsRepository.syncRazorpayFromEnv();
  const [plans, creds] = await Promise.all([
    settingsRepository.getPricingPlans(),
    getRazorpayCredentials(),
  ]);
  const pricingPlans = getVendorDisplayPlans(plans);
  const paymentConfigured = Boolean(creds.keyId && creds.keySecret);

  return (
    <SellerRegisterForm pricingPlans={pricingPlans} paymentConfigured={paymentConfigured} />
  );
}
