import type { CompanyStatus, SubscriptionPlan } from "@prisma/client";

export interface VendorHealthInput {
  status: CompanyStatus;
  description: string | null;
  logo: string | null;
  website: string | null;
  landingEnabled: boolean | null;
  publishedLandingCount?: number;
  productCount: number;
  publishedCount: number;
  leadCount: number;
  contactedLeadCount: number;
  hasAvailability: boolean;
  plan: SubscriptionPlan | null;
}

export interface VendorHealthScore {
  score: number;
  label: "Excellent" | "Good" | "Fair" | "Needs attention";
  factors: { label: string; ok: boolean; weight: number }[];
}

export function computeVendorHealthScore(input: VendorHealthInput): VendorHealthScore {
  const factors = [
    { label: "Approved & active", ok: input.status === "APPROVED", weight: 20 },
    { label: "Profile complete", ok: Boolean(input.description && input.logo), weight: 15 },
    { label: "Website listed", ok: Boolean(input.website), weight: 5 },
    { label: "Published products", ok: input.publishedCount > 0, weight: 25 },
    { label: "Demo slots open", ok: input.hasAvailability, weight: 20 },
    {
      label: "Lead response",
      ok: input.leadCount === 0 || input.contactedLeadCount / input.leadCount >= 0.5,
      weight: 15,
    },
  ];

  const score = Math.round(
    factors.reduce((sum, f) => sum + (f.ok ? f.weight : 0), 0),
  );

  let label: VendorHealthScore["label"] = "Needs attention";
  if (score >= 85) label = "Excellent";
  else if (score >= 65) label = "Good";
  else if (score >= 45) label = "Fair";

  return { score, label, factors };
}

export function healthScoreColor(score: number): string {
  if (score >= 85) return "text-brand-green";
  if (score >= 65) return "text-brand-blue";
  if (score >= 45) return "text-amber-600";
  return "text-red-500";
}

export function healthScoreBg(score: number): string {
  if (score >= 85) return "bg-brand-green/15";
  if (score >= 65) return "bg-brand-blue/15";
  if (score >= 45) return "bg-amber-100";
  return "bg-red-100";
}
