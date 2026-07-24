import type { ParsedSearchQuery, UserRequirements } from "@/lib/intelligence/types";
import { expandSearchTerms, normalizeToken } from "@/lib/intelligence/synonyms";

export const BUDGET_PRESETS = [
  { value: 2000, label: "₹2K" },
  { value: 5000, label: "₹5K" },
  { value: 10000, label: "₹10K" },
  { value: 25000, label: "₹25K" },
  { value: 50000, label: "₹50K" },
  { value: 100000, label: "₹1L+" },
] as const;

/** Turn saved requirements into a natural-language smart search query. */
export function buildRequirementSearchQuery(requirements: UserRequirements): string {
  const parts: string[] = [];

  if (requirements.industry) {
    parts.push(`${requirements.industry} software`);
  }

  const features = requirements.requiredFeatures ?? [];
  if (features.length > 0) {
    parts.push(features.slice(0, 4).join(" "));
  }

  const integrations = requirements.preferredIntegrations ?? [];
  if (integrations.length > 0) {
    parts.push(integrations.slice(0, 2).join(" "));
  }

  if (requirements.deploymentPreference && requirements.deploymentPreference !== "any") {
    const deployLabel =
      requirements.deploymentPreference === "cloud"
        ? "cloud SaaS"
        : requirements.deploymentPreference === "on_premise"
          ? "on-premise"
          : "hybrid deployment";
    parts.push(deployLabel);
  }

  if (requirements.budgetMax) {
    parts.push(`under ${requirements.budgetMax}`);
  }

  return parts.join(" ").trim();
}

export function enrichParsedSearch(
  parsed: ParsedSearchQuery,
  requirements?: UserRequirements,
): ParsedSearchQuery {
  if (!requirements) return parsed;

  const extraTerms = new Set(parsed.terms);
  if (requirements.industry) {
    expandSearchTerms(requirements.industry.toLowerCase()).forEach((t) => extraTerms.add(t));
  }
  for (const feature of requirements.requiredFeatures ?? []) {
    expandSearchTerms(feature.toLowerCase()).forEach((t) => extraTerms.add(t));
  }

  return {
    ...parsed,
    terms: [...extraTerms],
    maxPrice: parsed.maxPrice ?? requirements.budgetMax,
    featureHints: [
      ...new Set([
        ...parsed.featureHints,
        ...(requirements.requiredFeatures ?? []).map((f) => normalizeToken(f)),
      ]),
    ],
    integrationHints: [
      ...new Set([
        ...parsed.integrationHints,
        ...(requirements.preferredIntegrations ?? []).map((i) => normalizeToken(i)),
      ]),
    ],
    categoryHint: parsed.categoryHint ?? industryToCategoryHint(requirements.industry),
  };
}

function industryToCategoryHint(industry?: string): string | undefined {
  if (!industry) return undefined;
  const map: Record<string, string> = {
    retail: "retail",
    healthcare: "healthcare",
    finance: "finance",
    manufacturing: "erp",
    education: "education",
    saas: "crm",
    logistics: "logistics",
  };
  return map[normalizeToken(industry).replace(/\s+/g, "")];
}

export function getRequirementSummaryChips(requirements: UserRequirements): string[] {
  const chips: string[] = [];
  if (requirements.industry) chips.push(requirements.industry);
  if (requirements.businessSize) {
    const sizeLabels: Record<string, string> = {
      solo: "Solo",
      small: "2–50 team",
      medium: "51–500 team",
      enterprise: "Enterprise",
    };
    chips.push(sizeLabels[requirements.businessSize] ?? requirements.businessSize);
  }
  if (requirements.budgetMax) chips.push(`≤ ₹${requirements.budgetMax.toLocaleString()}/mo`);
  for (const f of (requirements.requiredFeatures ?? []).slice(0, 3)) chips.push(f);
  for (const i of (requirements.preferredIntegrations ?? []).slice(0, 2)) chips.push(i);
  if (requirements.deploymentPreference && requirements.deploymentPreference !== "any") {
    chips.push(requirements.deploymentPreference.replace("_", " "));
  }
  return chips;
}

export function computeRequirementCompleteness(requirements: UserRequirements): number {
  let score = 0;
  if (requirements.industry) score += 25;
  if (requirements.businessSize) score += 20;
  if (requirements.budgetMax) score += 15;
  if ((requirements.requiredFeatures?.length ?? 0) > 0) score += 25;
  if ((requirements.preferredIntegrations?.length ?? 0) > 0) score += 10;
  if (requirements.deploymentPreference && requirements.deploymentPreference !== "any") score += 5;
  return Math.min(100, score);
}

const STEP_IDS = ["industry", "size", "budget", "features", "integrations", "deployment", "country"] as const;
export type RequirementStepId = (typeof STEP_IDS)[number];

export function validateRequirementStep(
  stepId: RequirementStepId,
  requirements: UserRequirements,
): string | null {
  switch (stepId) {
    case "industry":
      return requirements.industry ? null : "Select your industry to improve search relevance.";
    case "size":
      return requirements.businessSize ? null : "Choose your team size so we can match suitable products.";
    case "budget":
      return requirements.budgetMax && requirements.budgetMax > 0
        ? null
        : "Set a monthly budget to filter overpriced options.";
    case "features":
      return (requirements.requiredFeatures?.length ?? 0) > 0
        ? null
        : "Pick at least one must-have feature for sharper results.";
    case "integrations":
    case "deployment":
      return null;
    default:
      return null;
  }
}

export function profileToRequirements(profile: {
  industry: string | null;
  businessSize: string | null;
  budgetMax: number | null;
  requiredFeatures: string[];
  preferredIntegrations: string[];
  companyType: string | null;
  deploymentPreference: string | null;
  country: string | null;
}): UserRequirements {
  return {
    industry: profile.industry ?? undefined,
    businessSize: profile.businessSize ?? undefined,
    budgetMax: profile.budgetMax ?? undefined,
    requiredFeatures: profile.requiredFeatures,
    preferredIntegrations: profile.preferredIntegrations,
    companyType: profile.companyType ?? undefined,
    deploymentPreference: profile.deploymentPreference ?? undefined,
    country: profile.country ?? undefined,
  };
}
