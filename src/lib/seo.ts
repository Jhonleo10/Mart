import type { Metadata } from "next";
import { resolveAppBaseUrl } from "@/lib/app-url";
import { getSiteConfig } from "@/lib/site-config";

export interface SeoInput {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  type?: "website" | "article";
  noIndex?: boolean;
}

export async function buildPageMetadata(input: SeoInput): Promise<Metadata> {
  const site = await getSiteConfig();
  const baseUrl = await resolveAppBaseUrl();
  const canonical = `${baseUrl}${input.path.startsWith("/") ? input.path : `/${input.path}`}`;
  const image = input.image?.startsWith("http")
    ? input.image
    : input.image
      ? `${baseUrl}${input.image}`
      : `${baseUrl}/genius-mart-logo.svg`;

  const title = input.title.includes(site.name) ? input.title : `${input.title} | ${site.name}`;

  return {
    title,
    description: input.description,
    alternates: { canonical },
    robots: input.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description: input.description,
      url: canonical,
      siteName: site.name,
      type: input.type ?? "website",
      images: [{ url: image, width: 1200, height: 630, alt: input.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: input.description,
      images: [image],
    },
  };
}

export function productJsonLd(product: {
  name: string;
  shortDescription: string;
  slug: string;
  pricingModel: string;
  price: number | null;
  company: { name: string };
  category: { name: string };
  images?: { url: string }[];
  reviews?: { rating: number }[];
}) {
  const avgRating =
    product.reviews && product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: product.name,
    description: product.shortDescription,
    applicationCategory: product.category.name,
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: product.price ?? 0,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
    },
    brand: { "@type": "Brand", name: product.company.name },
    ...(product.images?.[0]?.url ? { image: product.images[0].url } : {}),
    ...(avgRating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: avgRating.toFixed(1),
            reviewCount: product.reviews!.length,
          },
        }
      : {}),
  };
}

export function organizationJsonLd(company: {
  name: string;
  description: string | null;
  website: string | null;
  logo: string | null;
  slug: string;
  landingUrl?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    description: company.description ?? undefined,
    url: company.landingUrl ?? company.website ?? undefined,
    logo: company.logo ?? undefined,
  };
}

export async function webSiteJsonLd() {
  const site = await getSiteConfig();
  const baseUrl = await resolveAppBaseUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: baseUrl,
    description: `Discover, compare, and book demos for B2B software on ${site.name}.`,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/products?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export async function webPageJsonLd(page: { name: string; description: string; url: string }) {
  const site = await getSiteConfig();
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.name,
    description: page.description,
    url: page.url,
    isPartOf: {
      "@type": "WebSite",
      name: site.name,
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[], baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${baseUrl}${item.path}`,
    })),
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
