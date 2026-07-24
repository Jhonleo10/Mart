export type BusinessSize = "solo" | "small" | "medium" | "enterprise";
export type DeploymentPreference = "cloud" | "on_premise" | "hybrid" | "any";

export interface UserRequirements {
  industry?: string;
  businessSize?: BusinessSize | string;
  budgetMax?: number;
  requiredFeatures?: string[];
  preferredIntegrations?: string[];
  companyType?: string;
  deploymentPreference?: DeploymentPreference | string;
  country?: string;
}

export interface ScoreBreakdown {
  industryMatch: number;
  featureMatch: number;
  budgetMatch: number;
  businessSizeMatch: number;
  popularityScore: number;
  reviewScore: number;
  vendorTrustScore: number;
  integrationMatch: number;
  deploymentMatch: number;
}

export interface ProductRecommendation {
  productId: string;
  slug: string;
  name: string;
  shortDescription: string;
  companyName: string;
  companySlug: string;
  companyLogo: string | null;
  categoryName: string;
  price: number | null;
  pricingModel: string;
  imageUrl: string | null;
  avgRating: number;
  reviewCount: number;
  matchScore: number;
  breakdown: ScoreBreakdown;
  whyThis: string[];
  pros: string[];
  cons: string[];
  suitableFor: string[];
  alternatives: { id: string; slug: string; name: string; matchScore: number }[];
  /** When set, shown instead of a percentage match badge (e.g. "Suggested", "Trending"). */
  matchLabel?: string;
  /** True when scored from requirement profile; false for behavioral/popular picks. */
  profileScored?: boolean;
}

export type RecommendationSource = "profile" | "behavioral" | "popular";

export interface UserRecommendationsResult {
  recommendations: ProductRecommendation[];
  hasProfile: boolean;
  source: RecommendationSource;
}

export interface ParsedSearchQuery {
  raw: string;
  terms: string[];
  maxPrice?: number;
  minPrice?: number;
  categoryHint?: string;
  featureHints: string[];
  integrationHints: string[];
}

export interface SmartSearchResult {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  categoryName: string;
  companyName: string;
  companySlug: string;
  companyLogo: string | null;
  price: number | null;
  pricingModel: string;
  imageUrl: string | null;
  avgRating: number;
  reviewCount: number;
  relevanceScore: number;
  matchReasons: string[];
}

export interface ComparisonDimension {
  key: string;
  label: string;
  productA: string | boolean | number | null;
  productB: string | boolean | number | null;
  winner: "a" | "b" | "tie";
}

export interface IntelligentComparison {
  productA: { id: string; slug: string; name: string };
  productB: { id: string; slug: string; name: string };
  dimensions: ComparisonDimension[];
  winnerId: string;
  winnerName: string;
  whyWinner: string[];
  recommendedFor: { productA: string[]; productB: string[] };
  pros: { productA: string[]; productB: string[] };
  cons: { productA: string[]; productB: string[] };
  overallVerdict: string;
  scoreA: number;
  scoreB: number;
}

export interface ReviewSummary {
  overallSummary: string;
  thingsUsersLove: string[];
  commonComplaints: string[];
  mentionedFeatures: { feature: string; count: number }[];
  bestSuitedFor: string[];
  overallVerdict: string;
  sentimentScore: number;
  reviewCount: number;
  avgRating: number;
}

export type IntelligenceProduct = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  pricingModel: string;
  price: number | null;
  createdAt: Date;
  features: string[];
  integrations: string[];
  deploymentTypes: string[];
  hasMobileApp: boolean;
  hasApiAccess: boolean;
  securityFeatures: string[];
  suitableFor: string[];
  businessSizes: string[];
  viewCount: number;
  clickCount: number;
  featured: boolean;
  category: { name: string; slug: string };
  company: {
    name: string;
    slug: string;
    logo: string | null;
    status: string;
    industry: string | null;
  };
  images: { url: string }[];
  reviews: { rating: number; comment: string | null }[];
  industries?: { industry: { name: string; slug: string } }[];
  tags?: { tag: { name: string; slug: string } }[];
};
