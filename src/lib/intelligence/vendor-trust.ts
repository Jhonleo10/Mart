import type { IntelligenceProduct } from "@/lib/intelligence/types";

/** Heuristic vendor trust score 0–100 — no external APIs */
export function computeVendorTrustScore(product: IntelligenceProduct): number {
  let score = 50;

  if (product.company.status === "APPROVED") score += 20;
  if (product.featured) score += 8;
  if (product.viewCount > 100) score += 6;
  if (product.viewCount > 500) score += 4;
  if (product.reviews.length >= 3) score += 8;
  if (product.reviews.length >= 10) score += 4;

  const avg =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : 0;
  if (avg >= 4) score += 10;
  else if (avg >= 3.5) score += 5;

  if (product.company.industry) score += 3;

  return Math.min(100, Math.round(score));
}
