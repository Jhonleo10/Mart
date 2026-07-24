import type { Metadata } from "next";
import { getPricingPlansForDisplay } from "@/services/site-settings.service";
import { getVendorDisplayPlans } from "@/lib/settings/pricing";
import { getRazorpayCredentialsFromEnv } from "@/lib/razorpay";
import SellerRegisterForm from "./seller-register-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Register as a Vendor | Genius Mart",
  description: "Create your vendor account and publish your software.",
};

export default async function SellerRegisterPage() {
  const [plans, creds] = await Promise.all([
    getPricingPlansForDisplay(),
    Promise.resolve(getRazorpayCredentialsFromEnv()),
  ]);
  const pricingPlans = getVendorDisplayPlans(plans);
  const paymentConfigured = Boolean(creds.keyId && creds.keySecret);

  return (
    <SellerRegisterForm pricingPlans={pricingPlans} paymentConfigured={paymentConfigured} />
  );
}
