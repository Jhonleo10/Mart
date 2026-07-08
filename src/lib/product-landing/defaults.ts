import type { PricingModel } from "@prisma/client";
import {
  DEFAULT_LANDING_THEME,
  FOCUSED_PRODUCT_SECTION_ORDER,
  type LandingFeatureItem,
  type LandingPricingTier,
  type ProductLandingConfig,
} from "./types";

type ProductForLanding = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  pricingModel: PricingModel;
  price: number | null;
  features: string[];
  websiteUrl: string | null;
  demoUrl: string | null;
  supportEmail: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  images: { url: string; alt: string | null }[];
  category: { name: string };
  company: {
    name: string;
    slug: string;
    logo: string | null;
    website: string | null;
    contactEmail: string;
    contactPhone: string | null;
    description: string | null;
  };
  industries?: { industry: { name: string; slug: string } }[];
  reviews?: { rating: number; comment: string | null; user: { name: string | null } }[];
};

const FEATURE_ICONS = ["Zap", "Shield", "Layers", "BarChart3", "Users", "Globe", "Lock", "Sparkles"];

function featuresFromProduct(features: string[]): LandingFeatureItem[] {
  return features.map((f, i) => {
    const [title, ...rest] = f.includes("—") ? f.split("—") : f.includes(":") ? f.split(":") : [f];
    return {
      icon: FEATURE_ICONS[i % FEATURE_ICONS.length]!,
      title: title.trim(),
      description: rest.join("—").trim() || `Powerful capability built into ${title.trim()}.`,
    };
  });
}

function pricingTiersFromProduct(product: ProductForLanding): LandingPricingTier[] {
  const model = product.pricingModel;
  const price = product.price;

  if (model === "FREE") {
    return [
      {
        name: "Free",
        price: "₹0",
        description: "Get started at no cost",
        features: ["Core features included", "Community support"],
        ctaLabel: "Request Demo",
      },
    ];
  }

  if (model === "FREEMIUM") {
    return [
      {
        name: "Free",
        price: "₹0",
        description: "Essential tools to get started",
        features: ["Limited usage", "Basic support"],
        ctaLabel: "Start Free",
      },
      {
        name: "Pro",
        price: price ? `₹${price.toLocaleString("en-IN")}` : "Contact",
        period: price ? "/month" : undefined,
        description: "Full feature access",
        features: ["Unlimited usage", "Priority support", "Advanced analytics"],
        highlighted: true,
        ctaLabel: "Request Demo",
      },
    ];
  }

  if (model === "CUSTOM") {
    return [
      {
        name: "Enterprise",
        price: "Custom",
        description: "Tailored for your organization",
        features: ["Custom integrations", "Dedicated support", "SLA & onboarding"],
        highlighted: true,
        ctaLabel: "Contact Sales",
      },
    ];
  }

  return [
    {
      name: model === "ONE_TIME" ? "Lifetime" : "Standard",
      price: price ? `₹${price.toLocaleString("en-IN")}` : "Contact Sales",
      period: model === "SUBSCRIPTION" && price ? "/month" : undefined,
      description: `Flexible ${model.toLowerCase().replace("_", " ")} pricing`,
      features: product.features.slice(0, 4).length
        ? product.features.slice(0, 4)
        : ["All core features", "Email support", "Regular updates"],
      highlighted: true,
      ctaLabel: "Request Demo",
    },
  ];
}

function defaultFaqs(product: ProductForLanding) {
  return [
    {
      question: `What is ${product.name}?`,
      answer:
        product.shortDescription ||
        `${product.name} is a ${product.category.name} solution by ${product.company.name}.`,
    },
    {
      question: "How do I request a demo?",
      answer:
        "Click the Request Demo button on this page to schedule a personalized walkthrough with our team.",
    },
    {
      question: "Who is this product for?",
      answer: `${product.name} is designed for teams looking for modern ${product.category.name.toLowerCase()} software with reliable support from ${product.company.name}.`,
    },
  ];
}

function defaultComparison(product: ProductForLanding) {
  return [
    {
      title: "Built for modern teams",
      description: `${product.name} delivers a streamlined experience with features teams actually use every day.`,
    },
    {
      title: "Trusted vendor",
      description: `Backed by ${product.company.name}, a verified software vendor on Genius Mart.`,
    },
    {
      title: "Transparent pricing",
      description: `Clear ${product.pricingModel.toLowerCase().replace("_", " ")} model so you know what to expect before you commit.`,
    },
  ];
}

export function buildDefaultLandingConfig(product: ProductForLanding): ProductLandingConfig {
  const heroImage = product.images[0]?.url;
  const featureItems = featuresFromProduct(
    product.features.length
      ? product.features
      : [
          "Easy setup — Get started in minutes with guided onboarding",
          "Secure & reliable — Enterprise-grade security for your data",
          "Expert support — Responsive team when you need help",
        ],
  );

  const testimonials =
    product.reviews && product.reviews.length > 0
      ? product.reviews.slice(0, 3).map((r) => ({
          name: r.user.name ?? "Verified User",
          company: product.company.name,
          designation: "Customer",
          rating: r.rating,
          review: r.comment ?? "Great product experience.",
        }))
      : [];

  return {
    sectionOrder: [...FOCUSED_PRODUCT_SECTION_ORDER],
    theme: { ...DEFAULT_LANDING_THEME, heroBackgroundImage: heroImage },
    seo: {
      title: product.metaTitle ?? `${product.name} — ${product.category.name} Software`,
      description:
        product.metaDescription ??
        product.shortDescription.slice(0, 160) ??
        `Discover ${product.name} by ${product.company.name}. Request a demo today.`,
      focusKeywords: [product.name, product.category.name, product.company.name].join(", "),
      ogTitle: product.metaTitle ?? product.name,
      ogDescription: product.metaDescription ?? product.shortDescription,
      ogImage: heroImage ?? product.company.logo ?? undefined,
    },
    sections: {
      hero: {
        enabled: true,
        tagline: product.shortDescription.split(".")[0] ?? product.name,
        shortDescription: product.shortDescription,
        primaryCtaLabel: "Request Demo",
        secondaryCtaLabel: "Visit Website",
        logoUrl: product.company.logo ?? undefined,
        heroImageUrl: heroImage,
      },
      trustedBy: { enabled: false, clientLogos: [], partnerLogos: [] },
      overview: {
        enabled: true,
        detailedDescription: product.fullDescription,
        keyBenefits: product.features.slice(0, 5).length
          ? product.features.slice(0, 5)
          : [
              "Increase team productivity",
              "Reduce operational overhead",
              "Scale with your business",
            ],
        whyChoose: `Choose ${product.name} for a proven ${product.category.name} solution with dedicated support from ${product.company.name}.`,
      },
      features: { enabled: true, items: featureItems },
      gallery: {
        enabled: product.images.length > 0,
        images: product.images.map((img, i) => ({
          url: img.url,
          alt: img.alt ?? `${product.name} screenshot ${i + 1}`,
          caption: i === 0 ? "Dashboard preview" : undefined,
        })),
      },
      industries: {
        enabled: false,
        highlightSlugs: product.industries?.map((i) => i.industry.slug) ?? [],
      },
      pricing: {
        enabled: true,
        showCards: true,
        tiers: pricingTiersFromProduct(product),
      },
      comparison: {
        enabled: true,
        headline: `Why choose ${product.name}?`,
        items: defaultComparison(product),
      },
      testimonials: { enabled: testimonials.length > 0, items: testimonials },
      faqs: { enabled: true, items: defaultFaqs(product) },
      cta: {
        enabled: true,
        headline: `Ready to try ${product.name}?`,
        subheadline: "Book a personalized demo or contact our team today.",
        showDemoForm: true,
        showContactForm: true,
        showWebsiteLink: Boolean(product.websiteUrl ?? product.company.website),
      },
      relatedProducts: { enabled: false },
      footer: {
        enabled: true,
        showVendorInfo: false,
        showContact: true,
        socialLinks: [],
        privacyPolicyUrl: "/privacy-policy",
      },
    },
  };
}

export function parseLandingConfig(raw: unknown): ProductLandingConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as ProductLandingConfig;
  if (!obj.sectionOrder || !obj.sections || !obj.theme) return null;
  return obj;
}
