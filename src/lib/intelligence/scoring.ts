import type { IntelligenceProduct, ScoreBreakdown, UserRequirements } from "@/lib/intelligence/types";
import { computeVendorTrustScore } from "@/lib/intelligence/vendor-trust";
import { normalizeToken } from "@/lib/intelligence/synonyms";

function tokenOverlap(required: string[], available: string[]): number {
  if (required.length === 0) return 70;
  const avail = available.map(normalizeToken);
  let hits = 0;
  for (const req of required) {
    const n = normalizeToken(req);
    if (avail.some((a) => a.includes(n) || n.includes(a))) hits++;
  }
  return Math.round((hits / required.length) * 100);
}

function budgetMatch(price: number | null, budgetMax?: number): number {
  if (!budgetMax) return 75;
  if (price == null) return 60;
  if (price <= budgetMax) return 100;
  const over = (price - budgetMax) / budgetMax;
  if (over <= 0.15) return 80;
  if (over <= 0.35) return 55;
  return 25;
}

function businessSizeMatch(req?: string, product?: IntelligenceProduct): number {
  if (!req) return 70;
  const sizes = (product?.businessSizes ?? []).map(normalizeToken);
  if (sizes.length === 0) return 62;
  const n = normalizeToken(req);
  if (sizes.some((s) => s.includes(n) || n.includes(s))) return 100;
  const bands: Record<string, string[]> = {
    solo: ["solo", "freelancer", "individual"],
    small: ["small", "smb", "startup", "1-50"],
    medium: ["medium", "mid", "51-500"],
    enterprise: ["enterprise", "large", "500"],
  };
  const aliases = bands[n] ?? [n];
  if (sizes.some((s) => aliases.some((a) => s.includes(a) || a.includes(s)))) return 88;
  return 38;
}

function industryMatch(req?: string, product?: IntelligenceProduct): number {
  if (!req) return 70;
  const n = normalizeToken(req);
  const industries =
    product?.industries?.map((i) => normalizeToken(i.industry.name)) ?? [];
  const companyIndustry = product?.company.industry
    ? normalizeToken(product.company.industry)
    : "";
  const category = normalizeToken(product?.category.name ?? "");
  const suitable = (product?.suitableFor ?? []).map(normalizeToken);

  if (industries.some((i) => i.includes(n) || n.includes(i))) return 100;
  if (companyIndustry.includes(n) || n.includes(companyIndustry)) return 90;
  if (category.includes(n)) return 85;
  if (suitable.some((s) => s.includes(n) || n.includes(s))) return 88;
  return 35;
}

function deploymentMatch(pref?: string, types: string[] = []): number {
  if (!pref || pref === "any") return 75;
  const n = normalizeToken(pref);
  if (types.length === 0) return 55;
  const normalized = types.map(normalizeToken);
  if (normalized.some((t) => t.includes(n) || n.includes(t))) return 100;
  if (n === "cloud" && normalized.some((t) => t.includes("saas"))) return 95;
  return 30;
}

function popularityScore(product: IntelligenceProduct): number {
  const views = product.viewCount;
  const clicks = product.clickCount;
  const raw = Math.log10(views + 1) * 25 + Math.log10(clicks + 1) * 15 + (product.featured ? 15 : 0);
  return Math.min(100, Math.round(raw));
}

function reviewScore(product: IntelligenceProduct): number {
  if (product.reviews.length === 0) return 45;
  const avg = product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length;
  const volumeBoost = Math.min(15, product.reviews.length * 1.5);
  return Math.min(100, Math.round((avg / 5) * 85 + volumeBoost));
}

const WEIGHTS = {
  industryMatch: 0.16,
  featureMatch: 0.2,
  budgetMatch: 0.14,
  businessSizeMatch: 0.08,
  popularityScore: 0.09,
  reviewScore: 0.13,
  vendorTrustScore: 0.11,
  integrationMatch: 0.05,
  deploymentMatch: 0.04,
};

export function computeScoreBreakdown(
  requirements: UserRequirements,
  product: IntelligenceProduct,
): ScoreBreakdown {
  const allFeatures = [
    ...product.features,
    ...product.securityFeatures,
    ...(product.hasApiAccess ? ["API"] : []),
    ...(product.hasMobileApp ? ["Mobile App"] : []),
  ];

  return {
    industryMatch: industryMatch(requirements.industry, product),
    featureMatch: tokenOverlap(requirements.requiredFeatures ?? [], allFeatures),
    budgetMatch: budgetMatch(product.price, requirements.budgetMax),
    businessSizeMatch: businessSizeMatch(requirements.businessSize, product),
    popularityScore: popularityScore(product),
    reviewScore: reviewScore(product),
    vendorTrustScore: computeVendorTrustScore(product),
    integrationMatch: tokenOverlap(
      requirements.preferredIntegrations ?? [],
      product.integrations,
    ),
    deploymentMatch: deploymentMatch(
      requirements.deploymentPreference,
      product.deploymentTypes,
    ),
  };
}

export function computeFinalScore(breakdown: ScoreBreakdown): number {
  const weighted =
    breakdown.industryMatch * WEIGHTS.industryMatch +
    breakdown.featureMatch * WEIGHTS.featureMatch +
    breakdown.budgetMatch * WEIGHTS.budgetMatch +
    breakdown.businessSizeMatch * WEIGHTS.businessSizeMatch +
    breakdown.popularityScore * WEIGHTS.popularityScore +
    breakdown.reviewScore * WEIGHTS.reviewScore +
    breakdown.vendorTrustScore * WEIGHTS.vendorTrustScore +
    breakdown.integrationMatch * WEIGHTS.integrationMatch +
    breakdown.deploymentMatch * WEIGHTS.deploymentMatch;

  return Math.min(100, Math.max(0, Math.round(weighted)));
}

export function buildWhyThis(breakdown: ScoreBreakdown, product: IntelligenceProduct): string[] {
  const reasons: string[] = [];
  if (breakdown.industryMatch >= 80)
    reasons.push(`Strong fit for ${product.category.name} use cases`);
  if (breakdown.featureMatch >= 75)
    reasons.push("Covers most of your required features");
  if (breakdown.budgetMatch >= 90)
    reasons.push("Within your stated budget range");
  if (breakdown.businessSizeMatch >= 85)
    reasons.push("Built for teams your size");
  if (breakdown.reviewScore >= 75)
    reasons.push("Highly rated by verified buyers");
  if (breakdown.vendorTrustScore >= 80)
    reasons.push("Verified vendor with strong marketplace trust");
  if (breakdown.integrationMatch >= 70)
    reasons.push("Supports your preferred integrations");
  if (reasons.length === 0)
    reasons.push("Balanced match across features, price, and vendor credibility");
  return reasons.slice(0, 4);
}

export function buildProsCons(product: IntelligenceProduct): { pros: string[]; cons: string[] } {
  const pros: string[] = [];
  const cons: string[] = [];

  const avg =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : 0;

  if (avg >= 4) pros.push("Consistently positive buyer reviews");
  if (product.features.length >= 5) pros.push(`Rich feature set (${product.features.length}+ capabilities)`);
  if (product.hasApiAccess) pros.push("API access for custom integrations");
  if (product.hasMobileApp) pros.push("Mobile app available");
  if (product.company.status === "APPROVED") pros.push("Admin-verified vendor");
  if (product.integrations.length > 0)
    pros.push(`Integrates with ${product.integrations.slice(0, 3).join(", ")}`);

  if (product.reviews.length < 3) cons.push("Limited review history on platform");
  if (!product.hasApiAccess) cons.push("No public API documented");
  if (product.price == null && product.pricingModel === "CUSTOM")
    cons.push("Custom pricing — may require sales call");
  if (product.deploymentTypes.length === 0) cons.push("Deployment options not specified");

  if (pros.length === 0) pros.push("Published on a verified B2B marketplace");
  if (cons.length === 0) cons.push("Evaluate with a demo before committing");

  return { pros: pros.slice(0, 4), cons: cons.slice(0, 3) };
}
