/** Modular product SEO landing page configuration. */

export const LANDING_SECTION_IDS = [
  "hero",
  "trustedBy",
  "overview",
  "features",
  "gallery",
  "industries",
  "pricing",
  "comparison",
  "testimonials",
  "faqs",
  "cta",
  "relatedProducts",
  "footer",
] as const;

export type LandingSectionId = (typeof LANDING_SECTION_IDS)[number];

/** Focused product-only page — no marketplace cross-sell sections. */
export const FOCUSED_PRODUCT_SECTION_ORDER: LandingSectionId[] = [
  "hero",
  "overview",
  "features",
  "gallery",
  "pricing",
  "comparison",
  "testimonials",
  "faqs",
  "cta",
  "footer",
];

/** Sections excluded from the public product SEO page. */
export const EXCLUDED_PRODUCT_LANDING_SECTIONS: LandingSectionId[] = [
  "relatedProducts",
  "industries",
  "trustedBy",
];

export type LandingFontFamily = "plus-jakarta" | "dm-sans" | "inter" | "system";
export type LandingButtonStyle = "rounded" | "pill" | "square";
export type LandingColorMode = "light" | "dark";

export interface LandingTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  buttonStyle: LandingButtonStyle;
  borderRadius: "sm" | "md" | "lg";
  fontFamily: LandingFontFamily;
  colorMode: LandingColorMode;
  heroBackground: "gradient" | "solid" | "image";
  heroBackgroundImage?: string;
}

export interface LandingSeo {
  title: string;
  description: string;
  focusKeywords: string;
  canonicalUrl?: string;
  ogTitle: string;
  ogDescription: string;
  ogImage?: string;
}

export interface LandingHero {
  enabled: boolean;
  tagline: string;
  shortDescription: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  logoUrl?: string;
  heroImageUrl?: string;
}

export interface LandingTrustedLogo {
  name: string;
  imageUrl: string;
}

export interface LandingTrustedBy {
  enabled: boolean;
  clientLogos: LandingTrustedLogo[];
  partnerLogos: LandingTrustedLogo[];
}

export interface LandingOverview {
  enabled: boolean;
  detailedDescription: string;
  keyBenefits: string[];
  whyChoose: string;
}

export interface LandingFeatureItem {
  icon: string;
  title: string;
  description: string;
}

export interface LandingFeatures {
  enabled: boolean;
  items: LandingFeatureItem[];
}

export interface LandingGallery {
  enabled: boolean;
  images: { url: string; alt: string; caption?: string }[];
}

export interface LandingIndustries {
  enabled: boolean;
  /** Industry slugs to highlight; empty = use product-linked industries */
  highlightSlugs: string[];
}

export interface LandingPricingTier {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  ctaLabel: string;
}

export interface LandingPricing {
  enabled: boolean;
  showCards: boolean;
  tiers: LandingPricingTier[];
}

export interface LandingComparisonItem {
  title: string;
  description: string;
}

export interface LandingComparison {
  enabled: boolean;
  headline: string;
  items: LandingComparisonItem[];
}

export interface LandingTestimonial {
  name: string;
  company: string;
  designation: string;
  rating: number;
  review: string;
}

export interface LandingTestimonials {
  enabled: boolean;
  items: LandingTestimonial[];
}

export interface LandingFaqItem {
  question: string;
  answer: string;
}

export interface LandingFaqs {
  enabled: boolean;
  items: LandingFaqItem[];
}

export interface LandingCta {
  enabled: boolean;
  headline: string;
  subheadline: string;
  showDemoForm: boolean;
  showContactForm: boolean;
  showWebsiteLink: boolean;
}

export interface LandingRelatedProducts {
  enabled: boolean;
}

export interface LandingFooter {
  enabled: boolean;
  showVendorInfo: boolean;
  showContact: boolean;
  socialLinks: { platform: string; url: string }[];
  privacyPolicyUrl?: string;
}

export interface LandingSections {
  hero: LandingHero;
  trustedBy: LandingTrustedBy;
  overview: LandingOverview;
  features: LandingFeatures;
  gallery: LandingGallery;
  industries: LandingIndustries;
  pricing: LandingPricing;
  comparison: LandingComparison;
  testimonials: LandingTestimonials;
  faqs: LandingFaqs;
  cta: LandingCta;
  relatedProducts: LandingRelatedProducts;
  footer: LandingFooter;
}

export interface ProductLandingConfig {
  sectionOrder: LandingSectionId[];
  sections: LandingSections;
  theme: LandingTheme;
  seo: LandingSeo;
}

export const DEFAULT_LANDING_THEME: LandingTheme = {
  primaryColor: "#2563eb",
  secondaryColor: "#0f172a",
  accentColor: "#10b981",
  buttonStyle: "rounded",
  borderRadius: "lg",
  fontFamily: "plus-jakarta",
  colorMode: "light",
  heroBackground: "gradient",
};

export const DEFAULT_SECTION_ORDER: LandingSectionId[] = [...LANDING_SECTION_IDS];
