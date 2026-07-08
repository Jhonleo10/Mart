import type { IntelligenceProduct, ComparisonDimension, IntelligentComparison } from "@/lib/intelligence/types";
import { computeVendorTrustScore } from "@/lib/intelligence/vendor-trust";

function avgRating(p: IntelligenceProduct): number {
  if (p.reviews.length === 0) return 0;
  return p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length;
}

function compareBool(a: boolean, b: boolean): "a" | "b" | "tie" {
  if (a === b) return "tie";
  return a ? "a" : "b";
}

function compareNum(a: number, b: number, higherBetter = true): "a" | "b" | "tie" {
  if (a === b) return "tie";
  if (higherBetter) return a > b ? "a" : "b";
  return a < b ? "a" : "b";
}

export function buildIntelligentComparison(
  productA: IntelligenceProduct,
  productB: IntelligenceProduct,
): IntelligentComparison {
  const trustA = computeVendorTrustScore(productA);
  const trustB = computeVendorTrustScore(productB);
  const ratingA = avgRating(productA);
  const ratingB = avgRating(productB);

  const dimensions: ComparisonDimension[] = [
    {
      key: "price",
      label: "Price",
      productA: productA.price != null ? `₹${productA.price.toLocaleString()}` : productA.pricingModel,
      productB: productB.price != null ? `₹${productB.price.toLocaleString()}` : productB.pricingModel,
      winner:
        productA.price != null && productB.price != null
          ? compareNum(productA.price, productB.price, false)
          : "tie",
    },
    {
      key: "features",
      label: "Feature count",
      productA: productA.features.length,
      productB: productB.features.length,
      winner: compareNum(productA.features.length, productB.features.length),
    },
    {
      key: "integrations",
      label: "Integrations",
      productA: (productA.integrations ?? []).length > 0 ? (productA.integrations ?? []).join(", ") : "—",
      productB: (productB.integrations ?? []).length > 0 ? (productB.integrations ?? []).join(", ") : "—",
      winner: compareNum((productA.integrations ?? []).length, (productB.integrations ?? []).length),
    },
    {
      key: "security",
      label: "Security features",
      productA: (productA.securityFeatures ?? []).length > 0 ? (productA.securityFeatures ?? []).join(", ") : "Standard",
      productB: (productB.securityFeatures ?? []).length > 0 ? (productB.securityFeatures ?? []).join(", ") : "Standard",
      winner: compareNum((productA.securityFeatures ?? []).length, (productB.securityFeatures ?? []).length),
    },
    {
      key: "cloud",
      label: "Cloud / SaaS",
      productA: (productA.deploymentTypes ?? []).some((d) => /cloud|saas/i.test(d)),
      productB: (productB.deploymentTypes ?? []).some((d) => /cloud|saas/i.test(d)),
      winner: compareBool(
        (productA.deploymentTypes ?? []).some((d) => /cloud|saas/i.test(d)),
        (productB.deploymentTypes ?? []).some((d) => /cloud|saas/i.test(d)),
      ),
    },
    {
      key: "onprem",
      label: "On-premise",
      productA: (productA.deploymentTypes ?? []).some((d) => /on.?prem/i.test(d)),
      productB: (productB.deploymentTypes ?? []).some((d) => /on.?prem/i.test(d)),
      winner: compareBool(
        (productA.deploymentTypes ?? []).some((d) => /on.?prem/i.test(d)),
        (productB.deploymentTypes ?? []).some((d) => /on.?prem/i.test(d)),
      ),
    },
    {
      key: "mobile",
      label: "Mobile support",
      productA: productA.hasMobileApp ?? false,
      productB: productB.hasMobileApp ?? false,
      winner: compareBool(productA.hasMobileApp ?? false, productB.hasMobileApp ?? false),
    },
    {
      key: "api",
      label: "API access",
      productA: productA.hasApiAccess ?? false,
      productB: productB.hasApiAccess ?? false,
      winner: compareBool(productA.hasApiAccess ?? false, productB.hasApiAccess ?? false),
    },
    {
      key: "support",
      label: "Review volume",
      productA: productA.reviews.length,
      productB: productB.reviews.length,
      winner: compareNum(productA.reviews.length, productB.reviews.length),
    },
    {
      key: "reviews",
      label: "Avg. rating",
      productA: ratingA > 0 ? ratingA.toFixed(1) : "—",
      productB: ratingB > 0 ? ratingB.toFixed(1) : "—",
      winner: compareNum(ratingA, ratingB),
    },
    {
      key: "popularity",
      label: "Popularity (views)",
      productA: productA.viewCount,
      productB: productB.viewCount,
      winner: compareNum(productA.viewCount, productB.viewCount),
    },
    {
      key: "trust",
      label: "Vendor trust",
      productA: trustA,
      productB: trustB,
      winner: compareNum(trustA, trustB),
    },
  ];

  let scoreA = 0;
  let scoreB = 0;
  for (const d of dimensions) {
    if (d.winner === "a") scoreA += 1;
    if (d.winner === "b") scoreB += 1;
  }

  const winnerIsA = scoreA >= scoreB;
  const winner = winnerIsA ? productA : productB;
  const loser = winnerIsA ? productB : productA;

  const whyWinner: string[] = [];
  if (compareNum(ratingA, ratingB) === (winnerIsA ? "a" : "b") && Math.max(ratingA, ratingB) > 0)
    whyWinner.push("Higher buyer satisfaction rating");
  if (compareNum(trustA, trustB) === (winnerIsA ? "a" : "b"))
    whyWinner.push("Stronger vendor trust signals");
  if (compareNum(productA.features.length, productB.features.length) === (winnerIsA ? "a" : "b"))
    whyWinner.push("Broader feature coverage");
  if (whyWinner.length === 0) whyWinner.push("Better overall balance across compared dimensions");

  const prosA = [
    ...(ratingA >= 4 ? ["Well-rated by buyers"] : []),
    ...((productA.hasApiAccess ?? false) ? ["API available"] : []),
    ...((productA.integrations ?? []).length > 2 ? ["Rich integration ecosystem"] : []),
  ];
  const prosB = [
    ...(ratingB >= 4 ? ["Well-rated by buyers"] : []),
    ...((productB.hasApiAccess ?? false) ? ["API available"] : []),
    ...((productB.integrations ?? []).length > 2 ? ["Rich integration ecosystem"] : []),
  ];

  const consA = [
    ...(productA.reviews.length < 3 ? ["Fewer platform reviews"] : []),
    ...(productA.price != null && productB.price != null && productA.price > productB.price
      ? ["Higher listed price"]
      : []),
  ];
  const consB = [
    ...(productB.reviews.length < 3 ? ["Fewer platform reviews"] : []),
    ...(productA.price != null && productB.price != null && productB.price > productA.price
      ? ["Higher listed price"]
      : []),
  ];

  return {
    productA: { id: productA.id, slug: productA.slug, name: productA.name },
    productB: { id: productB.id, slug: productB.slug, name: productB.name },
    dimensions,
    winnerId: winner.id,
    winnerName: winner.name,
    whyWinner,
    recommendedFor: {
      productA:
        (productA.suitableFor ?? []).length > 0
          ? (productA.suitableFor ?? [])
          : [`${productA.category.name} teams`, "SMBs evaluating options"],
      productB:
        (productB.suitableFor ?? []).length > 0
          ? (productB.suitableFor ?? [])
          : [`${productB.category.name} teams`, "Teams needing alternatives"],
    },
    pros: { productA: prosA.length ? prosA : ["Solid marketplace listing"], productB: prosB.length ? prosB : ["Solid marketplace listing"] },
    cons: { productA: consA.length ? consA : ["Compare via demo"], productB: consB.length ? consB : ["Compare via demo"] },
    overallVerdict: `${winner.name} leads this comparison (${Math.max(scoreA, scoreB)} vs ${Math.min(scoreA, scoreB)} dimension wins). ${loser.name} remains a viable alternative depending on your budget and integration needs.`,
    scoreA,
    scoreB,
  };
}
